import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NamingConfigComponent } from './naming-config.component';
import { SettingsStateService } from '../../../settings-state.service';
import { UploaderStateService } from '../../../uploader-state.service';
import { ImageCompressionService } from '../../../image-compression.service';

vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

describe('NamingConfigComponent', () => {
  let component: NamingConfigComponent;
  let fixture: ComponentFixture<NamingConfigComponent>;
  let settings: SettingsStateService;
  let stateMock: Partial<UploaderStateService>;

  beforeEach(async () => {
    stateMock = { markSettingsChanged: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [NamingConfigComponent],
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

    fixture = TestBed.createComponent(NamingConfigComponent);
    component = fixture.componentInstance;
    settings = TestBed.inject(SettingsStateService);
    fixture.detectChanges();
  });

  it('updatePrefix cập nhật namePrefix', () => {
    const event = { target: { value: 'pre-' } } as unknown as Event;
    component.updatePrefix(event);
    expect(settings.namePrefix()).toBe('pre-');
    expect(stateMock.markSettingsChanged).toHaveBeenCalled();
  });

  it('updateSuffix cập nhật nameSuffix', () => {
    const event = { target: { value: '-min' } } as unknown as Event;
    component.updateSuffix(event);
    expect(settings.nameSuffix()).toBe('-min');
  });

  it('toggleNumbering đảo bool', () => {
    expect(settings.includeNumbering()).toBe(false);
    component.toggleNumbering();
    expect(settings.includeNumbering()).toBe(true);
  });

  it('updateStartIndex cập nhật startNumberingIndex', () => {
    const event = { target: { valueAsNumber: 10 } } as unknown as Event;
    component.updateStartIndex(event);
    expect(settings.startNumberingIndex()).toBe(10);
  });

  it('updateStartIndex set error khi NaN', () => {
    const event = { target: { valueAsNumber: NaN } } as unknown as Event;
    component.updateStartIndex(event);
    expect(component.errorFor('startIndex')).toBeDefined();
    expect(settings.startNumberingIndex()).toBe(1);
  });

  it('updateStartIndex set error khi giá trị âm', () => {
    const event = { target: { valueAsNumber: -1 } } as unknown as Event;
    component.updateStartIndex(event);
    expect(component.errorFor('startIndex')).toBeDefined();
  });
});
