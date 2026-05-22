import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import type { WatermarkPreviewDialogData } from './watermark-preview-dialog.component';

/**
 * Lazy-open WatermarkPreviewDialog qua CDK Dialog. Dynamic import để bundle
 * không phình initial — pattern giống openSupportDialogLazy.
 */
export async function openWatermarkPreviewDialogLazy(
  envInjector: EnvironmentInjector,
  data: WatermarkPreviewDialogData,
  ariaLabel: string,
): Promise<void> {
  const [{ Dialog }, { WatermarkPreviewDialogComponent }] = await Promise.all([
    import('@angular/cdk/dialog'),
    import('./watermark-preview-dialog.component'),
  ]);

  runInInjectionContext(envInjector, () => {
    const dialog = inject(Dialog);
    dialog.open(WatermarkPreviewDialogComponent, {
      data,
      panelClass: 'watermark-preview-dialog-panel',
      ariaLabel,
      autoFocus: 'dialog',
      disableClose: false,
    });
  });
}
