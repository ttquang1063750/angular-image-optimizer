import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageUploaderComponent } from './image-uploader/image-uploader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ImageUploaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Image Optimizer');
}
