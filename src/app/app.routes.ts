import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'job-detail/:id',
    loadComponent: () =>
      import('./job-detail/job-detail.page').then((m) => m.JobDetailPage),
  },
  {
    path: 'apply/:slug',  // Match format: apply/{jobId}-{slug}
    loadComponent: () =>
      import('./job-detail/job-detail.page').then((m) => m.JobDetailPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
