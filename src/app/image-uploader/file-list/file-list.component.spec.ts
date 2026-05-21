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

  beforeEach(async () => {
    const stateMock = {
      processedFiles: signal<ProcessedFile[]>([]),
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
});
