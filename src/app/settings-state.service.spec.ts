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

  describe('quản lý custom presets', () => {
    beforeEach(() => {
      localStorage.clear();
      // Khởi tạo lại list để trống
      service.customPresets.set([]);
    });

    it('resetToDefaults: đưa tất cả thiết lập về giá trị mặc định', () => {
      service.selectedPreset.set('max');
      service.selectedFormat.set('image/webp');
      service.namePrefix.set('test-');
      service.includeWatermark.set(true);
      service.preserveExif.set(true);

      service.resetToDefaults();

      expect(service.selectedPreset()).toBe('medium');
      expect(service.selectedFormat()).toBe('image/jpeg');
      expect(service.namePrefix()).toBe('');
      expect(service.includeWatermark()).toBe(false);
      expect(service.preserveExif()).toBe(false);
    });

    it('saveCustomPreset + loadCustomPreset roundtrip preserveExif', async () => {
      service.preserveExif.set(true);
      const ok = await service.saveCustomPreset('Exif On');
      expect(ok).toBe(true);

      service.preserveExif.set(false);
      service.loadCustomPreset(service.customPresets()[0].id);
      expect(service.preserveExif()).toBe(true);
    });

    it('saveCustomPreset: lưu preset thành công và không cho trùng tên', async () => {
      service.selectedPreset.set('light');
      service.selectedFormat.set('image/webp');
      service.namePrefix.set('custom-');

      const saved = await service.saveCustomPreset('My Custom Preset');
      expect(saved).toBe(true);
      expect(service.customPresets().length).toBe(1);
      expect(service.customPresets()[0].name).toBe('My Custom Preset');
      expect(service.customPresets()[0].data.selectedPreset).toBe('light');
      expect(service.customPresets()[0].data.namePrefix).toBe('custom-');

      // Trùng tên (không phân biệt hoa thường)
      const savedDuplicate = await service.saveCustomPreset('my custom preset');
      expect(savedDuplicate).toBe(false);
      expect(service.customPresets().length).toBe(1);
    });

    it('loadCustomPreset: load thiết lập từ preset đã chọn', async () => {
      service.selectedPreset.set('light');
      service.selectedFormat.set('image/webp');
      await service.saveCustomPreset('Temp Preset');

      const presetId = service.customPresets()[0].id;

      // Đổi thiết lập sang cái khác
      service.selectedPreset.set('max');
      service.selectedFormat.set('image/jpeg');

      // Load lại preset
      service.loadCustomPreset(presetId);

      expect(service.selectedPreset()).toBe('light');
      expect(service.selectedFormat()).toBe('image/webp');
    });

    it('deleteCustomPreset: xoá preset theo ID', async () => {
      await service.saveCustomPreset('Preset 1');
      await service.saveCustomPreset('Preset 2');
      expect(service.customPresets().length).toBe(2);

      const idToDelete = service.customPresets()[0].id;
      service.deleteCustomPreset(idToDelete);

      expect(service.customPresets().length).toBe(1);
      expect(service.customPresets()[0].name).toBe('Preset 2');
    });

    it('importPresets: import danh sách preset từ JSON và re-issue UUID', () => {
      const presetsJson = JSON.stringify([
        {
          id: 'imported-id-1',
          name: 'Imported Preset',
          data: {
            selectedPreset: 'max',
            selectedFormat: 'image/webp',
            selectedResizeMode: 'percent',
            resizeWidth: 100,
            resizeHeight: 100,
            resizePercent: 50,
            namePrefix: 'imp-',
            nameSuffix: '',
            includeNumbering: false,
            startNumberingIndex: 1,
            includeWatermark: false,
            watermarkType: 'text',
            watermarkText: '',
            watermarkPosition: 'bottom-right',
            watermarkFontSize: 5,
            watermarkOpacity: 0.5,
            watermarkColor: '#ffffff',
            watermarkImageSize: 15,
          },
          createdAt: 1700000000000,
        },
      ]);

      const imported = service.importPresets(presetsJson);
      expect(imported).toBe(true);
      expect(service.customPresets().length).toBe(1);
      // ID ngoại bị loại — luôn tạo UUID mới
      expect(service.customPresets()[0].id).not.toBe('imported-id-1');
      expect(service.customPresets()[0].id).toMatch(/^[0-9a-f-]{36}$/);
      expect(service.customPresets()[0].name).toBe('Imported Preset');
      expect(service.customPresets()[0].data.selectedPreset).toBe('max');
      expect(service.customPresets()[0].createdAt).toBe(1700000000000);
    });

    it('importPresets: trả về false khi JSON không hợp lệ hoặc sai định dạng', () => {
      const invalid = service.importPresets('invalid json');
      expect(invalid).toBe(false);

      const invalidFormat = service.importPresets(JSON.stringify([{ other: 'field' }]));
      expect(invalidFormat).toBe(false);

      // Không phải array
      const notArray = service.importPresets(JSON.stringify({ foo: 'bar' }));
      expect(notArray).toBe(false);
    });

    it('importPresets: từ chối preset có enum field ngoài whitelist', () => {
      const badEnum = service.importPresets(
        JSON.stringify([
          {
            name: 'Malicious',
            data: {
              selectedPreset: 'arbitrary-preset', // không nằm trong whitelist
              selectedFormat: 'image/jpeg',
              selectedResizeMode: 'auto',
              resizeWidth: 100,
              resizeHeight: 100,
              resizePercent: 50,
              namePrefix: '',
              nameSuffix: '',
              includeNumbering: false,
              startNumberingIndex: 1,
              includeWatermark: false,
              watermarkType: 'text',
              watermarkText: '',
              watermarkPosition: 'bottom-right',
              watermarkFontSize: 3,
              watermarkOpacity: 0.5,
              watermarkColor: '#ffffff',
              watermarkImageSize: 15,
            },
          },
        ]),
      );
      expect(badEnum).toBe(false);
      expect(service.customPresets().length).toBe(0);
    });

    it('importPresets: clamp number ngoài range về fallback', () => {
      const ok = service.importPresets(
        JSON.stringify([
          {
            name: 'Out of range',
            data: {
              selectedPreset: 'medium',
              selectedFormat: 'image/jpeg',
              selectedResizeMode: 'auto',
              resizeWidth: 999999, // clamp xuống max 10000
              resizeHeight: -5, // clamp lên min 1
              resizePercent: 50,
              namePrefix: '',
              nameSuffix: '',
              includeNumbering: false,
              startNumberingIndex: 1,
              includeWatermark: false,
              watermarkType: 'text',
              watermarkText: '',
              watermarkPosition: 'bottom-right',
              watermarkFontSize: 99,
              watermarkOpacity: 5,
              watermarkColor: '#000000',
              watermarkImageSize: 15,
            },
          },
        ]),
      );
      expect(ok).toBe(true);
      const data = service.customPresets()[0].data;
      expect(data.resizeWidth).toBe(10000);
      expect(data.resizeHeight).toBe(1);
      expect(data.watermarkFontSize).toBeLessThanOrEqual(20);
      expect(data.watermarkOpacity).toBeLessThanOrEqual(1);
    });

    it('importPresets: trùng name ghi đè data nhưng giữ id cũ', async () => {
      await service.saveCustomPreset('Shared Name');
      const originalId = service.customPresets()[0].id;

      const ok = service.importPresets(
        JSON.stringify([
          {
            name: 'Shared Name',
            data: {
              selectedPreset: 'max',
              selectedFormat: 'image/webp',
              selectedResizeMode: 'auto',
              resizeWidth: 100,
              resizeHeight: 100,
              resizePercent: 50,
              namePrefix: 'over-',
              nameSuffix: '',
              includeNumbering: false,
              startNumberingIndex: 1,
              includeWatermark: false,
              watermarkType: 'text',
              watermarkText: '',
              watermarkPosition: 'bottom-right',
              watermarkFontSize: 5,
              watermarkOpacity: 0.5,
              watermarkColor: '#ffffff',
              watermarkImageSize: 15,
            },
          },
        ]),
      );
      expect(ok).toBe(true);
      expect(service.customPresets().length).toBe(1);
      expect(service.customPresets()[0].id).toBe(originalId);
      expect(service.customPresets()[0].data.namePrefix).toBe('over-');
    });

    it('exportPresets: tạo blob URL + revoke', () => {
      const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:export-url');
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
      const clickSpy = vi.fn();
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        click: clickSpy,
        href: '',
        download: '',
      } as unknown as HTMLAnchorElement);

      service.exportPresets();

      expect(createSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeSpy).toHaveBeenCalledWith('blob:export-url');

      createSpy.mockRestore();
      revokeSpy.mockRestore();
      createElementSpy.mockRestore();
    });

    it('loadPresetsFromStorage: bỏ qua preset corrupt trong localStorage', () => {
      localStorage.setItem(
        'angular_image_optimizer_presets',
        JSON.stringify([
          {
            name: 'Valid',
            data: {
              selectedPreset: 'light',
              selectedFormat: 'image/jpeg',
              selectedResizeMode: 'auto',
              resizeWidth: 100,
              resizeHeight: 100,
              resizePercent: 50,
              namePrefix: '',
              nameSuffix: '',
              includeNumbering: false,
              startNumberingIndex: 1,
              includeWatermark: false,
              watermarkType: 'text',
              watermarkText: '',
              watermarkPosition: 'bottom-right',
              watermarkFontSize: 3,
              watermarkOpacity: 0.5,
              watermarkColor: '#fff',
              watermarkImageSize: 15,
            },
          },
          { name: 'Bad', data: { selectedPreset: 'evil' } }, // sẽ bị reject
        ]),
      );

      // Tạo instance mới để trigger constructor → loadPresetsFromStorage
      const fresh = TestBed.runInInjectionContext(() => new SettingsStateService());
      expect(fresh.customPresets().length).toBe(1);
      expect(fresh.customPresets()[0].name).toBe('Valid');
    });
  });
});
