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

vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CropDialogComponent } from './crop-modal.component';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { UploaderStateService } from '../../uploader-state.service';
import { ProcessedFile } from '../../image-processing.model';

describe('CropDialogComponent', () => {
  let component: CropDialogComponent;
  let fixture: ComponentFixture<CropDialogComponent>;
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
    dialogRefMock = {
      close: vi.fn(),
    };

    stateMock = {
      updateFile: vi.fn(),
    };

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [CropDialogComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRefMock },
        { provide: DIALOG_DATA, useValue: { file: mockProcessedFile } },
        { provide: UploaderStateService, useValue: stateMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CropDialogComponent);
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
    await new Promise((resolve) => setTimeout(resolve, 50));
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('smoke: render và khởi tạo cropper thành công', () => {
    expect(component).toBeTruthy();
    expect(component.imageUrl).toBe('blob:mock-url');
  });

  it('setAspectRatio() thay đổi tỉ lệ của cropper', () => {
    component.setAspectRatio(1);
    expect(mockCropperInstance.setAspectRatio).toHaveBeenCalledWith(1);
    expect(component.currentAspectRatio).toBe(1);
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
});
