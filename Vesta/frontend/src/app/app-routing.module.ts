import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInComponent } from './components/auth/sign-in/sign-in.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ObjectDevicesComponent } from './components/object/object-devices/object-devices.component';
import { ObjectInfoComponent } from './components/object/object-info/object-info.component';
import { ObjectListComponent } from './components/object/object-list/object-list.component';
import { ObjectPersonsListComponent } from './components/object/object-persons-list/object-persons-list.component';
import { ObjectPlansComponent } from './components/object/object-plans/object-plans.component';
import { ObjectServicesComponent } from './components/object/object-services/object-services.component';
import { ObjectVideoComponent } from './components/object/object-video/object-video.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { ServicesListComponent } from './components/services-list/services-list.component';
import { RoleGuard } from './shared/guard/role.guard';
import { UserRole } from './enums/user-role.enum';


const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'unauthorized', component: SignInComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'object-info/:id', component: ObjectInfoComponent, canActivate: [RoleGuard], data: { expectedRole: UserRole.user }},
  { path: 'object-plans/:id', component: ObjectPlansComponent, canActivate: [RoleGuard], data: { expectedRole: UserRole.user }},
  { path: 'object-video/:id', component: ObjectVideoComponent, canActivate: [RoleGuard], data: { expectedRole: UserRole.user }},
  { path: 'object-services/:id', component: ObjectServicesComponent, canActivate: [RoleGuard], data: { expectedRole: UserRole.user }},
  { path: 'object-devices/:id', component: ObjectDevicesComponent, canActivate: [RoleGuard], data: { expectedRole: UserRole.user }},
  { path: 'object-persons/:id', component: ObjectPersonsListComponent, canActivate: [RoleGuard], data: { expectedRole: UserRole.user }},
  { path: 'account/list', component: UsersListComponent, canActivate: [RoleGuard], data: { expectedRole: UserRole.user }},
  { path: 'services', component: ServicesListComponent, canActivate: [RoleGuard], data: { expectedRole: UserRole.service_technician }},
  { path: '**', component: ObjectListComponent, canActivate: [RoleGuard], data: { expectedRole: UserRole.user }},

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
