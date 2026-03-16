import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { FindListComponent } from './components/find-list/find-list';
import { FindDetailComponent } from './components/find-detail/find-detail';
import { FindFormComponent } from './components/find-form/find-form';
import { WikiComponent } from './components/wiki/wiki';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'items', component: FindListComponent },
  { path: 'items/:id', component: FindDetailComponent },
  { path: 'wiki', component: WikiComponent },
  { path: 'add', component: FindFormComponent },
  { path: 'edit/:id', component: FindFormComponent },
  { path: 'finds', redirectTo: 'items' },
  { path: 'finds/:id', redirectTo: 'items/:id' },
  { path: '**', redirectTo: '' },
];
