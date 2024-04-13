import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, DatePipe } from '@angular/common';
import { LightboxModule } from 'ngx-lightbox';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { environment } from '../environments/environment';
import { SignInComponent } from './components/auth/sign-in/sign-in.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ObjectCardComponent } from './components/object/object-card/object-card.component';
import { ObjectDevicesComponent } from './components/object/object-devices/object-devices.component';
import { ObjectInfoComponent } from './components/object/object-info/object-info.component';
import { ObjectListComponent } from './components/object/object-list/object-list.component';
import { ObjectPersonsListComponent } from './components/object/object-persons-list/object-persons-list.component';
import { ObjectPlansComponent } from './components/object/object-plans/object-plans.component';
import { ObjectPlanCardComponent } from './components/object/object-plan-card/object-plan-card.component';
import { ObjectServicesComponent } from './components/object/object-services/object-services.component';
import { ObjectVideoComponent } from './components/object/object-video/object-video.component';
import { SidebarComponent } from './components/object/sidebar/sidebar.component';
import { AddObjectModalComponent } from './components/modals/add-object-modal/add-object-modal.component';
import { ObjectPlanModalComponent } from './components/modals/object-plan-modal/object-plan-modal.component';
import { ObjectDeviceModalComponent } from './components/modals/object-device-modal/object-device-modal.component';
import { ObjectServiceModalComponent } from './components/modals/object-service-modal/object-service-modal.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { UserModalComponent } from './components/modals/user-modal/user-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { ObjectPersonModalComponent } from './components/modals/object-person-modal/object-person-modal.component';
import { ServicesListComponent } from './components/services-list/services-list.component';


@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    ForgotPasswordComponent,
    NavbarComponent,
    ObjectCardComponent,
    ObjectDevicesComponent,
    ObjectInfoComponent,
    ObjectListComponent,
    ObjectPersonsListComponent,
    ObjectPlanCardComponent,
    ObjectPlansComponent,
    ObjectServicesComponent,
    ObjectVideoComponent,
    SidebarComponent,
    AddObjectModalComponent,
    ObjectPlanModalComponent,
    ObjectDeviceModalComponent,
    ObjectServiceModalComponent,
    UsersListComponent,
    UserModalComponent,
    ObjectPersonModalComponent,
    ServicesListComponent
  ],
  imports: [
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AngularFireFunctionsModule,
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    LightboxModule
  ],
  providers: [
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
