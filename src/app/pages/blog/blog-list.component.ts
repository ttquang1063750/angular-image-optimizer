import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../translation.service';
import { SeoService } from '../../shared/seo/seo.service';
import { BlogPost, readingTimeMinutes } from './blog-post.model';
import { postsByLang } from './blog-posts.registry';
import { AdsenseComponent } from '../../shared/ui/adsense/adsense.component';

interface CardView {
  post: BlogPost;
  readingMinutes: number;
}

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, AdsenseComponent],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
})
export class BlogListComponent {
  private readonly translation = inject(TranslationService);
  private readonly seo = inject(SeoService);

  readonly t = this.translation.t;
  readonly lang = this.translation.currentLang;

  readonly cards = computed<CardView[]>(() =>
    postsByLang(this.lang()).map((post) => ({
      post,
      readingMinutes: readingTimeMinutes(post.contentHtml),
    })),
  );

  constructor() {
    effect(() => {
      const t = this.translation.t();
      this.seo.setRoute({
        titleKey: 'seo_blog_title',
        descriptionKey: 'seo_blog_description',
        path: 'blog',
        breadcrumbs: [
          { name: t['nav_landing'], path: '' },
          { name: t['nav_blog'], path: 'blog' },
        ],
      });
    });
  }
}
