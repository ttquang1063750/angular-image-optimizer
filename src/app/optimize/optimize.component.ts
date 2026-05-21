import { Component } from '@angular/core';
import { ImageUploaderComponent } from '../image-uploader/image-uploader.component';

@Component({
  selector: 'app-optimize',
  standalone: true,
  imports: [ImageUploaderComponent],
  template: ` <app-image-uploader></app-image-uploader> `,
})
export class OptimizeComponent {}
