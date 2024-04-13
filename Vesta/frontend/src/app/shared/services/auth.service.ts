import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { User } from '../models/user.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { RoleService } from './role.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { FirebaseService } from './firebase.service';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom } from 'rxjs';
import { UserRole } from 'src/app/enums/user-role.enum';
import { AlertifyService } from 'src/app/shared/services/alertify.service';


@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {

  userData: any;
  loggedUserData: User = null;
  usersRef: AngularFirestoreCollection<User>;

  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone,
    private roleService: RoleService,
    private db: AngularFirestore,
    private firebaseService: FirebaseService,
    private alertify: AlertifyService
  )
  {
    sessionStorage.clear();
    this.usersRef = db.collection('/users');
  }

  async SignIn(email: string, password: string) {
    try {
      sessionStorage.clear();

      const result = await this.afAuth.signInWithEmailAndPassword(email, password);

      await this.GetUserData(result.user);

      this.afAuth.authState.subscribe( (user) => {
        if (user) {
          const userRole: number = this.roleService.getUserRole();
          const userServiceTechnician: number = UserRole.service_technician;

          sessionStorage.setItem('user', JSON.stringify(user));

          if (userRole !== null) {
            if (userRole === userServiceTechnician) {
              this.router.navigateByUrl('services');
            } else {
              this.router.navigateByUrl('object-list');
            }
          }

          if (this.loggedUserData && this.loggedUserData.displayName) {
            this.alertify.success(`<i class="bi bi-person"></i> Witaj ${this.loggedUserData.displayName}!`);
          }
        }
      });
    } catch (error) {
      this.alertify.error(`Błąd logowania: ${error.message}`);
    }
  }

  async ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('E-mail dotyczący resetowania hasła został wysłany. Sprawdź swoją skrzynkę odbiorczą.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(sessionStorage.getItem('user')!);
    return user !== null && user.emailVerified !== false ? true : false;
  }

  get getLoggedUserName(): boolean {
    const user = JSON.parse(sessionStorage.getItem('user')!);
    return user.displayName;
  }

  get getLoggedUserID(): string {
    const user = JSON.parse(sessionStorage.getItem('user')!);
    return user !== null ? user.uid : null;
  }

  GetAvailableBuildingsIds(): string {
    if (this.loggedUserData.availableBuildingIds) {
    return this.loggedUserData.availableBuildingIds;
    } else {
      return null;
    }
  }

  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );

    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      availableBuildingIds: user.availableBuildingIds
    };

    return userRef.set(userData, {
      merge: true,
    });
  }

  GetUserData(user: any): Promise<void> {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

    return new Promise<void>((resolve, reject) => {
      userRef.get().subscribe(
        (userData) => {
          this.loggedUserData = userData.data();
          this.roleService.setUserRole(this.loggedUserData.role);
          resolve();
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async SignOut() {
    return this.afAuth.signOut().then(() => {
      sessionStorage.clear();
      this.roleService.setUserRole(null);
      this.router.navigateByUrl('sign-in');
      this.loggedUserData = null;
    });
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await lastValueFrom(this.firebaseService.removeUser(userId));

      await this.db.doc(`users/${userId}`).delete();

      console.log('Użytkownik został pomyślnie usunięty z Firebase Auth i Firestore.');
    } catch (error) {
      console.error('Błąd podczas usuwania użytkownika:', error);
      throw error;
    }
  }

  GetAllUsers(): AngularFirestoreCollection<User> {
    return this.usersRef;
  }

  async addUser(user: User): Promise<void> {
    try {
      if (user.uid  === undefined || user.uid.trim() === ''){
        user.uid = uuidv4();
      }
      console.log('user' + user.availableBuildingIds);
      this.SetUserData(user);
      await this.firebaseService.addUser(user.uid, user.email, user.displayName);
      console.log('Użytkownik dodany pomyślnie.');

      await this.afAuth.sendPasswordResetEmail(user.email);
      console.log('Wiadomość resetowania hasła wysłana pomyślnie.');

    } catch (error) {
      console.error('Błąd podczas dodawania użytkownika:', error);
      throw error;
    }
  }

  async editUser(userId: string, updatedUserData: User): Promise<void> {
    return this.db.collection('users').doc(userId).update(updatedUserData)
      .then(() => {
        console.log('Użytkownik został zaktualizowany pomyślnie.');
      })
      .catch((error) => {
        console.error('Błąd podczas aktualizacji użytkownika:', error);
        throw error;
      });
  }

  getContractorsForService(): AngularFirestoreCollection<User> {
    return this.db.collection<User>('/users', (ref) =>
      ref.where('role', '==', UserRole.service_technician)
    );
  }

  ngOnDestroy() {
    sessionStorage.clear();
  }

}
