import { Component, inject } from '@angular/core';
import { TranslationService } from '../../../../translation.service';

type Cell = 'yes' | 'no' | 'partial';

interface ComparisonRow {
  labelKey: string;
  ours: Cell;
  tinypng: Cell;
  squoosh: Cell;
}

@Component({
  selector: 'app-landing-comparison',
  standalone: true,
  imports: [],
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.scss',
})
export class ComparisonComponent {
  private readonly translation = inject(TranslationService);
  readonly t = this.translation.t;

  readonly rows: ComparisonRow[] = [
    { labelKey: 'compare_row_privacy', ours: 'yes', tinypng: 'no', squoosh: 'yes' },
    { labelKey: 'compare_row_free', ours: 'yes', tinypng: 'partial', squoosh: 'yes' },
    { labelKey: 'compare_row_bulk', ours: 'yes', tinypng: 'partial', squoosh: 'no' },
    { labelKey: 'compare_row_watermark', ours: 'yes', tinypng: 'no', squoosh: 'no' },
    { labelKey: 'compare_row_resize', ours: 'yes', tinypng: 'no', squoosh: 'yes' },
    { labelKey: 'compare_row_naming', ours: 'yes', tinypng: 'no', squoosh: 'no' },
    { labelKey: 'compare_row_heic', ours: 'yes', tinypng: 'no', squoosh: 'no' },
    { labelKey: 'compare_row_preset', ours: 'yes', tinypng: 'no', squoosh: 'no' },
  ];

  cellLabel(cell: Cell): string {
    return this.t()[`compare_${cell}`];
  }
}
