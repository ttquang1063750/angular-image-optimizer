import { Routes } from '@angular/router';
import { langGuard, rootRedirectGuard } from './shared/lang.guard';
import { MarketingLayoutComponent } from './shared/layout/marketing-layout/marketing-layout.component';
import { AppShellLayoutComponent } from './shared/layout/app-shell-layout/app-shell-layout.component';
import { LandingComponent } from './pages/landing/landing.component';
import { AboutComponent } from './pages/about/about.component';
import { ChangelogComponent } from './pages/changelog/changelog.component';
import { BlogListComponent } from './pages/blog/blog-list.component';
import { BlogPostComponent } from './pages/blog/blog-post.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootRedirectGuard],
    children: [],
  },
  {
    path: ':lang/optimize',
    canActivate: [langGuard],
    component: AppShellLayoutComponent,
    loadChildren: () =>
      import('./optimize/optimize.component').then((m) => [
        { path: '', component: m.OptimizeComponent },
      ]),
  },
  {
    path: ':lang',
    canActivate: [langGuard],
    component: MarketingLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', component: LandingComponent },
      { path: 'about', component: AboutComponent },
      { path: 'changelog', component: ChangelogComponent },
      { path: 'blog', component: BlogListComponent },
      { path: 'blog/:slug', component: BlogPostComponent },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
