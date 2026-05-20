import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploaderComponent } from './image-uploader.component';
import { ImageCompressionService } from '../image-compression.service';
import { ProcessedFile } from '../image-processing.model';

describe('ImageUploaderComponent', () => {
  let component: ImageUploaderComponent;
  let fixture: ComponentFixture<ImageUploaderComponent>;
  let compressionServiceMock: Partial<ImageCompressionService>;

  beforeEach(async () => {
    compressionServiceMock = {
      getOptionsByPreset: vi.fn(),
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
});
