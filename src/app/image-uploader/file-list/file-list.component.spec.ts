import { ComponentFixture, TestBed } from '@angular/core/testing';
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
    // Có thể là VI ("Chưa có file") hoặc EN ("No files selected") tuỳ navigator.language
    expect(text).toMatch(/Chưa có file|No files selected/);
  });

  it('onDragStart set draggedIndex và effectAllowed = move', () => {
    const setData = vi.fn();
    const dt = { effectAllowed: 'none', setData } as unknown as DataTransfer;
    const event = { dataTransfer: dt } as unknown as DragEvent;

    component.onDragStart(event, 2);

    expect(component.draggedIndex()).toBe(2);
    expect(dt.effectAllowed).toBe('move');
    expect(setData).toHaveBeenCalledWith('text/plain', '2');
  });

  it('onDragOver set dragOverIndex và preventDefault', () => {
    const preventDefault = vi.fn();
    const dt = { dropEffect: 'none' } as unknown as DataTransfer;
    const event = { preventDefault, dataTransfer: dt } as unknown as DragEvent;

    component.onDragOver(event, 1);

    expect(preventDefault).toHaveBeenCalled();
    expect(component.dragOverIndex()).toBe(1);
    expect(dt.dropEffect).toBe('move');
  });

  it('onDragLeave chỉ clear dragOverIndex khi đúng index', () => {
    component.dragOverIndex.set(1);
    component.onDragLeave(0);
    expect(component.dragOverIndex()).toBe(1);
    component.onDragLeave(1);
    expect(component.dragOverIndex()).toBeNull();
  });

  it('onDrop gọi state.reorderFiles và reset state', () => {
    component.draggedIndex.set(0);
    const preventDefault = vi.fn();
    const event = { preventDefault } as unknown as DragEvent;

    component.onDrop(event, 2);

    expect(preventDefault).toHaveBeenCalled();
    expect(stateMock.reorderFiles).toHaveBeenCalledWith(0, 2);
    expect(component.draggedIndex()).toBeNull();
    expect(component.dragOverIndex()).toBeNull();
  });

  it('onDrop bỏ qua khi from === target', () => {
    component.draggedIndex.set(1);
    component.onDrop({ preventDefault: vi.fn() } as unknown as DragEvent, 1);
    expect(stateMock.reorderFiles).not.toHaveBeenCalled();
  });

  it('onDragEnd reset cả hai signal', () => {
    component.draggedIndex.set(0);
    component.dragOverIndex.set(1);
    component.onDragEnd();
    expect(component.draggedIndex()).toBeNull();
    expect(component.dragOverIndex()).toBeNull();
  });
});
