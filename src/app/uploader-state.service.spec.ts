import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UploaderStateService } from './uploader-state.service';
import { ImageCompressionService } from './image-compression.service';
import { SettingsStateService } from './settings-state.service';
import { FileStatusUpdate, ProcessedFile } from './image-processing.model';

vi.mock('heic-to', () => ({
  heicTo: vi.fn(),
  isHeic: vi.fn(),
}));

describe('UploaderStateService', () => {
  let service: UploaderStateService;
  let compressionMock: Partial<ImageCompressionService>;

  beforeEach(() => {
    compressionMock = {
      getOptionsByPreset: vi
        .fn()
        .mockReturnValue({ quality: 0.6, maxWidthOrHeight: 1600, resizeMode: 'auto' }),
      compressImagesWithProgress: vi.fn().mockReturnValue(of({} as FileStatusUpdate)),
      generateZip: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ImageCompressionService, useValue: compressionMock }],
    });
    service = TestBed.inject(UploaderStateService);
  });

  it('addFiles bỏ qua mảng rỗng', () => {
    service.addFiles([]);
    expect(service.processedFiles().length).toBe(0);
    expect(service.isCompressing()).toBe(false);
  });

  it('addFiles thêm file vào state và gọi compression service', () => {
    const file = new File([''], 'a.jpg', { type: 'image/jpeg' });
    service.addFiles([file]);

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

  it('removeFile xóa file, revoke compressedUrl và original cachedUrl', () => {
    const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:original-cached');
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

    // Cache the original URL
    service.createBlobUrl(mockFile);

    service.removeFile('abc');

    expect(service.processedFiles().length).toBe(0);
    expect(revokeSpy).toHaveBeenCalledWith('blob:test');
    expect(revokeSpy).toHaveBeenCalledWith('blob:original-cached');
    createSpy.mockRestore();
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

    service.closeComparison();
    expect(service.comparingFile()).toBeNull();
  });

  it('setComparisonSlider cập nhật giá trị', () => {
    service.setComparisonSlider(75);
    expect(service.comparisonSliderValue()).toBe(75);
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

  it('updateFile thay thế file, revoke URL cũ, và kích hoạt nén lại', () => {
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const mockFile = new File([''], 'a.jpg');
    const newMockFile = new File([''], 'cropped-a.jpg');
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
        compressedUrl: 'blob:test-result',
      },
    };
    service.processedFiles.set([item]);

    service.createBlobUrl(mockFile);

    service.updateFile('abc', newMockFile);

    const updated = service.processedFiles()[0];
    expect(updated.file).toBe(newMockFile);
    expect(updated.status).toBe('queued');
    expect(updated.progress).toBe(0);
    expect(updated.result).toBeUndefined();
    expect(revokeSpy).toHaveBeenCalledWith('blob:test-result');
    expect(compressionMock.compressImagesWithProgress).toHaveBeenCalled();
    revokeSpy.mockRestore();
  });

  describe('reorderFiles', () => {
    const sampleFiles = (): ProcessedFile[] => [
      { id: 'a', file: new File([''], 'a.jpg'), status: 'done', progress: 100 },
      { id: 'b', file: new File([''], 'b.jpg'), status: 'done', progress: 100 },
      { id: 'c', file: new File([''], 'c.jpg'), status: 'done', progress: 100 },
    ];

    it('di chuyển file trong mảng processedFiles', () => {
      service.processedFiles.set(sampleFiles());
      service.reorderFiles(0, 2);

      const ids = service.processedFiles().map((f) => f.id);
      expect(ids).toEqual(['b', 'c', 'a']);
    });

    it('bỏ qua khi fromIndex === toIndex', () => {
      service.processedFiles.set(sampleFiles());
      service.reorderFiles(1, 1);
      const ids = service.processedFiles().map((f) => f.id);
      expect(ids).toEqual(['a', 'b', 'c']);
      expect(service.settingsChanged()).toBe(false);
    });

    it('bỏ qua khi index ngoài range', () => {
      service.processedFiles.set(sampleFiles());
      service.reorderFiles(-1, 0);
      service.reorderFiles(0, 99);
      const ids = service.processedFiles().map((f) => f.id);
      expect(ids).toEqual(['a', 'b', 'c']);
    });

    it('chỉ mark settingsChanged khi numbering bật', () => {
      const settings = TestBed.inject(SettingsStateService);
      settings.includeNumbering.set(false);
      service.processedFiles.set(sampleFiles());
      service.reorderFiles(0, 2);
      expect(service.settingsChanged()).toBe(false);

      settings.includeNumbering.set(true);
      service.reorderFiles(0, 1);
      expect(service.settingsChanged()).toBe(true);
    });
  });
});
