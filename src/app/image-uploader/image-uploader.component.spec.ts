import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploaderComponent } from './image-uploader.component';
import { ImageCompressionService } from '../image-compression.service';
import { FileStatusUpdate, OutputFormat, ProcessedFile } from '../image-processing.model';
import { of } from 'rxjs';

vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

describe('ImageUploaderComponent', () => {
  let component: ImageUploaderComponent;
  let fixture: ComponentFixture<ImageUploaderComponent>;
  let compressionServiceMock: Partial<ImageCompressionService>;

  beforeEach(async () => {
    compressionServiceMock = {
      getOptionsByPreset: vi
        .fn()
        .mockReturnValue({ quality: 0.6, maxWidthOrHeight: 1600, resizeMode: 'auto' }),
      compressImagesWithProgress: vi.fn(),
      generateZip: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ImageUploaderComponent],
      providers: [{ provide: ImageCompressionService, useValue: compressionServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call downloadFile when downloadSingle is called with a completed item', () => {
    // Mock downloadFile to avoid actual DOM manipulation
    const downloadFileSpy = vi.spyOn(
      component as unknown as { downloadFile: (url: string, name: string) => void },
      'downloadFile',
    );

    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const mockItem: ProcessedFile = {
      id: '1',
      file: mockFile,
      status: 'done',
      progress: 100,
      result: {
        originalFile: mockFile,
        compressedFile: new File([''], 'test_compressed.png', { type: 'image/png' }),
        originalSize: 100,
        compressedSize: 50,
        savedPercentage: 50,
        originalUrl: 'blob:orig',
        compressedUrl: 'blob:compressed',
      },
    };

    component.downloadSingle(mockItem);

    expect(downloadFileSpy).toHaveBeenCalledWith('blob:compressed', 'test_compressed.png');
  });

  it('should not call downloadFile when downloadSingle is called with an incomplete item', () => {
    const downloadFileSpy = vi.spyOn(
      component as unknown as { downloadFile: (url: string, name: string) => void },
      'downloadFile',
    );

    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const mockItem: ProcessedFile = {
      id: '1',
      file: mockFile,
      status: 'compressing',
      progress: 50,
    };

    component.downloadSingle(mockItem);

    expect(downloadFileSpy).not.toHaveBeenCalled();
  });

  it('should update selectedFormat and pass it to service', () => {
    const format: OutputFormat = 'image/webp';
    component.setFormat(format);
    expect(component.selectedFormat()).toBe(format);

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const spy = vi
      .spyOn(compressionServiceMock as ImageCompressionService, 'compressImagesWithProgress')
      .mockReturnValue(of({} as FileStatusUpdate));

    // Truy cập private method để test
    (component as unknown as { processFiles: (files: File[]) => void }).processFiles([mockFile]);

    expect(spy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ format: 'image/webp' }),
      expect.any(Number),
    );
  });

  it('should update resize options and pass them to service', () => {
    component.setResizeMode('width');
    component.resizeWidth.set(800);

    expect(component.selectedResizeMode()).toBe('width');
    expect(component.resizeWidth()).toBe(800);

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const spy = vi
      .spyOn(compressionServiceMock as ImageCompressionService, 'compressImagesWithProgress')
      .mockReturnValue(of({} as FileStatusUpdate));

    // Truy cập private method để test
    (component as unknown as { processFiles: (files: File[]) => void }).processFiles([mockFile]);

    expect(spy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        resizeMode: 'width',
        resizeWidth: 800,
      }),
      expect.any(Number),
    );
  });
});
