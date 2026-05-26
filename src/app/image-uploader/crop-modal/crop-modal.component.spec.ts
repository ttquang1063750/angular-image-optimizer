const mockCropperInstance = {
  setAspectRatio: vi.fn(),
  rotate: vi.fn(),
  getData: vi.fn().mockReturnValue({ scaleX: 1, scaleY: 1 }),
  scaleX: vi.fn(),
  scaleY: vi.fn(),
  getCroppedCanvas: vi.fn().mockReturnValue({
    toBlob: vi.fn((callback) => callback(new Blob([''], { type: 'image/jpeg' }))),
  }),
  destroy: vi.fn(),
};

vi.mock('heic-to', () => ({
  heicTo: vi.fn(),
  isHeic: vi.fn(),
}));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CropModalComponent } from './crop-modal.component';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { UploaderStateService } from '../../uploader-state.service';
import { ProcessedFile } from '../../image-processing.model';

describe('CropModalComponent', () => {
  let component: CropModalComponent;
  let fixture: ComponentFixture<CropModalComponent>;
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };
  let stateMock: { updateFile: ReturnType<typeof vi.fn> };
  const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' });
  const mockProcessedFile: ProcessedFile = {
    id: '123',
    file: mockFile,
    status: 'done',
    progress: 100,
  };

  beforeEach(async () => {
    dialogRefMock = { close: vi.fn() };
    stateMock = { updateFile: vi.fn() };

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [CropModalComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRefMock },
        { provide: DIALOG_DATA, useValue: { file: mockProcessedFile } },
        { provide: UploaderStateService, useValue: stateMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CropModalComponent);
    component = fixture.componentInstance;

    const mockCropperClass = class MockCropper {
      constructor() {
        return mockCropperInstance;
      }
    } as unknown as (typeof import('cropperjs'))['default'];

    vi.spyOn(component, 'loadCropperModule').mockResolvedValue({
      default: mockCropperClass,
    } as unknown as typeof import('cropperjs'));

    fixture.detectChanges();
    await component.ngAfterViewInit();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('smoke: render và khởi tạo cropper thành công', () => {
    expect(component).toBeTruthy();
    expect(component.imageUrl).toBe('blob:mock-url');
    expect(component.cropperReady()).toBe(true);
    expect(component.loadError()).toBeNull();
    expect(component.canApply()).toBe(true);
  });

  it('setMode("free") set NaN aspect ratio', () => {
    component.setMode('free');
    expect(mockCropperInstance.setAspectRatio).toHaveBeenLastCalledWith(Number.NaN);
    expect(component.currentMode()).toBe('free');
  });

  it('setMode("1:1") set ratio 1', () => {
    component.setMode('1:1');
    expect(mockCropperInstance.setAspectRatio).toHaveBeenLastCalledWith(1);
    expect(component.currentMode()).toBe('1:1');
  });

  it('setMode("4:3") set ratio 4/3', () => {
    component.setMode('4:3');
    expect(mockCropperInstance.setAspectRatio).toHaveBeenLastCalledWith(4 / 3);
    expect(component.currentMode()).toBe('4:3');
  });

  it('setMode("16:9") set ratio 16/9', () => {
    component.setMode('16:9');
    expect(mockCropperInstance.setAspectRatio).toHaveBeenLastCalledWith(16 / 9);
    expect(component.currentMode()).toBe('16:9');
  });

  it('rotate() xoay hình ảnh', () => {
    component.rotate(90);
    expect(mockCropperInstance.rotate).toHaveBeenCalledWith(90);
  });

  it('flip() lật ảnh theo trục ngang/dọc', () => {
    mockCropperInstance.getData.mockReturnValue({ scaleX: 1, scaleY: 1 });
    component.flip('x');
    expect(mockCropperInstance.scaleX).toHaveBeenCalledWith(-1);

    component.flip('y');
    expect(mockCropperInstance.scaleY).toHaveBeenCalledWith(-1);
  });

  it('close() đóng dialog', () => {
    component.close();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('apply() trích xuất canvas, chuyển thành file và gọi updateFile', async () => {
    component.apply();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockCropperInstance.getCroppedCanvas).toHaveBeenCalled();
    expect(stateMock.updateFile).toHaveBeenCalledWith('123', expect.any(File));
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('apply() set loadError khi getCroppedCanvas trả null', () => {
    mockCropperInstance.getCroppedCanvas.mockReturnValueOnce(null);
    component.apply();
    expect(component.loadError()).toBeTruthy();
    expect(component.canApply()).toBe(false);
  });

  it('apply() set loadError khi toBlob callback nhận null', async () => {
    mockCropperInstance.getCroppedCanvas.mockReturnValueOnce({
      toBlob: vi.fn((callback: (b: Blob | null) => void) => callback(null)),
    });
    component.apply();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(component.loadError()).toBeTruthy();
    expect(stateMock.updateFile).not.toHaveBeenCalled();
  });

  it('ngOnDestroy: cleanup cropper + revoke blob URL', () => {
    component.ngOnDestroy();
    expect(mockCropperInstance.destroy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('ngAfterViewInit set loadError khi cropper init throw', async () => {
    // Tạo fresh instance để re-trigger init với mock reject
    const fixture2 = TestBed.createComponent(CropModalComponent);
    const c2 = fixture2.componentInstance;
    vi.spyOn(c2, 'loadCropperModule').mockRejectedValue(new Error('boom'));
    fixture2.detectChanges();
    await c2.ngAfterViewInit();
    expect(c2.cropperReady()).toBe(false);
    expect(c2.loadError()).toBeTruthy();
    expect(c2.canApply()).toBe(false);
  });
});
