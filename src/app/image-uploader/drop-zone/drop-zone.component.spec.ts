import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropZoneComponent } from './drop-zone.component';

describe('DropZoneComponent', () => {
  let component: DropZoneComponent;
  let fixture: ComponentFixture<DropZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropZoneComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DropZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('khởi tạo isDragging = false', () => {
    expect(component.isDragging()).toBe(false);
  });

  it('onDragOver set isDragging = true', () => {
    const event = { preventDefault: vi.fn() } as unknown as DragEvent;
    component.onDragOver(event);
    expect(component.isDragging()).toBe(true);
  });

  it('onDragLeave set isDragging = false', () => {
    component.isDragging.set(true);
    const event = { preventDefault: vi.fn() } as unknown as DragEvent;
    component.onDragLeave(event);
    expect(component.isDragging()).toBe(false);
  });

  it('emit filesSelected khi drop file ảnh hợp lệ', () => {
    const emitSpy = vi.spyOn(component.filesSelected, 'emit');
    const file = new File([''], 'a.jpg', { type: 'image/jpeg' });
    const dataTransfer = { files: [file] } as unknown as DataTransfer;
    const event = { preventDefault: vi.fn(), dataTransfer } as unknown as DragEvent;

    component.onDrop(event);

    expect(emitSpy).toHaveBeenCalledWith([file]);
    expect(component.isDragging()).toBe(false);
  });

  it('không emit khi drop file không phải ảnh', () => {
    const emitSpy = vi.spyOn(component.filesSelected, 'emit');
    const file = new File([''], 'a.txt', { type: 'text/plain' });
    const dataTransfer = { files: [file] } as unknown as DataTransfer;
    const event = { preventDefault: vi.fn(), dataTransfer } as unknown as DragEvent;

    component.onDrop(event);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('chấp nhận file .heic dù MIME không phải image', () => {
    const emitSpy = vi.spyOn(component.filesSelected, 'emit');
    const file = new File([''], 'photo.heic', { type: '' });
    const dataTransfer = { files: [file] } as unknown as DataTransfer;
    const event = { preventDefault: vi.fn(), dataTransfer } as unknown as DragEvent;

    component.onDrop(event);

    expect(emitSpy).toHaveBeenCalledWith([file]);
  });

  it('openFilePicker click vào file input ẩn', () => {
    const clickSpy = vi.spyOn(component.fileInput.nativeElement, 'click').mockImplementation(() => {
      // no-op: avoid native file picker side effect in jsdom
    });
    component.openFilePicker();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('onFileSelected reset input.value sau khi emit', () => {
    const emitSpy = vi.spyOn(component.filesSelected, 'emit');
    const file = new File([''], 'a.png', { type: 'image/png' });
    const target = { files: [file], value: 'x' } as unknown as HTMLInputElement;
    const event = { target } as unknown as Event;

    component.onFileSelected(event);

    expect(emitSpy).toHaveBeenCalled();
    expect(target.value).toBe('');
  });
});
