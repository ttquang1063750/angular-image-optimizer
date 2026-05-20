import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UploaderStateService } from './uploader-state.service';
import { ImageCompressionService } from './image-compression.service';
import {
  CompressionOptions,
  FileStatusUpdate,
  ProcessedFile,
} from './image-processing.model';

vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

describe('UploaderStateService', () => {
  let service: UploaderStateService;
  let compressionMock: Partial<ImageCompressionService>;

  const baseOptions: CompressionOptions = {
    quality: 0.6,
    maxWidthOrHeight: 1600,
    resizeMode: 'auto',
  };

  beforeEach(() => {
    compressionMock = {
      compressImagesWithProgress: vi.fn().mockReturnValue(of({} as FileStatusUpdate)),
      generateZip: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ImageCompressionService, useValue: compressionMock }],
    });
    service = TestBed.inject(UploaderStateService);
  });

  it('addFiles bỏ qua mảng rỗng', () => {
    service.addFiles([], baseOptions);
    expect(service.processedFiles().length).toBe(0);
    expect(service.isCompressing()).toBe(false);
  });

  it('addFiles thêm file vào state và gọi compression service', () => {
    const file = new File([''], 'a.jpg', { type: 'image/jpeg' });
    service.addFiles([file], baseOptions);

    expect(service.processedFiles().length).toBe(1);
    expect(service.processedFiles()[0].status).toBe('queued');
    expect(compressionMock.compressImagesWithProgress).toHaveBeenCalled();
  });

  it('markSettingsChanged chỉ set true khi đã có file', () => {
    service.markSettingsChanged();
    expect(service.settingsChanged()).toBe(false);

    service.processedFiles.set([
      {
        id: '1',
        file: new File([''], 'a.jpg'),
        status: 'done',
        progress: 100,
      },
    ]);
    service.markSettingsChanged();
    expect(service.settingsChanged()).toBe(true);
  });

  it('removeFile xóa file và revoke compressedUrl', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const mockFile = new File([''], 'a.jpg');
    const item: ProcessedFile = {
      id: 'abc',
      file: mockFile,
      status: 'done',
      progress: 100,
      result: {
        originalFile: mockFile,
        compressedFile: new File([''], 'a.jpg'),
        originalSize: 100,
        compressedSize: 50,
        savedPercentage: 50,
        compressedUrl: 'blob:test',
      },
    };
    service.processedFiles.set([item]);

    service.removeFile('abc');

    expect(service.processedFiles().length).toBe(0);
    expect(revokeSpy).toHaveBeenCalledWith('blob:test');
    revokeSpy.mockRestore();
  });

  it('clearAll xóa toàn bộ và reset settingsChanged', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    service.processedFiles.set([
      {
        id: '1',
        file: new File([''], 'a.jpg'),
        status: 'done',
        progress: 100,
      },
    ]);
    service.settingsChanged.set(true);

    service.clearAll();

    expect(service.processedFiles().length).toBe(0);
    expect(service.settingsChanged()).toBe(false);
    revokeSpy.mockRestore();
  });

  it('openComparison chỉ mở khi file đã done', () => {
    const mockFile = new File([''], 'a.jpg');
    const queued: ProcessedFile = { id: '1', file: mockFile, status: 'queued', progress: 0 };
    service.openComparison(queued);
    expect(service.comparingFile()).toBeNull();

    const done: ProcessedFile = {
      ...queued,
      status: 'done',
      progress: 100,
      result: {
        originalFile: mockFile,
        compressedFile: mockFile,
        originalSize: 1,
        compressedSize: 1,
        savedPercentage: 0,
        compressedUrl: 'blob:x',
      },
    };
    service.openComparison(done);
    expect(service.comparingFile()).toBe(done);
    expect(service.comparisonSliderValue()).toBe(50);
  });

  it('completedCount đếm số file done', () => {
    service.processedFiles.set([
      { id: '1', file: new File([''], 'a'), status: 'done', progress: 100 },
      { id: '2', file: new File([''], 'b'), status: 'compressing', progress: 50 },
      { id: '3', file: new File([''], 'c'), status: 'done', progress: 100 },
    ]);
    expect(service.completedCount()).toBe(2);
  });

  it('createBlobUrl cache theo File reference', () => {
    const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:cached');
    const file = new File([''], 'a.jpg');

    const url1 = service.createBlobUrl(file);
    const url2 = service.createBlobUrl(file);

    expect(url1).toBe(url2);
    expect(createSpy).toHaveBeenCalledTimes(1);
    createSpy.mockRestore();
  });
});
