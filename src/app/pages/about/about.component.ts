import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <article class="container">
      <h1>About</h1>
      <p>
        Phase 5 sẽ điền nội dung: project story, tech stack, privacy commitment, open source link.
      </p>
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
export class AboutComponent {}
