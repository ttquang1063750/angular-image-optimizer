/**
 * Tiện ích trích xuất + chèn EXIF segment cho file JPEG.
 *
 * JPEG cấu trúc: bắt đầu bằng `FF D8` (SOI), sau đó là các segment
 * `FF <marker> <length-hi> <length-lo> <data...>`. EXIF nằm trong APP1
 * (`FF E1`) với chữ ký `Exif\0\0` ngay sau 4 byte length.
 *
 * Lưu ý:
 *  - Chỉ áp dụng cho JPEG (cả input và output).
 *  - WebP có spec riêng cho EXIF chunk nhưng không tương thích — out of scope.
 *  - Canvas re-encoding của trình duyệt strip mọi metadata, nên `inject` đơn
 *    giản là chèn segment vào sau SOI/JFIF mà không cần lo trùng lặp.
 */

const SOI_BYTE_1 = 0xff;
const SOI_BYTE_2 = 0xd8;
const APP0_MARKER = 0xe0;
const APP1_MARKER = 0xe1;
const SOS_MARKER = 0xda;
const EOI_MARKER = 0xd9;
const EXIF_SIGNATURE = 'Exif';

export function isJpegBytes(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === SOI_BYTE_1 && bytes[1] === SOI_BYTE_2;
}

/**
 * Tìm và trả về APP1 segment chứa EXIF (gồm marker `FF E1` + length + data).
 * Trả về `null` nếu không phải JPEG hoặc không có EXIF.
 */
export function extractJpegExifSegment(bytes: Uint8Array): Uint8Array | null {
  if (!isJpegBytes(bytes)) return null;

  let offset = 2;
  while (offset < bytes.length - 1) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];

    // Standalone markers (RSTn 0xD0-0xD7, TEM 0x01) không có length field
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      offset += 2;
      continue;
    }
    // SOS hoặc EOI: kết thúc vùng metadata
    if (marker === SOS_MARKER || marker === EOI_MARKER) return null;

    if (offset + 3 >= bytes.length) return null;
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2 || offset + 2 + length > bytes.length) return null;

    if (marker === APP1_MARKER && length >= 8) {
      const sig = String.fromCharCode(
        bytes[offset + 4],
        bytes[offset + 5],
        bytes[offset + 6],
        bytes[offset + 7],
      );
      if (sig === EXIF_SIGNATURE) {
        return bytes.slice(offset, offset + 2 + length);
      }
    }
    offset += 2 + length;
  }
  return null;
}

/**
 * Chèn EXIF segment vào JPEG ngay sau SOI (hoặc sau JFIF APP0 nếu có).
 * Trả về bytes mới. Nếu input không phải JPEG, trả về nguyên bản.
 */
export function injectExifSegment(jpegBytes: Uint8Array, exifSegment: Uint8Array): Uint8Array {
  if (!isJpegBytes(jpegBytes)) return jpegBytes;

  let insertAt = 2;
  // Nếu có JFIF APP0 (FFE0) ngay sau SOI, chèn EXIF sau JFIF để giữ thứ tự chuẩn
  if (
    jpegBytes.length > 4 &&
    jpegBytes[2] === 0xff &&
    jpegBytes[3] === APP0_MARKER &&
    jpegBytes.length > 5
  ) {
    const jfifLen = (jpegBytes[4] << 8) | jpegBytes[5];
    insertAt = 2 + 2 + jfifLen;
  }

  const result = new Uint8Array(jpegBytes.length + exifSegment.length);
  result.set(jpegBytes.subarray(0, insertAt), 0);
  result.set(exifSegment, insertAt);
  result.set(jpegBytes.subarray(insertAt), insertAt + exifSegment.length);
  return result;
}

/**
 * Convenience: nhận Blob gốc + Blob đã nén, trả Blob mới có EXIF.
 * Nếu không tìm thấy EXIF trong nguồn, trả về `compressed` nguyên bản.
 */
export async function preserveJpegExif(original: Blob, compressed: Blob): Promise<Blob> {
  const originalBytes = new Uint8Array(await original.arrayBuffer());
  const exifSegment = extractJpegExifSegment(originalBytes);
  if (!exifSegment) return compressed;

  const compressedBytes = new Uint8Array(await compressed.arrayBuffer());
  const merged = injectExifSegment(compressedBytes, exifSegment);
  // Cast giải quyết stricter typing `ArrayBufferLike` → `ArrayBuffer` cho Blob ctor
  return new Blob([merged.buffer as ArrayBuffer], { type: compressed.type });
}
