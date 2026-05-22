/**
 * Type-safe helpers cho `event.target` của các DOM events trong template.
 * Mục đích: tránh `(event.target as HTMLInputElement)` lặp đi lặp lại và
 * loại bỏ double-cast khi target là enum/literal union.
 */

export function getInputValue(event: Event): string {
  return (event.target as HTMLInputElement).value;
}

export function getNumberValue(event: Event): number {
  return (event.target as HTMLInputElement).valueAsNumber;
}

export function getSelectValue<T extends string = string>(event: Event): T {
  return (event.target as HTMLSelectElement).value as T;
}

export function getInputFiles(event: Event): FileList | null {
  return (event.target as HTMLInputElement).files;
}

export type ValidationReason = 'nan' | 'below_min' | 'above_max';

export interface ValidationResult {
  value: number;
  valid: boolean;
  reason?: ValidationReason;
}

/**
 * Kiểm tra giá trị số từ input event. Trả về `valid: false` kèm `reason`
 * (nan / below_min / above_max) để caller có thể hiển thị thông báo phù hợp.
 */
export function validateNumberInput(event: Event, min: number, max: number): ValidationResult {
  const value = getNumberValue(event);
  if (isNaN(value)) return { value, valid: false, reason: 'nan' };
  if (value < min) return { value, valid: false, reason: 'below_min' };
  if (value > max) return { value, valid: false, reason: 'above_max' };
  return { value, valid: true };
}

/**
 * Kiểm tra xem trình duyệt có hỗ trợ mã hóa ảnh sang định dạng AVIF qua Canvas hay không.
 * An toàn khi chạy ở Server-Side Rendering (SSR) do kiểm tra sự tồn tại của HTMLCanvasElement.
 */
export function isAvifEncodingSupported(): boolean {
  if (typeof HTMLCanvasElement === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').startsWith('data:image/avif');
  } catch {
    return false;
  }
}
