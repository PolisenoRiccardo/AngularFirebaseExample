import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User as AngularFireUser } from '@angular/fire/auth';
import { updateProfile } from 'firebase/auth';
import { Firestore, getDoc, deleteDoc, doc, limit, setDoc, collection, query, getDocs, where, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  message: string = '';

  usernameSignUp: string = '';
  emailSignUp: string = '';
  passwordSignUp: string = '';
  messageSignUp: string = '';

  constructor(private auth: Auth, private firestore: Firestore) {}

  //#region LOGIN
  async Login() {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      const user: AngularFireUser = userCredential.user;
      this.message = `Login successful! Welcome, ${user.displayName}`;
      console.log('User:', user);
    } catch (error) {
      this.message = 'Login failed. Please check your credentials.';
      console.error('Login error:', error);
    }
  }
  //#endregion


  //#region QUERIES
  GetUsersByCondition(field: string, operator: any, value: any, limitNum: any): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where(field, operator, value), limit(limitNum));
    return collectionData(q);
  }
  //#endregion
}
