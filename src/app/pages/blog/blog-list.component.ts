import { Component } from '@angular/core';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  template: `
    <article class="container">
      <h1>Blog</h1>
      <p>Phase 6 sẽ scaffold list + 3 bài viết đầu tiên.</p>
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
export class BlogListComponent {}
