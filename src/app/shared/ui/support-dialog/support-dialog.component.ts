import { Component, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslationService } from '../../../translation.service';

@Component({
  selector: 'app-support-dialog',
  standalone: true,
  imports: [],
  templateUrl: './support-dialog.component.html',
  styleUrl: './support-dialog.component.scss',
})
export class SupportDialogComponent {
  private readonly dialogRef = inject(DialogRef<void>);
  private readonly translation = inject(TranslationService);

  readonly t = this.translation.t;

  close(): void {
    this.dialogRef.close();
  }
}
