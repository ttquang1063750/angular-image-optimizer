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

  it('updateResizeValue set error khi giá trị <= 0', () => {
    const event = { target: { valueAsNumber: 0 } } as unknown as Event;
    component.updateResizeValue(event, 'width');
    expect(component.errorFor('width')).toBeDefined();
    expect(settings.resizeWidth()).toBe(1200); // mặc định
  });

  it('updateResizeValue set error khi giá trị > max', () => {
    const event = { target: { valueAsNumber: 99999 } } as unknown as Event;
    component.updateResizeValue(event, 'width');
    expect(component.errorFor('width')).toBeDefined();
  });

  it('updateResizeValue chấp nhận giá trị hợp lệ và clear error', () => {
    // gây error trước
    component.updateResizeValue({ target: { valueAsNumber: -1 } } as unknown as Event, 'width');
    expect(component.errorFor('width')).toBeDefined();

    // giá trị đúng → clear error
    component.updateResizeValue({ target: { valueAsNumber: 800 } } as unknown as Event, 'width');
    expect(component.errorFor('width')).toBeUndefined();
    expect(settings.resizeWidth()).toBe(800);
  });

  it('updateResizeValue percent có range riêng (1-100)', () => {
    component.setResizeMode('percent');
    component.updateResizeValue({ target: { valueAsNumber: 150 } } as unknown as Event, 'percent');
    expect(component.errorFor('percent')).toBeDefined();

    component.updateResizeValue({ target: { valueAsNumber: 75 } } as unknown as Event, 'percent');
    expect(component.errorFor('percent')).toBeUndefined();
    expect(settings.resizePercent()).toBe(75);
  });
});
