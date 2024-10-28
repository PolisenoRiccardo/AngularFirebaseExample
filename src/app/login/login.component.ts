import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User as AngularFireUser } from '@angular/fire/auth';
import { updateProfile } from 'firebase/auth';
import { Firestore, getDoc, deleteDoc, doc, limit, setDoc, collection, query, getDocs } from '@angular/fire/firestore';

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
      await this.deleteCollection('users', user.uid);
    } catch (error) {
      this.message = 'Login failed. Please check your credentials.';
      console.error('Login error:', error);
    }
  }

  async deleteCollection(collectionPath: string, document: string): Promise<void> {
    try {
      const collectionRef = collection(this.firestore, collectionPath);

      const limitedQuery = query(collectionRef, limit(1));

      const querySnapshot = await getDocs(limitedQuery);
      console.log("Got query, lenght of docs is:" + querySnapshot.docs.length)
      if (!querySnapshot.empty) {
        const documentToDelete = querySnapshot.docs[0];
        console.log('Specific field:', documentToDelete.data()['username']);
        await deleteDoc(doc(this.firestore, collectionPath, documentToDelete.id));
        console.log(`Document with ID ${documentToDelete.id} deleted successfully.`);
      } else {
        console.log('No document found to delete.');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
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

  async CreateUserDocument(userId: string, username: string, email: string) {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await setDoc(userRef, {
        username: username,
        email: email,
      });
      console.log('User document created with ID:', userId);
    } catch (error) {
      console.error('Error creating user document:', error);
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
}
