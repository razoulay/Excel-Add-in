import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RouteGuardService } from './services/routeguard.service';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/authentication', pathMatch: 'full'},
  { path: 'dashboard', component: DashboardComponent, canActivate: [RouteGuardService] },
  { path: 'authentication', component: LoginComponent, canActivate: [RouteGuardService] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
