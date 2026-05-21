import { Component } from '@angular/core';

@Component({
  selector: 'app-changelog',
  standalone: true,
  template: `
    <article class="container">
      <h1>Changelog</h1>
      <p>Phase 5 sẽ điền version history.</p>
    </article>
  `,
  styles: [
    `
      .container {
        max-width: 720px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      h1 {
        margin-bottom: 16px;
      }
    `,
  ],
})
export class ChangelogComponent {}
