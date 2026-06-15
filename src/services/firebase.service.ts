import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import _firebaseConfig from '../../firebase-applet-config.json';

const firebaseConfig = _firebaseConfig as any;

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public app = initializeApp(firebaseConfig);
  // Configure Firestore with long-polling to prevent 'client is offline' errors in restricted environments
  public db = firebaseConfig.firestoreDatabaseId 
    ? initializeFirestore(this.app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId)
    : initializeFirestore(this.app, { experimentalForceLongPolling: true });
  public auth = getAuth(this.app);
  
  constructor() {
    if (typeof window !== 'undefined') {
      try {
         getAnalytics(this.app);
      } catch (e) {
         console.warn('Analytics not supported in this environment');
      }
    }
  }
}
