import { extractJpegExifSegment, injectExifSegment, isJpegBytes, preserveJpegExif } from './exif';

// Helper xây dựng JPEG tối thiểu có thể parse được:
//   SOI (FF D8) + segments... + EOI (FF D9)
function buildJpeg(segments: number[][]): Uint8Array {
  const parts: number[] = [0xff, 0xd8];
  for (const seg of segments) parts.push(...seg);
  parts.push(0xff, 0xd9);
  return new Uint8Array(parts);
}

// Trả ArrayBuffer (thay vì Uint8Array) cho Blob ctor — tránh strict TS typing
function buildJpegBuffer(segments: number[][]): ArrayBuffer {
  return buildJpeg(segments).buffer as ArrayBuffer;
}

// APP1 EXIF segment giả với payload custom (5 byte content)
function buildExifApp1(payload: number[]): number[] {
  // marker + length(2) + "Exif\0\0"(6) + payload
  const length = 2 + 6 + payload.length;
  return [
    0xff,
    0xe1,
    (length >> 8) & 0xff,
    length & 0xff,
    0x45, // E
    0x78, // x
    0x69, // i
    0x66, // f
    0x00,
    0x00,
    ...payload,
  ];
}

// JFIF APP0 segment để test thứ tự chèn
function buildJfifApp0(): number[] {
  // marker + length(2 = 16) + "JFIF\0" + version 1.01 + units + density x/y + thumbnail 0x0
  return [
    0xff,
    0xe0,
    0x00,
    0x10,
    0x4a, // J
    0x46, // F
    0x49, // I
    0x46, // F
    0x00,
    0x01,
    0x01,
    0x00,
    0x00,
    0x48,
    0x00,
    0x48,
    0x00,
    0x00,
  ];
}

describe('utils/exif', () => {
  describe('isJpegBytes', () => {
    it('true cho bytes bắt đầu FF D8', () => {
      expect(isJpegBytes(new Uint8Array([0xff, 0xd8, 0x00]))).toBe(true);
    });

    it('false cho bytes khác', () => {
      expect(isJpegBytes(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
      expect(isJpegBytes(new Uint8Array([0xff]))).toBe(false);
      expect(isJpegBytes(new Uint8Array([]))).toBe(false);
    });
  });

  describe('extractJpegExifSegment', () => {
    it('trả về EXIF segment khi JPEG có APP1', () => {
      const exif = buildExifApp1([0x01, 0x02, 0x03]);
      const jpeg = buildJpeg([exif]);
      const result = extractJpegExifSegment(jpeg);
      expect(result).not.toBeNull();
      expect(Array.from(result!)).toEqual(exif);
    });

    it('null khi không có APP1 EXIF', () => {
      const jpeg = buildJpeg([buildJfifApp0()]);
      expect(extractJpegExifSegment(jpeg)).toBeNull();
    });

    it('null khi không phải JPEG', () => {
      expect(extractJpegExifSegment(new Uint8Array([0x89, 0x50, 0x4e]))).toBeNull();
    });

    it('null khi APP1 không có chữ ký "Exif" (vd. XMP)', () => {
      // APP1 với chữ ký "http" thay vì "Exif" (giả lập XMP segment)
      const fakeApp1 = [0xff, 0xe1, 0x00, 0x0a, 0x68, 0x74, 0x74, 0x70, 0x00, 0x00, 0x00, 0x00];
      const jpeg = buildJpeg([fakeApp1]);
      expect(extractJpegExifSegment(jpeg)).toBeNull();
    });

    it('skip JFIF APP0 và vẫn tìm được EXIF APP1', () => {
      const exif = buildExifApp1([0xaa, 0xbb]);
      const jpeg = buildJpeg([buildJfifApp0(), exif]);
      const result = extractJpegExifSegment(jpeg);
      expect(Array.from(result!)).toEqual(exif);
    });
  });

  describe('injectExifSegment', () => {
    it('chèn EXIF sau SOI khi không có JFIF', () => {
      const jpeg = buildJpeg([[0xff, 0xc0, 0x00, 0x03, 0xaa]]); // SOI + fake segment + EOI
      const exif = new Uint8Array(buildExifApp1([0x11]));
      const result = injectExifSegment(jpeg, exif);

      // Bytes 0,1 = FF D8 (SOI)
      expect(result[0]).toBe(0xff);
      expect(result[1]).toBe(0xd8);
      // Bytes 2..2+exif.length = exif
      expect(Array.from(result.subarray(2, 2 + exif.length))).toEqual(Array.from(exif));
      // Sau đó là phần còn lại
      expect(result.length).toBe(jpeg.length + exif.length);
    });

    it('chèn EXIF sau JFIF APP0 khi có JFIF', () => {
      const jfif = buildJfifApp0();
      const jpeg = buildJpeg([jfif]);
      const exif = new Uint8Array(buildExifApp1([0x22]));
      const result = injectExifSegment(jpeg, exif);

      // Sau SOI (2) + JFIF (jfif.length) = exif
      const insertAt = 2 + jfif.length;
      expect(Array.from(result.subarray(insertAt, insertAt + exif.length))).toEqual(
        Array.from(exif),
      );
    });

    it('không thay đổi khi input không phải JPEG', () => {
      const notJpeg = new Uint8Array([0x00, 0x01, 0x02]);
      const exif = new Uint8Array([0xff, 0xe1, 0x00, 0x02]);
      const result = injectExifSegment(notJpeg, exif);
      expect(Array.from(result)).toEqual([0x00, 0x01, 0x02]);
    });
  });

  describe('preserveJpegExif', () => {
    it('trả về JPEG mới với EXIF từ original', async () => {
      const exif = buildExifApp1([0xde, 0xad, 0xbe, 0xef]);
      const original = new Blob([buildJpegBuffer([exif])], { type: 'image/jpeg' });
      const compressed = new Blob([buildJpegBuffer([])], { type: 'image/jpeg' });

      const merged = await preserveJpegExif(original, compressed);
      const mergedBytes = new Uint8Array(await merged.arrayBuffer());
      const extracted = extractJpegExifSegment(mergedBytes);
      expect(extracted).not.toBeNull();
      expect(Array.from(extracted!)).toEqual(exif);
      expect(merged.type).toBe('image/jpeg');
    });

    it('trả về compressed nguyên bản khi original không có EXIF', async () => {
      const original = new Blob([buildJpegBuffer([])], { type: 'image/jpeg' });
      const compressed = new Blob([buildJpegBuffer([])], { type: 'image/jpeg' });

      const merged = await preserveJpegExif(original, compressed);
      expect(merged).toBe(compressed);
    });
  });
});
