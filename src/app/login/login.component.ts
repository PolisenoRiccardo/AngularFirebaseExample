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
      const data = await this.GetUsersByCondition("age", ">=", 10, 5).subscribe(data => {
        const users = data;
        users.forEach(user => {
          console.log(user.age, user.email);
        });
      });
    } catch (error) {
      this.message = 'Login failed. Please check your credentials.';
      console.error('Login error:', error);
    }
  }
  //#endregion

  //#region SIGNUP
  async SignUp() {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.emailSignUp, this.passwordSignUp);
      const user: AngularFireUser = userCredential.user;
      await this.SetDisplayName(user, this.usernameSignUp);
      await this.CreateUserDocument(user.uid, user.displayName as string, user.email as string)
      this.messageSignUp = `Sign Up successful! Welcome, ${user.displayName}`;
      console.log('User:', user);
    } catch (error) {
      this.messageSignUp = 'Sign Up failed. Please check your inputs.';
      console.error('Sign Up error:', error);
    }
  }

  async SetDisplayName(user: AngularFireUser, displayName: string): Promise<void> {
    if (user) {
      try {

        await updateProfile(user, { displayName });
        console.log('Display name set to:', displayName);
      } catch (error) {
        console.error('Error setting display name:', error);
        this.messageSignUp = 'Failed to set username. Please check your connection';
      }
    }
  }
  //#endregion

  //#region WRITE
  async CreateUserDocument(userId: string, username: string, email: string) {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await setDoc(userRef, {
        username: username,
        email: email,
        age: Math.floor(Math.random() * 99) + 1
      });
      console.log('User document created with ID:', userId);
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  }
  //#region 

  //#region QUERIES
  GetUsersByCondition(field: string, operator: any, value: any, limitNum: any): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where(field, operator, value), limit(limitNum));
    return collectionData(q);
  }
  //#endregion
}
