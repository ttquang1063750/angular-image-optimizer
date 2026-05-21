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

  it('addWatermark thêm watermark mới và expand nó', () => {
    const initialLength = settings.watermarks().length;
    component.addWatermark('text');

    expect(settings.watermarks().length).toBe(initialLength + 1);
    const newWm = settings.watermarks()[settings.watermarks().length - 1];
    expect(newWm.type).toBe('text');
    expect(component.expandedId()).toBe(newWm.id);
  });

  it('removeWatermark xóa watermark khỏi danh sách', () => {
    component.addWatermark('text');
    const list = settings.watermarks();
    const idToRemove = list[list.length - 1].id;

    component.removeWatermark(idToRemove);
    expect(settings.watermarks().some((w) => w.id === idToRemove)).toBe(false);
  });

  it('toggleExpand thu/phóng cấu hình watermark', () => {
    component.addWatermark('text');
    const id = settings.watermarks()[0].id;

    component.expandedId.set(id);
    component.toggleExpand(id);
    expect(component.expandedId()).toBeNull();

    component.toggleExpand(id);
    expect(component.expandedId()).toBe(id);
  });

  it('updateType chuyển đổi kiểu của watermark', () => {
    component.addWatermark('text');
    const wm = settings.watermarks()[settings.watermarks().length - 1];
    expect(wm.type).toBe('text');

    component.updateType(wm.id, 'image');
    const updatedWm = settings.watermarks().find((w) => w.id === wm.id);
    expect(updatedWm?.type).toBe('image');
  });

  it('onTextChange cập nhật văn bản watermark', () => {
    component.addWatermark('text');
    const wm = settings.watermarks()[settings.watermarks().length - 1];
    const event = { target: { value: 'custom watermark' } } as unknown as Event;

    component.onTextChange(wm.id, event);
    const updatedWm = settings.watermarks().find((w) => w.id === wm.id);
    expect(updatedWm?.type === 'text' && updatedWm.text).toBe('custom watermark');
  });

  it('onPositionChange cập nhật vị trí watermark', () => {
    component.addWatermark('text');
    const wm = settings.watermarks()[settings.watermarks().length - 1];
    const event = { target: { value: 'center' } } as unknown as Event;

    component.onPositionChange(wm.id, event);
    const updatedWm = settings.watermarks().find((w) => w.id === wm.id);
    expect(updatedWm?.position).toBe('center');
  });

  it('onImageSelected cập nhật logo và tạo url preview', () => {
    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:test-logo-preview');

    component.addWatermark('image');
    const wm = settings.watermarks()[settings.watermarks().length - 1];
    const file = new File([''], 'logo.png', { type: 'image/png' });
    const event = { target: { files: [file] } } as unknown as Event;

    component.onImageSelected(wm.id, event);
    const updatedWm = settings.watermarks().find((w) => w.id === wm.id);
    expect(updatedWm?.type === 'image' && updatedWm.image).toBe(file);
    expect(updatedWm?.type === 'image' && updatedWm.previewUrl).toBe('blob:test-logo-preview');

    createObjectURLSpy.mockRestore();
  });

  it('onImageSizeChange đặt lỗi khi không hợp lệ và xóa khi hợp lệ', () => {
    component.addWatermark('image');
    const wm = settings.watermarks()[settings.watermarks().length - 1];

    component.onImageSizeChange(wm.id, { target: { valueAsNumber: -5 } } as unknown as Event);
    expect(component.errorFor(wm.id, 'imageSize')).toBeDefined();

    component.onImageSizeChange(wm.id, { target: { valueAsNumber: 15 } } as unknown as Event);
    expect(component.errorFor(wm.id, 'imageSize')).toBeUndefined();
    const updatedWm = settings.watermarks().find((w) => w.id === wm.id);
    expect(updatedWm?.type === 'image' && updatedWm.size).toBe(15);
  });

  it('onFontSizeChange validate phạm vi 1..20', () => {
    component.addWatermark('text');
    const wm = settings.watermarks()[settings.watermarks().length - 1];

    component.onFontSizeChange(wm.id, { target: { valueAsNumber: 25 } } as unknown as Event);
    expect(component.errorFor(wm.id, 'fontSize')).toBeDefined();

    component.onFontSizeChange(wm.id, { target: { valueAsNumber: 5 } } as unknown as Event);
    expect(component.errorFor(wm.id, 'fontSize')).toBeUndefined();
    const updatedWm = settings.watermarks().find((w) => w.id === wm.id);
    expect(updatedWm?.type === 'text' && updatedWm.fontSize).toBe(5);
  });

  it('drag & drop reorders list', () => {
    settings.watermarks.set([
      {
        id: 'a',
        type: 'text',
        text: 'A',
        fontSize: 3,
        color: '#fff',
        opacity: 0.5,
        position: 'bottom-right',
      },
      {
        id: 'b',
        type: 'text',
        text: 'B',
        fontSize: 3,
        color: '#fff',
        opacity: 0.5,
        position: 'bottom-right',
      },
    ]);

    const dragEvent = {
      dataTransfer: {
        effectAllowed: 'none',
        setData: vi.fn(),
      },
    } as unknown as DragEvent;

    component.onDragStart(dragEvent, 0);
    expect(component.draggedIndex).toBe(0);

    component.onDrop({ preventDefault: vi.fn() } as unknown as DragEvent, 1);
    expect(settings.watermarks()[0].id).toBe('b');
    expect(settings.watermarks()[1].id).toBe('a');
  });
});
