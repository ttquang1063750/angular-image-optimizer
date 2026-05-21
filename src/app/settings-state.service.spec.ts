import { TestBed } from '@angular/core/testing';
import { SettingsStateService } from './settings-state.service';
import { ImageCompressionService } from './image-compression.service';

vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

describe('SettingsStateService', () => {
  let service: SettingsStateService;
  let compressionMock: Partial<ImageCompressionService>;

  beforeEach(() => {
    compressionMock = {
      getOptionsByPreset: vi.fn().mockImplementation((preset) => {
        if (preset === 'light') return { quality: 0.9, maxWidthOrHeight: 3840, resizeMode: 'auto' };
        if (preset === 'max') return { quality: 0.2, maxWidthOrHeight: 1024, resizeMode: 'auto' };
        return { quality: 0.6, maxWidthOrHeight: 1600, resizeMode: 'auto' };
      }),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ImageCompressionService, useValue: compressionMock }],
    });
    service = TestBed.inject(SettingsStateService);
  });

  it('giá trị mặc định: medium preset, jpeg, resize auto, không watermark', () => {
    expect(service.selectedPreset()).toBe('medium');
    expect(service.selectedFormat()).toBe('image/jpeg');
    expect(service.selectedResizeMode()).toBe('auto');
    expect(service.includeWatermark()).toBe(false);
  });

  it('currentOptions phản ánh preset đã chọn', () => {
    service.selectedPreset.set('light');
    expect(service.currentOptions().quality).toBe(0.9);

    service.selectedPreset.set('max');
    expect(service.currentOptions().quality).toBe(0.2);
  });

  it('currentOptions phản ánh format + resize', () => {
    service.selectedFormat.set('image/webp');
    service.selectedResizeMode.set('width');
    service.resizeWidth.set(800);

    const opts = service.currentOptions();
    expect(opts.format).toBe('image/webp');
    expect(opts.resizeMode).toBe('width');
    expect(opts.resizeWidth).toBe(800);
  });

  it('currentOptions include namePattern', () => {
    service.namePrefix.set('pre-');
    service.includeNumbering.set(true);
    service.startNumberingIndex.set(5);

    const opts = service.currentOptions();
    expect(opts.namePattern?.prefix).toBe('pre-');
    expect(opts.namePattern?.includeNumbering).toBe(true);
    expect(opts.namePattern?.startIndex).toBe(5);
  });

  it('currentOptions watermark là undefined khi includeWatermark = false', () => {
    service.includeWatermark.set(false);
    expect(service.currentOptions().watermark).toBeUndefined();
  });

  it('currentOptions text watermark khi enabled + type text', () => {
    service.includeWatermark.set(true);
    service.watermarkType.set('text');
    service.watermarkText.set('hello');
    service.watermarkPosition.set('center');

    const opts = service.currentOptions();
    expect(opts.watermark).toBeDefined();
    expect(opts.watermark?.type).toBe('text');
    if (opts.watermark?.type === 'text') {
      expect(opts.watermark.text).toBe('hello');
      expect(opts.watermark.position).toBe('center');
    }
  });

  it('currentOptions image watermark khi đã chọn ảnh', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:logo');
    const logo = new File([''], 'logo.png', { type: 'image/png' });

    service.includeWatermark.set(true);
    service.watermarkType.set('image');
    service.setWatermarkImage(logo);
    service.watermarkImageSize.set(20);

    const opts = service.currentOptions();
    expect(opts.watermark?.type).toBe('image');
    if (opts.watermark?.type === 'image') {
      expect(opts.watermark.image).toBe(logo);
      expect(opts.watermark.size).toBe(20);
    }

    createObjectURLSpy.mockRestore();
  });

  it('currentOptions watermark = undefined khi type=image nhưng chưa chọn ảnh', () => {
    service.includeWatermark.set(true);
    service.watermarkType.set('image');
    // watermarkImage vẫn là null
    expect(service.currentOptions().watermark).toBeUndefined();
  });
});
