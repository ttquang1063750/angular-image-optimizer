import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PresetManagerComponent } from './preset-manager.component';
import { SettingsStateService } from '../../../settings-state.service';
import { UploaderStateService } from '../../../uploader-state.service';
import { ImageCompressionService } from '../../../image-compression.service';

vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

describe('PresetManagerComponent', () => {
  let component: PresetManagerComponent;
  let fixture: ComponentFixture<PresetManagerComponent>;
  let settings: SettingsStateService;
  let stateMock: Partial<UploaderStateService>;

  beforeEach(async () => {
    stateMock = { markSettingsChanged: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PresetManagerComponent],
      providers: [
        {
          provide: ImageCompressionService,
          useValue: {
            getOptionsByPreset: vi
              .fn()
              .mockReturnValue({ quality: 0.6, maxWidthOrHeight: 1600, resizeMode: 'auto' }),
          },
        },
        { provide: UploaderStateService, useValue: stateMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PresetManagerComponent);
    component = fixture.componentInstance;
    settings = TestBed.inject(SettingsStateService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('lưu preset thành công khi nhập tên hợp lệ', async () => {
    component.presetName.set('Optimized PNG');
    await component.savePreset();

    expect(settings.customPresets().length).toBe(1);
    expect(settings.customPresets()[0].name).toBe('Optimized PNG');
    expect(component.errorMessage()).toBeNull();
    expect(component.successMessage()).toBeDefined();
  });

  it('không cho lưu preset khi tên trống', async () => {
    component.presetName.set('');
    await component.savePreset();

    expect(settings.customPresets().length).toBe(0);
    expect(component.errorMessage()).toBeDefined();
  });

  it('không cho lưu preset khi tên đã tồn tại', async () => {
    component.presetName.set('Unique Preset');
    await component.savePreset();
    expect(settings.customPresets().length).toBe(1);

    component.presetName.set('Unique Preset');
    await component.savePreset();
    expect(settings.customPresets().length).toBe(1);
    expect(component.errorMessage()).toBeDefined();
  });

  it('thay đổi preset kích hoạt resetToDefaults hoặc loadCustomPreset', async () => {
    // 1. Lưu một preset
    settings.selectedFormat.set('image/webp');
    component.presetName.set('WebP Config');
    await component.savePreset();
    const presetId = settings.customPresets()[0].id;

    // 2. Chuyển sang preset đó
    const selectEvent = { target: { value: presetId } } as unknown as Event;
    component.onPresetChange(selectEvent);
    expect(settings.selectedFormat()).toBe('image/webp');
    expect(stateMock.markSettingsChanged).toHaveBeenCalled();

    // 3. Chuyển về default
    const selectDefaultEvent = { target: { value: 'default' } } as unknown as Event;
    component.onPresetChange(selectDefaultEvent);
    expect(settings.selectedFormat()).toBe('image/jpeg'); // Mặc định là jpeg
  });

  it('xoá preset thành công khi người dùng xác nhận', async () => {
    component.presetName.set('To Delete');
    await component.savePreset();
    const presetId = settings.customPresets()[0].id;

    component.activePresetId.set(presetId);
    component.deletePreset();
    expect(component.showDeleteConfirm()).toBe(true);

    component.confirmDelete();
    expect(settings.customPresets().length).toBe(0);
    expect(component.activePresetId()).toBe('default');
    expect(component.showDeleteConfirm()).toBe(false);
  });

  it('huỷ xoá preset không làm mất dữ liệu', async () => {
    component.presetName.set('To Keep');
    await component.savePreset();
    const presetId = settings.customPresets()[0].id;

    component.activePresetId.set(presetId);
    component.deletePreset();
    expect(component.showDeleteConfirm()).toBe(true);

    component.cancelDelete();
    expect(settings.customPresets().length).toBe(1);
    expect(component.activePresetId()).toBe(presetId);
    expect(component.showDeleteConfirm()).toBe(false);
  });

  it('onFileImport: từ chối file vượt giới hạn 10MB', () => {
    const oversized = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.json', {
      type: 'application/json',
    });
    const inputEl = document.createElement('input');
    inputEl.type = 'file';
    Object.defineProperty(inputEl, 'files', { value: [oversized], configurable: true });
    const evt = new Event('change');
    Object.defineProperty(evt, 'target', { value: inputEl });

    const importSpy = vi.spyOn(settings, 'importPresets');
    component.onFileImport(evt);

    expect(importSpy).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBeDefined();
  });

  it('exportPresets: delegate xuống settings.exportPresets', () => {
    const exportSpy = vi.spyOn(settings, 'exportPresets').mockImplementation(() => undefined);
    component.exportPresets();
    expect(exportSpy).toHaveBeenCalled();
  });
});
