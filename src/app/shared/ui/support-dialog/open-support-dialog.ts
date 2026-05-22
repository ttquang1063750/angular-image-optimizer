import { EnvironmentInjector, runInInjectionContext, inject } from '@angular/core';

/**
 * Lazy-open SupportDialog. Dynamic import @angular/cdk/dialog + dialog
 * component để 2 thư viện này không nằm trong initial bundle của marketing
 * routes — tiết kiệm ~60KB raw / ~15KB gzip cho user chưa click Support.
 *
 * Yêu cầu inject EnvironmentInjector từ component (constructor scope) rồi
 * pass vào — vì khi promise resolve ta đã out khỏi injection context của
 * Angular nên phải tự cấp lại.
 */
export async function openSupportDialogLazy(
  envInjector: EnvironmentInjector,
  ariaLabel: string,
): Promise<void> {
  const [{ Dialog }, { SupportDialogComponent }] = await Promise.all([
    import('@angular/cdk/dialog'),
    import('./support-dialog.component'),
  ]);

  runInInjectionContext(envInjector, () => {
    const dialog = inject(Dialog);
    dialog.open(SupportDialogComponent, {
      panelClass: 'support-dialog-panel',
      ariaLabel,
      autoFocus: 'dialog',
    });
  });
}
