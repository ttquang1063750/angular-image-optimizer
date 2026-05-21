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
