import { Component, inject, signal } from '@angular/core';
import { TranslationService } from '../../translation.service';
import { UploaderStateService } from '../../uploader-state.service';
import { FileItemComponent } from './file-item/file-item.component';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [FileItemComponent],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.scss',
})
export class FileListComponent {
  private readonly translationService = inject(TranslationService);
  private readonly state = inject(UploaderStateService);

  readonly t = this.translationService.t;
  readonly processedFiles = this.state.processedFiles;

  readonly draggedIndex = signal<number | null>(null);
  readonly dragOverIndex = signal<number | null>(null);
  readonly draggedRowHeight = signal<number>(80);

  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex.set(index);
    const target = event.currentTarget as HTMLElement | null;
    if (target?.offsetHeight) {
      this.draggedRowHeight.set(target.offsetHeight);
    }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  // Container-level dragover: detect target qua cursor Y position thay vì DOM
  // element được hover. Tránh flicker khi drop-slot insert làm layout shift đổi
  // element ở dưới cursor.
  onContainerDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    if (this.draggedIndex() === null) return;

    const container = event.currentTarget as HTMLElement;
    const rows = container.querySelectorAll<HTMLElement>('.file-row');
    if (rows.length === 0) return;

    const cursorY = event.clientY;
    let targetIdx = rows.length - 1;
    for (let i = 0; i < rows.length; i++) {
      if (cursorY < rows[i].getBoundingClientRect().bottom) {
        targetIdx = i;
        break;
      }
    }

    if (this.dragOverIndex() !== targetIdx) {
      this.dragOverIndex.set(targetIdx);
    }
  }

  onContainerDragLeave(event: DragEvent): void {
    const container = event.currentTarget as HTMLElement;
    const related = event.relatedTarget as Node | null;
    if (!related || !container.contains(related)) {
      this.dragOverIndex.set(null);
    }
  }

  onContainerDrop(event: DragEvent): void {
    event.preventDefault();
    const fromIndex = this.draggedIndex();
    const toIndex = this.dragOverIndex();
    if (fromIndex !== null && toIndex !== null && fromIndex !== toIndex) {
      this.state.reorderFiles(fromIndex, toIndex);
    }
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
  }

  onDragEnd(): void {
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
  }

  isDropAbove(index: number): boolean {
    const from = this.draggedIndex();
    const over = this.dragOverIndex();
    if (from === null || over === null || index !== over || from === over) return false;
    return from > over;
  }

  isDropBelow(index: number): boolean {
    const from = this.draggedIndex();
    const over = this.dragOverIndex();
    if (from === null || over === null || index !== over || from === over) return false;
    return from < over;
  }
}
