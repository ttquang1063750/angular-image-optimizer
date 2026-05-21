import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WatermarkConfigComponent } from './watermark-config.component';
import { SettingsStateService } from '../../../settings-state.service';
import { UploaderStateService } from '../../../uploader-state.service';
import { ImageCompressionService } from '../../../image-compression.service';

vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

describe('WatermarkConfigComponent', () => {
  let component: WatermarkConfigComponent;
  let fixture: ComponentFixture<WatermarkConfigComponent>;
  let settings: SettingsStateService;
  let stateMock: Partial<UploaderStateService>;

  beforeEach(async () => {
    stateMock = { markSettingsChanged: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [WatermarkConfigComponent],
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

    fixture = TestBed.createComponent(WatermarkConfigComponent);
    component = fixture.componentInstance;
    settings = TestBed.inject(SettingsStateService);
    fixture.detectChanges();
  });

  it('toggle bật/tắt watermark', () => {
    expect(settings.includeWatermark()).toBe(false);
    component.toggle();
    expect(settings.includeWatermark()).toBe(true);
  });

  it('setType chuyển giữa text và image', () => {
    component.setType('image');
    expect(settings.watermarkType()).toBe('image');
    component.setType('text');
    expect(settings.watermarkType()).toBe('text');
  });

  it('onTextChange cập nhật text', () => {
    const event = { target: { value: 'hello' } } as unknown as Event;
    component.onTextChange(event);
    expect(settings.watermarkText()).toBe('hello');
  });

  it('onPositionChange cập nhật position', () => {
    const event = { target: { value: 'center' } } as unknown as Event;
    component.onPositionChange(event);
    expect(settings.watermarkPosition()).toBe('center');
  });

  it('onImageSelected lưu Blob và tạo preview URL', () => {
    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:logo-preview');

    const file = new File([''], 'logo.png', { type: 'image/png' });
    const event = { target: { files: [file] } } as unknown as Event;
    component.onImageSelected(event);

    expect(settings.watermarkImage()).toBe(file);
    expect(settings.watermarkImagePreviewUrl()).toBe('blob:logo-preview');
    createObjectURLSpy.mockRestore();
  });

  it('onImageSelected bỏ qua file không phải ảnh', () => {
    const file = new File([''], 'doc.txt', { type: 'text/plain' });
    const event = { target: { files: [file] } } as unknown as Event;
    component.onImageSelected(event);
    expect(settings.watermarkImage()).toBeNull();
  });

  it('onImageSizeChange set error khi giá trị âm và không update signal', () => {
    settings.watermarkImageSize.set(20);
    const event = { target: { valueAsNumber: -5 } } as unknown as Event;
    component.onImageSizeChange(event);

    expect(component.errorFor('imageSize')).toBeDefined();
    expect(settings.watermarkImageSize()).toBe(20);
  });

  it('onImageSizeChange clear error khi giá trị quay về hợp lệ', () => {
    component.onImageSizeChange({ target: { valueAsNumber: 100 } } as unknown as Event);
    expect(component.errorFor('imageSize')).toBeDefined();

    component.onImageSizeChange({ target: { valueAsNumber: 30 } } as unknown as Event);
    expect(component.errorFor('imageSize')).toBeUndefined();
    expect(settings.watermarkImageSize()).toBe(30);
  });

  it('onFontSizeChange validate range 1..20', () => {
    component.onFontSizeChange({ target: { valueAsNumber: 25 } } as unknown as Event);
    expect(component.errorFor('fontSize')).toBeDefined();

    component.onFontSizeChange({ target: { valueAsNumber: 5 } } as unknown as Event);
    expect(component.errorFor('fontSize')).toBeUndefined();
  });

  it('removeImage clear image và revoke URL', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x');
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const file = new File([''], 'logo.png', { type: 'image/png' });
    settings.setWatermarkImage(file);
    component.removeImage();

    expect(settings.watermarkImage()).toBeNull();
    expect(settings.watermarkImagePreviewUrl()).toBeNull();
    expect(revokeSpy).toHaveBeenCalledWith('blob:x');

    createObjectURLSpy.mockRestore();
    revokeSpy.mockRestore();
  });
});
