import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { collection, doc, query, orderBy, onSnapshot, setDoc, deleteDoc, updateDoc, serverTimestamp, getDoc, getDocs } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export interface Project {
  id: string; 
  title: string;
  client?: string;
  year?: string;
  description: string;
  category: string; 
  technologies: string[];
  imageUrl: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface BlogPost {
  id: string; 
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  readTime?: string;
  imageUrl: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private fb = inject(FirebaseService);
  private authService = inject(AuthService);

  private handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: this.fb.auth.currentUser?.uid,
        email: this.fb.auth.currentUser?.email,
        emailVerified: this.fb.auth.currentUser?.emailVerified
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  // --- Projects ---
  getProjects(): Observable<Project[]> {
    return new Observable(obs => {
      const q = query(collection(this.fb.db, 'projects'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
        obs.next(items);
      }, (err) => {
        this.handleFirestoreError(err, OperationType.LIST, 'projects');
      });
      return () => unsub();
    });
  }

  getProjectBySlug(slug: string): Observable<Project | undefined> {
    return new Observable(obs => {
      const unsub = onSnapshot(doc(this.fb.db, 'projects', slug), (snap) => {
        if (snap.exists()) {
          obs.next({ id: snap.id, ...snap.data() } as Project);
        } else {
          obs.next(undefined);
        }
      }, err => {
        this.handleFirestoreError(err, OperationType.GET, `projects/${slug}`);
      });
      return () => unsub();
    });
  }

  async addProject(project: Project) {
    try {
      const { id, ...data } = project;
      await setDoc(doc(this.fb.db, 'projects', id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch(err) {
      this.handleFirestoreError(err, OperationType.CREATE, 'projects');
    }
  }

  async updateProject(id: string, data: Partial<Project>) {
    try {
      await updateDoc(doc(this.fb.db, 'projects', id), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch(err) {
      this.handleFirestoreError(err, OperationType.UPDATE, `projects/${id}`);
    }
  }

  async deleteProject(id: string) {
    try {
      await deleteDoc(doc(this.fb.db, 'projects', id));
    } catch (err) {
      this.handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
    }
  }

  // --- Blog Posts ---
  getBlogPosts(): Observable<BlogPost[]> {
    return new Observable(obs => {
      const q = query(collection(this.fb.db, 'posts'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
        obs.next(items);
      }, (err) => {
        this.handleFirestoreError(err, OperationType.LIST, 'posts');
      });
      return () => unsub();
    });
  }

  getBlogPostBySlug(slug: string): Observable<BlogPost | undefined> {
    return new Observable(obs => {
      const unsub = onSnapshot(doc(this.fb.db, 'posts', slug), (snap) => {
        if (snap.exists()) {
          obs.next({ id: snap.id, ...snap.data() } as BlogPost);
        } else {
          obs.next(undefined);
        }
      }, err => {
        this.handleFirestoreError(err, OperationType.GET, `posts/${slug}`);
      });
      return () => unsub();
    });
  }

  async addBlogPost(post: BlogPost) {
    try {
      const { id, ...data } = post;
      await setDoc(doc(this.fb.db, 'posts', id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      this.handleFirestoreError(err, OperationType.CREATE, 'posts');
    }
  }

  async deleteBlogPost(id: string) {
    try {
      await deleteDoc(doc(this.fb.db, 'posts', id));
    } catch (err) {
      this.handleFirestoreError(err, OperationType.DELETE, `posts/${id}`);
    }
  }

  // --- Inquiries ---
  getInquiries(): Observable<Inquiry[]> {
    return new Observable(obs => {
      const q = query(collection(this.fb.db, 'inquiries'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Inquiry));
        obs.next(items);
      }, (err) => {
        this.handleFirestoreError(err, OperationType.LIST, 'inquiries');
      });
      return () => unsub();
    });
  }

  async submitInquiry(inquiry: Partial<Inquiry>) {
    try {
      // Must have an explicit random ID for doc creation with our setDoc rule? Actually addDoc works if rules allow create without ID validation on ID itself, but we used isValidId. Wait! I wrote `isValidId(inquiryId)` which means ID must be an alphanumeric string. addDoc generates alphanumeric.
      const id = Date.now().toString() + Math.random().toString(36).substring(7);
      await setDoc(doc(this.fb.db, 'inquiries', id), {
        ...inquiry,
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      this.handleFirestoreError(err, OperationType.CREATE, 'inquiries');
    }
  }

  async updateInquiryStatus(id: string, status: string) {
    try {
      await updateDoc(doc(this.fb.db, 'inquiries', id), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      this.handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
    }
  }

}
