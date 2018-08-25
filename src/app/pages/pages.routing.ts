import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { PagesComponent } from './pages.component';
import { BlankComponent } from './blank/blank.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InspeccionComponent } from './inspeccion/inspeccion.component';
import { TsvUploaderComponent } from './tsv-uploader/tsv-uploader.component';

export const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        {
            path: 'Assets',
            component: InspeccionComponent,
            data: { breadcrumb: 'Assets' }
        },
        {
            path: 'Element',
            component: InspeccionComponent,
            data: { breadcrumb: 'Element' }
        },
        {
            path: 'Inspection',
            component: InspeccionComponent,
            data: { breadcrumb: 'Inspection' }
        },
        {
            path: 'Inspection',
            component: InspeccionComponent,
            data: { breadcrumb: 'Inspection' }
        },
        {
            path: 'Inspection',
            component: InspeccionComponent,
            data: { breadcrumb: 'Inspection' }
        },
        {
            path: 'Inspection',
            component: InspeccionComponent,
            data: { breadcrumb: 'Inspection' }
        },
        {
            path: '**',
            redirectTo: 'dashboard'
        }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
