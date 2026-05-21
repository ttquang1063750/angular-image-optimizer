import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  template: `
    <article class="container">
      <h1>Blog Post: {{ slug }}</h1>
      <p>Phase 6 sẽ implement render content theo slug.</p>
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
export class BlogPostComponent {
  private readonly route = inject(ActivatedRoute);
  readonly slug = this.route.snapshot.paramMap.get('slug');
}
