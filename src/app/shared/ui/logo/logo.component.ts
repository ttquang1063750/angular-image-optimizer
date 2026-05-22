import { Component } from '@angular/core';

/**
 * Counter module-level → mỗi instance có gradient ID duy nhất. Tránh conflict
 * khi nhiều logo render cùng page (vd. marketing header + footer cùng lúc).
 * SSR reset mỗi prerender (fresh app instance), browser tăng dần qua các nav.
 */
let counter = 0;

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  readonly id = `logo-${++counter}`;
  readonly gradAId = `${this.id}-grad-a`;
  readonly gradBId = `${this.id}-grad-b`;

  get gradAFill(): string {
    return `url(#${this.gradAId})`;
  }
  get gradBFill(): string {
    return `url(#${this.gradBId})`;
  }
}
