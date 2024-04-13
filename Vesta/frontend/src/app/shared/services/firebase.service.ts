import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Observable } from 'rxjs';
import { lastValueFrom, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private functions: AngularFireFunctions;

  constructor(private afFunctions: AngularFireFunctions,
    private http: HttpClient) {
    this.functions = afFunctions;
  }

  removeUser(uid: string): Observable<any> {
    const requestBody = { uid: uid };

    return this.http.post('https://us-central1-vesta-proj.cloudfunctions.net/removeUser', requestBody)
      .pipe(
        catchError(error => {
          console.error('Błąd podczas wywoływania funkcji:', error);
          return throwError(error);
        })
      );
  }

  public async addUser(uid:string, email: string, displayName: string): Promise<void> {
    const addUserFunction = this.functions.httpsCallable('addUser');

    try {
      const result = await lastValueFrom(addUserFunction({ uid, email, displayName }));
      console.log('Wynik dodawania użytkownika:', result);
    } catch (error) {
      console.error('Błąd podczas dodawania użytkownika za pomocą Firebase Admin:', error);
      throw error;
    }
  }
}
