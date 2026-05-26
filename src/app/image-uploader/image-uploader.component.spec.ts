import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploaderComponent } from './image-uploader.component';
import { ImageCompressionService } from '../image-compression.service';
import { ProcessedFile } from '../image-processing.model';

vi.mock('heic-to', () => ({
  heicTo: vi.fn(),
  isHeic: vi.fn(),
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

  it('onFilesSelected delegates to state service', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const stateServiceAddSpy = vi
      .spyOn(
        (component as unknown as { state: { addFiles: (files: File[]) => void } }).state,
        'addFiles',
      )
      .mockImplementation(() => undefined);

    component.onFilesSelected([mockFile]);

    expect(stateServiceAddSpy).toHaveBeenCalledWith([mockFile]);
  });

  it('recompressAll delegates to state service', () => {
    const stateServiceRecompressSpy = vi
      .spyOn(
        (component as unknown as { state: { recompressAll: () => void } }).state,
        'recompressAll',
      )
      .mockImplementation(() => undefined);

    component.recompressAll();

    expect(stateServiceRecompressSpy).toHaveBeenCalled();
  });

  it('clearAll delegates to state service', () => {
    const stateServiceClearSpy = vi
      .spyOn((component as unknown as { state: { clearAll: () => void } }).state, 'clearAll')
      .mockImplementation(() => undefined);

    component.clearAll();

    expect(stateServiceClearSpy).toHaveBeenCalled();
  });

  it('showConfig mặc định là true và hoạt động đóng/mở chính xác', () => {
    expect(component.showConfig()).toBe(true);

    component.toggleConfig();
    expect(component.showConfig()).toBe(false);

    component.toggleConfig();
    expect(component.showConfig()).toBe(true);
  });

  describe('keyboard shortcuts', () => {
    it('Cmd+O gọi openFilePicker trên drop zone', () => {
      const openSpy = vi.fn();
      component.dropZone = { openFilePicker: openSpy } as unknown as typeof component.dropZone;

      const event = new KeyboardEvent('keydown', { key: 'o', metaKey: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');
      component.onKeydown(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalled();
    });

    it('Ctrl+O cũng gọi openFilePicker', () => {
      const openSpy = vi.fn();
      component.dropZone = { openFilePicker: openSpy } as unknown as typeof component.dropZone;

      const event = new KeyboardEvent('keydown', { key: 'O', ctrlKey: true });
      component.onKeydown(event);
      expect(openSpy).toHaveBeenCalled();
    });

    it('Ctrl+Shift+O bị bỏ qua (không phải shortcut định nghĩa)', () => {
      const openSpy = vi.fn();
      component.dropZone = { openFilePicker: openSpy } as unknown as typeof component.dropZone;

      const event = new KeyboardEvent('keydown', { key: 'o', ctrlKey: true, shiftKey: true });
      component.onKeydown(event);
      expect(openSpy).not.toHaveBeenCalled();
    });

    it('Cmd+S gọi downloadAll khi có file đã nén xong', () => {
      const downloadSpy = vi
        .spyOn(component, 'downloadAll')
        .mockResolvedValue(undefined as unknown as void);
      vi.spyOn(component, 'completedCount').mockReturnValue(2);
      vi.spyOn(component, 'isCompressing').mockReturnValue(false);

      const event = new KeyboardEvent('keydown', { key: 's', metaKey: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');
      component.onKeydown(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(downloadSpy).toHaveBeenCalled();
    });

    it('Cmd+S preventDefault nhưng không download khi chưa có file done', () => {
      const downloadSpy = vi
        .spyOn(component, 'downloadAll')
        .mockResolvedValue(undefined as unknown as void);
      vi.spyOn(component, 'completedCount').mockReturnValue(0);

      const event = new KeyboardEvent('keydown', { key: 's', metaKey: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');
      component.onKeydown(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(downloadSpy).not.toHaveBeenCalled();
    });

    it('Cmd+S bỏ qua khi đang nén dở', () => {
      const downloadSpy = vi
        .spyOn(component, 'downloadAll')
        .mockResolvedValue(undefined as unknown as void);
      vi.spyOn(component, 'completedCount').mockReturnValue(3);
      vi.spyOn(component, 'isCompressing').mockReturnValue(true);

      const event = new KeyboardEvent('keydown', { key: 's', metaKey: true });
      component.onKeydown(event);
      expect(downloadSpy).not.toHaveBeenCalled();
    });

    it('Esc đóng comparison modal khi mở', () => {
      const state = (
        component as unknown as {
          state: { closeComparison: () => void; comparingFile: () => unknown };
        }
      ).state;
      const closeSpy = vi.spyOn(state, 'closeComparison').mockImplementation(() => undefined);
      vi.spyOn(component, 'comparingFile').mockReturnValue({
        id: '1',
        file: new File([''], 'a.png'),
        status: 'done',
        progress: 100,
      });

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component.onKeydown(event);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('Esc không làm gì khi không có modal mở', () => {
      vi.spyOn(component, 'comparingFile').mockReturnValue(null);
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      expect(() => component.onKeydown(event)).not.toThrow();
    });

    it('Alt+S bị bỏ qua (chỉ Mod+S không có Alt)', () => {
      const downloadSpy = vi
        .spyOn(component, 'downloadAll')
        .mockResolvedValue(undefined as unknown as void);
      vi.spyOn(component, 'completedCount').mockReturnValue(2);

      const event = new KeyboardEvent('keydown', { key: 's', metaKey: true, altKey: true });
      component.onKeydown(event);
      expect(downloadSpy).not.toHaveBeenCalled();
    });
  });
});
