import { Routes } from '@angular/router';
import { langGuard, rootRedirectGuard, optimizeRedirectGuard } from './shared/lang.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootRedirectGuard],
    children: [],
  },
  {
    path: 'optimize',
    pathMatch: 'full',
    canActivate: [optimizeRedirectGuard],
    children: [],
  },
  {
    path: ':lang/optimize',
    canActivate: [langGuard],
    loadComponent: () =>
      import('./shared/layout/app-shell-layout/app-shell-layout.component').then(
        (m) => m.AppShellLayoutComponent,
      ),
    loadChildren: () =>
      import('./optimize/optimize.component').then((m) => [
        { path: '', component: m.OptimizeComponent },
      ]),
  },
  {
    path: ':lang',
    canActivate: [langGuard],
    loadComponent: () =>
      import('./shared/layout/marketing-layout/marketing-layout.component').then(
        (m) => m.MarketingLayoutComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/landing/landing.component').then((m) => m.LandingComponent),
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'changelog',
        loadComponent: () =>
          import('./pages/changelog/changelog.component').then((m) => m.ChangelogComponent),
      },
      {
        path: 'blog',
        loadComponent: () =>
          import('./pages/blog/blog-list.component').then((m) => m.BlogListComponent),
      },
      {
        path: 'blog/:slug',
        loadComponent: () =>
          import('./pages/blog/blog-post.component').then((m) => m.BlogPostComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
