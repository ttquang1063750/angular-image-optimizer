import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageUploaderComponent } from './image-uploader/image-uploader.component';
import { TranslationService } from './translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ImageUploaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly translationService = inject(TranslationService);

  readonly t = this.translationService.t;
  protected readonly title = signal('Image Optimizer');
  protected readonly isSupportModalOpen = signal(false);

  toggleSupportModal(open: boolean): void {
    this.isSupportModalOpen.set(open);
  }
}
