import { Injectable, inject, signal } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { User, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private fb = inject(FirebaseService);
  
  public user = signal<User | null>(null);
  public ready = signal<boolean>(false);
  
  constructor() {
    onAuthStateChanged(this.fb.auth, (user) => {
      this.user.set(user);
      this.ready.set(true);
    });
  }
  
  async login() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.fb.auth, provider);
    } catch (e) {
      console.error(e);
    }
  }
  
  async logout() {
    await signOut(this.fb.auth);
  }
  
  public isAdmin() {
    const u = this.user();
    return u && u.email === 'meetjoshiraru@gmail.com' && u.emailVerified;
  }
}
