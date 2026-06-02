import { ImageCompressorEngine } from './image-compressor-engine';

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

describe('ImageCompressorEngine', () => {
  let engine: ImageCompressorEngine;

  beforeEach(() => {
    engine = new ImageCompressorEngine();
  });

  describe('isHeic', () => {
    it('nhận diện đúng các định dạng HEIC/HEIF', () => {
      const fileHeic = new File([''], 'photo.heic', { type: 'image/heic' });
      const fileHeif = new File([''], 'photo.HEIF', { type: 'image/heif' });
      const fileJpg = new File([''], 'photo.jpg', { type: 'image/jpeg' });

      expect(engine.isHeic(fileHeic)).toBe(true);
      expect(engine.isHeic(fileHeif)).toBe(true);
      expect(engine.isHeic(fileJpg)).toBe(false);
    });
  });

  describe('resolveResizeDimensions', () => {
    it('tính toán đúng kích thước khi chọn mode auto (maxWidthOrHeight)', () => {
      const options = {
        quality: 0.8,
        resizeMode: 'auto' as const,
        maxWidthOrHeight: 1000,
      };

      // Nhỏ hơn max -> giữ nguyên
      const dim1 = engine.resolveResizeDimensions(800, 600, options);
      expect(dim1.width).toBe(800);
      expect(dim1.height).toBe(600);

      // Lớn hơn max -> co lại theo tỉ lệ
      const dim2 = engine.resolveResizeDimensions(2000, 1000, options);
      expect(dim2.width).toBe(1000);
      expect(dim2.height).toBe(500);
    });

    it('tính toán đúng kích thước khi chọn mode width', () => {
      const options = {
        quality: 0.8,
        resizeMode: 'width' as const,
        resizeWidth: 800,
        maxWidthOrHeight: 1600,
      };

      const dim = engine.resolveResizeDimensions(2000, 1000, options);
      expect(dim.width).toBe(800);
      expect(dim.height).toBe(400); // 800 * (1000 / 2000)
    });

    it('tính toán đúng kích thước khi chọn mode height', () => {
      const options = {
        quality: 0.8,
        resizeMode: 'height' as const,
        resizeHeight: 500,
        maxWidthOrHeight: 1600,
      };

      const dim = engine.resolveResizeDimensions(2000, 1000, options);
      expect(dim.width).toBe(1000); // 500 * (2000 / 1000)
      expect(dim.height).toBe(500);
    });

    it('tính toán đúng kích thước khi chọn mode percent', () => {
      const options = {
        quality: 0.8,
        resizeMode: 'percent' as const,
        resizePercent: 50,
        maxWidthOrHeight: 1600,
      };

      const dim = engine.resolveResizeDimensions(2000, 1000, options);
      expect(dim.width).toBe(1000);
      expect(dim.height).toBe(500);
    });
  });

  describe('generateZip', () => {
    it('tạo file zip và tự động đánh số khi trùng tên', async () => {
      const orig = new File([''], 'img.jpg', { type: 'image/jpeg' });
      const comp1 = new File(['data1'], 'img.jpg', { type: 'image/jpeg' });
      const comp2 = new File(['data2'], 'img.jpg', { type: 'image/jpeg' });

      const processed = [
        {
          id: '1',
          file: orig,
          status: 'done' as const,
          progress: 100,
          result: {
            originalFile: orig,
            compressedFile: comp1,
            originalSize: 10,
            compressedSize: 5,
            savedPercentage: 50,
            compressedUrl: 'blob:1',
          },
        },
        {
          id: '2',
          file: orig,
          status: 'done' as const,
          progress: 100,
          result: {
            originalFile: orig,
            compressedFile: comp2,
            originalSize: 10,
            compressedSize: 6,
            savedPercentage: 40,
            compressedUrl: 'blob:2',
          },
        },
      ];

      const zipBlob = await engine.generateZip(processed);
      expect(zipBlob.type).toBe('application/zip');

      const zipText = await zipBlob.text();
      const filesObject = JSON.parse(zipText);

      expect(filesObject['img.jpg']).toBeDefined();
      expect(filesObject['img_1.jpg']).toBeDefined();
    });
  });
});
