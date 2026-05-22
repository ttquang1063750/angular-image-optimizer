import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SettingsStateService } from '../../settings-state.service';
import { UploaderStateService } from '../../uploader-state.service';
import { WatermarkPreviewDialogComponent } from './watermark-preview-dialog.component';
import { WatermarkItem } from '../../image-processing.model';

vi.mock('heic2any', () => ({ default: vi.fn() }));

describe('WatermarkPreviewDialogComponent', () => {
  let component: WatermarkPreviewDialogComponent;
  let fixture: ComponentFixture<WatermarkPreviewDialogComponent>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let settings: SettingsStateService;

  const sampleWm: WatermarkItem = {
    id: 'wm-1',
    type: 'text',
    text: 'Hello',
    fontSize: 5,
    color: '#fff',
    opacity: 0.5,
    position: 'bottom-right',
  };

  beforeEach(async () => {
    localStorage.clear();
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [WatermarkPreviewDialogComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: DIALOG_DATA, useValue: { initialWatermarkId: sampleWm.id } },
      ],
    }).compileComponents();

    settings = TestBed.inject(SettingsStateService);
    settings.watermarks.set([sampleWm]);

    fixture = TestBed.createComponent(WatermarkPreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
    expect(component.activeId()).toBe(sampleWm.id);
  });

  it('ngAfterViewInit chuyển preset position → custom (50,50)', () => {
    component.ngAfterViewInit();
    const wm = settings.watermarks()[0];
    expect(wm.position).toEqual({ x: 50, y: 50 });
  });

  it('close() delegate vào DialogRef.close', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('selectInModal đặt activeId', () => {
    component.selectInModal('other-id');
    expect(component.activeId()).toBe('other-id');
  });

  it('onImageLoad cập nhật imageWidth/Height từ naturalDimensions', () => {
    const event = {
      target: { naturalWidth: 800, naturalHeight: 600 } as HTMLImageElement,
    } as unknown as Event;
    component.onImageLoad(event);
    expect(component.imageWidth()).toBe(800);
    expect(component.imageHeight()).toBe(600);
  });

  it('previewContainerWidth: auto khi chưa có dimensions, có aspect khi đã có', () => {
    component.imageWidth.set(0);
    component.imageHeight.set(0);
    expect(component.previewContainerWidth()).toBe('auto');

    component.imageWidth.set(800);
    component.imageHeight.set(600);
    expect(component.previewContainerWidth()).toContain('min(100%');
  });

  it('getWatermarkStyle cho custom coords trả left/top %', () => {
    const customWm: WatermarkItem = {
      ...sampleWm,
      position: { x: 30, y: 60 },
    };
    const style = component.getWatermarkStyle(customWm);
    expect(style['left']).toBe('30%');
    expect(style['top']).toBe('60%');
    expect(style['transform']).toBe('translate(-50%, -50%)');
  });

  it('isCustomPosition narrow type đúng', () => {
    expect(component.isCustomPosition('bottom-right')).toBe(false);
    expect(component.isCustomPosition({ x: 1, y: 2 })).toBe(true);
  });

  it('startDrag reject right-click', () => {
    const rightClick = new MouseEvent('mousedown', { button: 2 });
    component.startDrag(rightClick, sampleWm);
    expect(
      (component as unknown as { dragAbortController: AbortController | null })
        .dragAbortController,
    ).toBeNull();
  });

  it('startDrag tạo AbortController, ngOnDestroy abort + null hoá', () => {
    const container = document.createElement('div');
    const overlay = document.createElement('div');
    container.appendChild(overlay);
    document.body.appendChild(container);

    const mouseDown = new MouseEvent('mousedown', { button: 0, bubbles: true });
    Object.defineProperty(mouseDown, 'currentTarget', { value: overlay });
    component.startDrag(mouseDown, sampleWm);

    const controller = (component as unknown as { dragAbortController: AbortController | null })
      .dragAbortController;
    expect(controller).not.toBeNull();
    expect(controller?.signal.aborted).toBe(false);

    component.ngOnDestroy();
    expect(controller?.signal.aborted).toBe(true);

    container.remove();
  });
});
