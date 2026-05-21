import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPanelComponent } from './settings-panel.component';
import { SettingsStateService } from '../../settings-state.service';
import { UploaderStateService } from '../../uploader-state.service';
import { ImageCompressionService } from '../../image-compression.service';

vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

describe('SettingsPanelComponent', () => {
  let component: SettingsPanelComponent;
  let fixture: ComponentFixture<SettingsPanelComponent>;
  let settings: SettingsStateService;
  let stateMock: Partial<UploaderStateService>;

  beforeEach(async () => {
    stateMock = {
      markSettingsChanged: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SettingsPanelComponent],
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

    fixture = TestBed.createComponent(SettingsPanelComponent);
    component = fixture.componentInstance;
    settings = TestBed.inject(SettingsStateService);
    fixture.detectChanges();
  });

  it('setPreset cập nhật settings + markSettingsChanged', () => {
    component.setPreset('light');
    expect(settings.selectedPreset()).toBe('light');
    expect(stateMock.markSettingsChanged).toHaveBeenCalled();
  });

  it('setFormat cập nhật settings', () => {
    component.setFormat('image/webp');
    expect(settings.selectedFormat()).toBe('image/webp');
    expect(stateMock.markSettingsChanged).toHaveBeenCalled();
  });

  it('setResizeMode cập nhật settings', () => {
    component.setResizeMode('width');
    expect(settings.selectedResizeMode()).toBe('width');
  });

  it('updateResizeValue bỏ qua giá trị <= 0', () => {
    const event = { target: { valueAsNumber: 0 } } as unknown as Event;
    component.updateResizeValue(event, 'width');
    expect(settings.resizeWidth()).toBe(1200); // mặc định
  });

  it('updateResizeValue chấp nhận giá trị hợp lệ', () => {
    const event = { target: { valueAsNumber: 800 } } as unknown as Event;
    component.updateResizeValue(event, 'width');
    expect(settings.resizeWidth()).toBe(800);
  });

  it('updateNamingValue prefix và start riêng biệt', () => {
    const prefixEvent = { target: { value: 'pre-' } } as unknown as Event;
    component.updateNamingValue(prefixEvent, 'prefix');
    expect(settings.namePrefix()).toBe('pre-');

    const startEvent = { target: { valueAsNumber: 10 } } as unknown as Event;
    component.updateNamingValue(startEvent, 'start');
    expect(settings.startNumberingIndex()).toBe(10);
  });

  it('toggleNumbering đảo bool', () => {
    expect(settings.includeNumbering()).toBe(false);
    component.toggleNumbering();
    expect(settings.includeNumbering()).toBe(true);
  });

  it('toggleWatermark đảo bool', () => {
    expect(settings.includeWatermark()).toBe(false);
    component.toggleWatermark();
    expect(settings.includeWatermark()).toBe(true);
  });

  it('onWatermarkPositionChange cập nhật position', () => {
    const event = { target: { value: 'center' } } as unknown as Event;
    component.onWatermarkPositionChange(event);
    expect(settings.watermarkPosition()).toBe('center');
  });

  it('updateWatermarkValue text/opacity/size', () => {
    const textEvent = { target: { value: 'hello', valueAsNumber: NaN } } as unknown as Event;
    component.updateWatermarkValue(textEvent, 'text');
    expect(settings.watermarkText()).toBe('hello');

    const sizeEvent = { target: { valueAsNumber: 8 } } as unknown as Event;
    component.updateWatermarkValue(sizeEvent, 'size');
    expect(settings.watermarkFontSize()).toBe(8);
  });
});
