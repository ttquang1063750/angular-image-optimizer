import { TestBed } from '@angular/core/testing';
import { ImageCompressionService } from './image-compression.service';
import { firstValueFrom } from 'rxjs';
import { toArray } from 'rxjs/operators';

vi.mock('jszip', () => {
  return {
    default: class MockJSZip {
      files: Record<string, Blob | string> = {};
      file(name: string, content: Blob | string) {
        this.files[name] = content;
      }
      async generateAsync(): Promise<Blob> {
        return new Blob([JSON.stringify(this.files)], { type: 'application/zip' });
      }
    },
  };
});

describe('ImageCompressionService', () => {
  let service: ImageCompressionService;

  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    // Mock Canvas Context
    const mockCtx = {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      getContext: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      transform: vi.fn(),
      setTransform: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn(),
    } as any;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx);

    // Mock HTMLCanvasElement.prototype.toBlob
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
      (callback: (blob: Blob | null) => void, type?: string) => {
        callback(new Blob(['mock_compressed_data'], { type: type || 'image/jpeg' }));
      },
    );

    // Mock HTMLImageElement
    // @ts-ignore
    global.Image = class {
      onload: () => void = () => {};
      width: number = 2000;
      height: number = 1000;
      set src(value: string) {
        setTimeout(() => this.onload(), 0);
      }
    };

    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageCompressionService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOptionsByPreset', () => {
    it('trả về options tương ứng cho các preset', () => {
      const light = service.getOptionsByPreset('light');
      expect(light.quality).toBe(0.9);
      expect(light.maxWidthOrHeight).toBe(3840);

      const medium = service.getOptionsByPreset('medium');
      expect(medium.quality).toBe(0.6);
      expect(medium.maxWidthOrHeight).toBe(1600);

      const max = service.getOptionsByPreset('max');
      expect(max.quality).toBe(0.2);
      expect(max.maxWidthOrHeight).toBe(1024);
    });
  });

  describe('nén ảnh với formats', () => {
    it('nén ảnh sang format JPEG với đuôi .jpg', async () => {
      const file = new File(['dummy_content'], 'test_image.png', { type: 'image/png' });
      const options = {
        quality: 0.6,
        format: 'image/jpeg' as const,
        resizeMode: 'auto' as const,
        maxWidthOrHeight: 1600,
      };

      const result$ = service.compressImagesWithProgress([{ file, id: '1' }], options);
      const emissions = await firstValueFrom(result$.pipe(toArray()));

      expect(emissions.length).toBe(2);
      expect(emissions[0].status).toBe('compressing');

      const doneEvent = emissions[1];
      expect(doneEvent.status).toBe('done');
      if (doneEvent.status === 'done' && doneEvent.result) {
        expect(doneEvent.result.compressedFile.name).toBe('test_image.jpg');
        expect(doneEvent.result.compressedFile.type).toBe('image/jpeg');
      }
    });

    it('nén ảnh sang format WebP với đuôi .webp', async () => {
      const file = new File(['dummy_content'], 'test_image.jpg', { type: 'image/jpeg' });
      const options = {
        quality: 0.6,
        format: 'image/webp' as const,
        resizeMode: 'auto' as const,
        maxWidthOrHeight: 1600,
      };

      const result$ = service.compressImagesWithProgress([{ file, id: '2' }], options);
      const emissions = await firstValueFrom(result$.pipe(toArray()));

      const doneEvent = emissions[1];
      expect(doneEvent.status).toBe('done');
      if (doneEvent.status === 'done' && doneEvent.result) {
        expect(doneEvent.result.compressedFile.name).toBe('test_image.webp');
        expect(doneEvent.result.compressedFile.type).toBe('image/webp');
      }
    });

    it('nén ảnh sang format AVIF với đuôi .avif', async () => {
      const file = new File(['dummy_content'], 'test_image.png', { type: 'image/png' });
      const options = {
        quality: 0.6,
        format: 'image/avif' as const,
        resizeMode: 'auto' as const,
        maxWidthOrHeight: 1600,
      };

      const result$ = service.compressImagesWithProgress([{ file, id: '3' }], options);
      const emissions = await firstValueFrom(result$.pipe(toArray()));

      const doneEvent = emissions[1];
      expect(doneEvent.status).toBe('done');
      if (doneEvent.status === 'done' && doneEvent.result) {
        expect(doneEvent.result.compressedFile.name).toBe('test_image.avif');
        expect(doneEvent.result.compressedFile.type).toBe('image/avif');
      }
    });
  });

  describe('generateZip', () => {
    it('tạo file zip chứa các file đã nén và tự động xử lý trùng tên', async () => {
      const originalFile1 = new File(['1'], 'img.jpg', { type: 'image/jpeg' });
      const originalFile2 = new File(['2'], 'img.jpg', { type: 'image/jpeg' });

      const compressedFile1 = new File(['1_nén'], 'img.jpg', { type: 'image/jpeg' });
      const compressedFile2 = new File(['2_nén'], 'img.jpg', { type: 'image/jpeg' });

      const processedFiles = [
        {
          id: '1',
          file: originalFile1,
          status: 'done' as const,
          progress: 100,
          result: {
            originalFile: originalFile1,
            compressedFile: compressedFile1,
            originalSize: 1,
            compressedSize: 1,
            savedPercentage: 0,
            compressedUrl: 'blob:1',
          },
        },
        {
          id: '2',
          file: originalFile2,
          status: 'done' as const,
          progress: 100,
          result: {
            originalFile: originalFile2,
            compressedFile: compressedFile2,
            originalSize: 1,
            compressedSize: 1,
            savedPercentage: 0,
            compressedUrl: 'blob:2',
          },
        },
      ];

      const zipBlob = await service.generateZip(processedFiles);
      expect(zipBlob).toBeTruthy();
      expect(zipBlob.type).toBe('application/zip');

      const zipText = await zipBlob.text();
      const filesObject = JSON.parse(zipText);

      expect(filesObject['img.jpg']).toBeDefined();
      expect(filesObject['img_1.jpg']).toBeDefined();
    });
  });
});
