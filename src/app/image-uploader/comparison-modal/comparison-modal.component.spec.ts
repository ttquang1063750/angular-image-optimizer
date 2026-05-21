import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComparisonModalComponent } from './comparison-modal.component';
import { UploaderStateService } from '../../uploader-state.service';
import { ImageCompressionService } from '../../image-compression.service';
import { signal } from '@angular/core';
import { ProcessedFile } from '../../image-processing.model';

vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

describe('ComparisonModalComponent', () => {
  let component: ComparisonModalComponent;
  let fixture: ComponentFixture<ComparisonModalComponent>;
  let stateMock: {
    comparingFile: ReturnType<typeof signal<ProcessedFile | null>>;
    comparisonSliderValue: ReturnType<typeof signal<number>>;
    closeComparison: ReturnType<typeof vi.fn>;
    setComparisonSlider: ReturnType<typeof vi.fn>;
    createBlobUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    stateMock = {
      comparingFile: signal<ProcessedFile | null>(null),
      comparisonSliderValue: signal(50),
      closeComparison: vi.fn(),
      setComparisonSlider: vi.fn(),
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

  it('updateSlider() delegate state.setComparisonSlider với số đọc từ event', () => {
    const event = { target: { valueAsNumber: 75 } } as unknown as Event;
    component.updateSlider(event);
    expect(stateMock.setComparisonSlider).toHaveBeenCalledWith(75);
  });
});
