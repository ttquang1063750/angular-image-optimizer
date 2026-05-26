import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComparisonModalComponent } from './comparison-modal.component';
import { UploaderStateService } from '../../uploader-state.service';
import { ImageCompressionService } from '../../image-compression.service';
import { signal } from '@angular/core';
import { ProcessedFile } from '../../image-processing.model';

vi.mock('heic-to', () => ({
  heicTo: vi.fn(),
  isHeic: vi.fn(),
}));

describe('ComparisonModalComponent', () => {
  let component: ComparisonModalComponent;
  let fixture: ComponentFixture<ComparisonModalComponent>;
  let stateMock: {
    comparingFile: ReturnType<typeof signal<ProcessedFile | null>>;
    closeComparison: ReturnType<typeof vi.fn>;
    createBlobUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    stateMock = {
      comparingFile: signal<ProcessedFile | null>(null),
      closeComparison: vi.fn(),
      createBlobUrl: vi.fn().mockReturnValue('blob:x'),
    };

    await TestBed.configureTestingModule({
      imports: [ComparisonModalComponent],
      providers: [
        { provide: UploaderStateService, useValue: stateMock },
        { provide: ImageCompressionService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComparisonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('close() delegate state.closeComparison', () => {
    component.close();
    expect(stateMock.closeComparison).toHaveBeenCalled();
  });

  it('onMouseMove sets isHovering to true when inside image', () => {
    const paneMock = document.createElement('div');
    const imgMock = document.createElement('img');
    paneMock.appendChild(imgMock);

    vi.spyOn(paneMock, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 10,
      width: 400,
      height: 300,
      right: 410,
      bottom: 310,
      x: 10,
      y: 10,
      toJSON: () => {},
    } as DOMRect);

    vi.spyOn(imgMock, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 10,
      width: 400,
      height: 300,
      right: 410,
      bottom: 310,
      x: 10,
      y: 10,
      toJSON: () => {},
    } as DOMRect);

    const event = {
      currentTarget: paneMock,
      clientX: 50,
      clientY: 50,
    } as unknown as MouseEvent;

    component.onMouseMove(event);

    expect(component.isHovering()).toBe(true);
    expect(component.zoomPct()).toEqual({ x: 10, y: 13.333333333333334 });
    expect(component.lensPos()).toEqual({ x: -40, y: -40 }); // imgRect.left - paneRect.left + x - lensSize/2 = 0 + 40 - 80 = -40
  });

  it('onMouseLeave sets isHovering to false', () => {
    component.isHovering.set(true);
    component.onMouseLeave();
    expect(component.isHovering()).toBe(false);
  });
});
