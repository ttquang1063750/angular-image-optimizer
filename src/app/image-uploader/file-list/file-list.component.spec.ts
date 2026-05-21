import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FileListComponent } from './file-list.component';
import { UploaderStateService } from '../../uploader-state.service';
import { ImageCompressionService } from '../../image-compression.service';
import { signal } from '@angular/core';
import { ProcessedFile } from '../../image-processing.model';

vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

describe('FileListComponent', () => {
  let component: FileListComponent;
  let fixture: ComponentFixture<FileListComponent>;
  let stateMock: {
    processedFiles: ReturnType<typeof signal<ProcessedFile[]>>;
    reorderFiles: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    stateMock = {
      processedFiles: signal<ProcessedFile[]>([]),
      reorderFiles: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FileListComponent],
      providers: [
        { provide: UploaderStateService, useValue: stateMock },
        { provide: ImageCompressionService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('render empty state khi không có file', () => {
    const text: string = fixture.nativeElement.textContent ?? '';
    expect(text).toMatch(/Chưa có file|No files selected/);
  });

  it('onDrop gọi reorderFiles với previousIndex và currentIndex', () => {
    const event = { previousIndex: 0, currentIndex: 2 } as unknown as CdkDragDrop<unknown>;
    component.onDrop(event);
    expect(stateMock.reorderFiles).toHaveBeenCalledWith(0, 2);
  });

  it('onDrop bỏ qua khi previousIndex === currentIndex', () => {
    const event = { previousIndex: 1, currentIndex: 1 } as unknown as CdkDragDrop<unknown>;
    component.onDrop(event);
    expect(stateMock.reorderFiles).not.toHaveBeenCalled();
  });
});
