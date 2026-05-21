import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileItemComponent } from './file-item.component';
import { UploaderStateService } from '../../../uploader-state.service';
import { ProcessedFile } from '../../../image-processing.model';

vi.mock('heic2any', () => ({
  default: vi.fn(),
}));

describe('FileItemComponent', () => {
  let component: FileItemComponent;
  let fixture: ComponentFixture<FileItemComponent>;
  let stateMock: Partial<UploaderStateService>;

  const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' });

  const doneItem: ProcessedFile = {
    id: 'abc',
    file: mockFile,
    status: 'done',
    progress: 100,
    result: {
      originalFile: mockFile,
      compressedFile: new File([''], 'photo.jpg', { type: 'image/jpeg' }),
      originalSize: 2000,
      compressedSize: 1000,
      savedPercentage: 50,
      compressedUrl: 'blob:done',
    },
  };

  beforeEach(async () => {
    stateMock = {
      removeFile: vi.fn(),
      openComparison: vi.fn(),
      createBlobUrl: vi.fn().mockReturnValue('blob:cached'),
    };

    await TestBed.configureTestingModule({
      imports: [FileItemComponent],
      providers: [{ provide: UploaderStateService, useValue: stateMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(FileItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', doneItem);
    fixture.detectChanges();
  });

  it('smoke: render được', () => {
    expect(component).toBeTruthy();
  });

  it('remove() delegate state.removeFile với id của item', () => {
    component.remove();
    expect(stateMock.removeFile).toHaveBeenCalledWith('abc');
  });

  it('openComparison() delegate state.openComparison với item', () => {
    component.openComparison();
    expect(stateMock.openComparison).toHaveBeenCalledWith(doneItem);
  });

  it('download() không làm gì khi item chưa done', () => {
    fixture.componentRef.setInput('item', {
      ...doneItem,
      status: 'compressing',
      result: undefined,
    });
    fixture.detectChanges();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    component.download();
    expect(clickSpy).not.toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('download() trigger click anchor khi item done', () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    component.download();
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('formatBytes hiển thị KB/MB chuẩn SI', () => {
    expect(component.formatBytes(0)).toBe('0 Bytes');
    expect(component.formatBytes(1000)).toBe('1 KB');
    expect(component.formatBytes(1_500_000)).toBe('1.5 MB');
  });
});
