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

  it('onDragStart capture row height từ currentTarget.offsetHeight', () => {
    const setData = vi.fn();
    const dt = { effectAllowed: 'none', setData } as unknown as DataTransfer;
    const currentTarget = { offsetHeight: 96 } as unknown as HTMLElement;
    const event = { dataTransfer: dt, currentTarget } as unknown as DragEvent;

    component.onDragStart(event, 0);

    expect(component.draggedRowHeight()).toBe(96);
  });

  it('onDragStart giữ default height khi currentTarget không có offsetHeight', () => {
    const setData = vi.fn();
    const dt = { effectAllowed: 'none', setData } as unknown as DataTransfer;
    const event = { dataTransfer: dt } as unknown as DragEvent;
    const before = component.draggedRowHeight();

    component.onDragStart(event, 0);

    expect(component.draggedRowHeight()).toBe(before);
  });

  it('onContainerDragOver detect target qua cursor Y với getBoundingClientRect', () => {
    const preventDefault = vi.fn();
    const dt = { dropEffect: 'none' } as unknown as DataTransfer;

    // 3 row giả lập với bounding rect
    const rows = [
      { getBoundingClientRect: () => ({ bottom: 100 }) },
      { getBoundingClientRect: () => ({ bottom: 200 }) },
      { getBoundingClientRect: () => ({ bottom: 300 }) },
    ];
    const container = {
      querySelectorAll: vi.fn().mockReturnValue(rows),
    } as unknown as HTMLElement;
    component.draggedIndex.set(0);

    const event = {
      preventDefault,
      dataTransfer: dt,
      currentTarget: container,
      clientY: 150,
    } as unknown as DragEvent;
    component.onContainerDragOver(event);

    expect(preventDefault).toHaveBeenCalled();
    expect(dt.dropEffect).toBe('move');
    expect(component.dragOverIndex()).toBe(1);
  });

  it('onContainerDragOver chọn last row khi cursor dưới cùng', () => {
    const rows = [
      { getBoundingClientRect: () => ({ bottom: 100 }) },
      { getBoundingClientRect: () => ({ bottom: 200 }) },
    ];
    const container = {
      querySelectorAll: vi.fn().mockReturnValue(rows),
    } as unknown as HTMLElement;
    component.draggedIndex.set(0);

    component.onContainerDragOver({
      preventDefault: vi.fn(),
      dataTransfer: null,
      currentTarget: container,
      clientY: 999,
    } as unknown as DragEvent);

    expect(component.dragOverIndex()).toBe(1);
  });

  it('onContainerDragOver bỏ qua khi chưa có dragged item', () => {
    component.draggedIndex.set(null);
    component.onContainerDragOver({
      preventDefault: vi.fn(),
      dataTransfer: null,
      currentTarget: { querySelectorAll: vi.fn().mockReturnValue([]) },
      clientY: 50,
    } as unknown as DragEvent);
    expect(component.dragOverIndex()).toBeNull();
  });

  it('onContainerDragLeave clear khi cursor rời hẳn container', () => {
    component.dragOverIndex.set(1);
    const container = { contains: vi.fn().mockReturnValue(false) } as unknown as HTMLElement;
    component.onContainerDragLeave({
      currentTarget: container,
      relatedTarget: null,
    } as unknown as DragEvent);
    expect(component.dragOverIndex()).toBeNull();
  });

  it('onContainerDragLeave KHÔNG clear khi chuyển sang child element', () => {
    component.dragOverIndex.set(1);
    const child = document.createElement('div');
    const container = { contains: vi.fn().mockReturnValue(true) } as unknown as HTMLElement;
    component.onContainerDragLeave({
      currentTarget: container,
      relatedTarget: child,
    } as unknown as DragEvent);
    expect(component.dragOverIndex()).toBe(1);
  });

  it('onContainerDrop gọi reorderFiles và reset state', () => {
    component.draggedIndex.set(0);
    component.dragOverIndex.set(2);
    const preventDefault = vi.fn();

    component.onContainerDrop({ preventDefault } as unknown as DragEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(stateMock.reorderFiles).toHaveBeenCalledWith(0, 2);
    expect(component.draggedIndex()).toBeNull();
    expect(component.dragOverIndex()).toBeNull();
  });

  it('onContainerDrop bỏ qua khi from === to', () => {
    component.draggedIndex.set(1);
    component.dragOverIndex.set(1);
    component.onContainerDrop({ preventDefault: vi.fn() } as unknown as DragEvent);
    expect(stateMock.reorderFiles).not.toHaveBeenCalled();
  });

  it('onDragEnd reset cả hai signal', () => {
    component.draggedIndex.set(0);
    component.dragOverIndex.set(1);
    component.onDragEnd();
    expect(component.draggedIndex()).toBeNull();
    expect(component.dragOverIndex()).toBeNull();
  });

  it('isDropAbove/isDropBelow chỉ ra hướng drop dựa vào from/over', () => {
    // Drag DOWN (from < over) → indicator BELOW target
    component.draggedIndex.set(0);
    component.dragOverIndex.set(3);
    expect(component.isDropBelow(3)).toBe(true);
    expect(component.isDropAbove(3)).toBe(false);
    expect(component.isDropBelow(2)).toBe(false);

    // Drag UP (from > over) → indicator ABOVE target
    component.draggedIndex.set(4);
    component.dragOverIndex.set(1);
    expect(component.isDropAbove(1)).toBe(true);
    expect(component.isDropBelow(1)).toBe(false);

    // from === over → cả hai false
    component.draggedIndex.set(2);
    component.dragOverIndex.set(2);
    expect(component.isDropAbove(2)).toBe(false);
    expect(component.isDropBelow(2)).toBe(false);
  });
});
