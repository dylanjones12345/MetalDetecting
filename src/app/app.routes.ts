import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { FindListComponent } from './components/find-list/find-list';
import { FindDetailComponent } from './components/find-detail/find-detail';
import { FindFormComponent } from './components/find-form/find-form';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'finds', component: FindListComponent },
  { path: 'finds/:id', component: FindDetailComponent },
  { path: 'add', component: FindFormComponent },
  { path: 'edit/:id', component: FindFormComponent },
  { path: '**', redirectTo: '' },
];
