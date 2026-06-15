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
  galleryImages?: string[];
  content?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  research?: string;
  product?: string;
  contribution?: string;
  value?: string;
  industry?: string;
  role?: string;
  duration?: string;
  overview?: string;
  problemList?: string[];
  solutionList?: string[];
  contributionList?: string[];
  outcomeList?: string[];
  keyLearning?: string;
  link?: string;
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
  author?: string;
  readTime?: string;
  imageUrl: string;
  galleryImages?: string[];
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

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'eco-tracker',
    title: 'Eco Tracker app',
    category: 'Mobile',
    client: 'EcoCorp Global',
    description: 'A comprehensive sustainability tracking application that helps users monitor their daily carbon footprint and make eco-friendly choices.',
    overview: 'A comprehensive sustainability tracking application that helps users monitor their daily carbon footprint and make eco-friendly choices.',
    challenge: 'The primary challenge was designing a system that could seamlessly track daily mobility, consumption, and energy use without requiring tedious manual data entry, all while maintaining strict user privacy and offering offline-first capabilities for users in remote locations.',
    solution: 'We architected a Flutter-based mobile application utilizing edge-computing models for local activity recognition. Firebase was implemented as the primary resilient data store with aggressive offline caching. The UI features a soft, neumorphic aesthetic that encourages positive reinforcement rather than guilt-driven metrics.',
    contribution: 'I led the mobile app architecture, designed the offline-first data synchronization strategy, built custom fluid animations, and implemented the core activity detection module using edge computing.',
    outcome: 'Post-launch, EcoCorp saw a 300% increase in active daily engagement compared to their previous web-portal. The application successfully tracked and offset over 50,000 tons of carbon within the first three months.',
    problemList: [
      'Guilt-driven interfaces led to high churn rates',
      'Manual entry was a major friction point',
      'Required offline capabilities for remote locations'
    ],
    solutionList: [
      'Positive-reinforcement approach',
      'Automated tracking through mobility sensors',
      'Edge computing for offline activity recognition',
      'Resilient offline caching with Firebase'
    ],
    contributionList: [
      'Led mobile app architecture',
      'Designed offline-first data sync strategy',
      'Built custom fluid animations',
      'Implemented ML edge computing module'
    ],
    outcomeList: [
      '300% increase in active daily engagement',
      'Tracked and offset 50,000+ tons of carbon',
      'Reached #1 in the app store sustainability category'
    ],
    keyLearning: 'The application successfully reduced the average time spent logging activities by 75% and established a scalable foundation.',
    technologies: ['Flutter', 'Firebase', 'Google Maps API'],
    imageUrl: 'https://picsum.photos/seed/mobile2/1200/800',
    year: '2025'
  },
  {
    id: 'digital-workflow-platform',
    title: 'Digital Workflow Platform',
    category: 'Web',
    client: 'Internal Enterprise',
    industry: 'Healthcare',
    role: 'Senior Software Developer',
    duration: '6 Months',
    description: 'A digital workflow platform that automated approval processes and reduced manual effort across multiple departments.',
    overview: 'Developed a digital workflow platform that automated approval processes and reduced manual effort across multiple departments.',
    challenge: 'When dealing with critical healthcare workflows, manual interventions and lack of visibility create severe operational bottlenecks. The enterprise was saddled with fragmented legacy systems that caused unacceptably high error rates. Our goal was to build a secure, unified web application that felt as fast and robust as a native desktop application, capable of processing large approval trees instantly.',
    solution: 'We achieved this by bypassing standard REST APIs for critical event streams and implementing an event-driven architecture using Node.js and Azure. The front-end leverages Angular for high-performance dashboard rendering. We adopted a clean, high-contrast aesthetic using a strict token-based design system ensuring visual consistency across 40+ complex data grid variations.',
    contribution: 'I architected the frontend state management for data streams and optimized the rendering pipelines to ensure peak performance even during heavy workload processing. I also led the backend API integration strategy and orchestrated the production deployment.',
    outcome: 'The new platform allows departments to react to operational shifts significantly faster than the legacy process. The solution reduced approval execution delays by 70%, eliminated data silos, and reached an 85% user adoption rate within the first quarter.',
    problemList: [
      'Manual and time-consuming process',
      'Lack of visibility into operations',
      'High error rates',
      'Disconnected systems'
    ],
    solutionList: [
      'Centralized web application',
      'Automated workflows',
      'Real-time dashboards',
      'Integration with existing systems'
    ],
    contributionList: [
      'Solution design',
      'Frontend development (Angular)',
      'Backend APIs (Node.js)',
      'Stakeholder collaboration',
      'Production deployment'
    ],
    outcomeList: [
      '70% reduction in processing time',
      '85% user adoption',
      'Improved reporting accuracy',
      'Reduced manual intervention'
    ],
    keyLearning: 'Building with continuous user feedback significantly improved adoption and reduced post-release changes.',
    technologies: ['Angular', 'Node.js', 'SQL Server', 'Azure', 'REST APIs'],
    imageUrl: 'https://picsum.photos/seed/healthcare1/1200/800',
    year: '2025'
  },
  {
    id: 'smart-home',
    title: 'Smart Home Hub',
    category: 'Design',
    client: 'Lumina Systems',
    description: 'A conceptual overhaul for a cohesive smart home management interface. The focus was on micro-interactions and reducing cognitive load.',
    overview: 'A conceptual overhaul for a cohesive smart home management interface. The focus was on micro-interactions and reducing cognitive load.',
    challenge: 'Modern smart homes are plagued by interface fragmentation. Users have to jump between five different apps to control lighting, climate, security, and media. We discovered through research that users\' mental models for controlling a home are spatial ("turn off the living room") rather than functional ("turn off the lights"). The objective was to unify these experiences into a single, highly intuitive control surface.',
    solution: 'We developed a modular widget OS layer using a strict baseline grid. The design relies heavily on spatial awareness—grouping controls by physical room rather than function type. Ambient blurred backgrounds were utilized to passively reflect the current state (time of day, weather, active media) without demanding visual focus.',
    contribution: 'I led the interaction design, creating high-fidelity prototypes in Protopie to test complex spatial gestures and fine-tuned all transition animations and micro-interactions.',
    outcome: 'The design system was adopted as the core OS layer for Lumina hardware panels, significantly reducing the learning curve for new homeowners and establishing a unified interaction model. Overall task completion time dropped dramatically across all studied demographic groups.',
    problemList: [
      'Interface fragmentation across multiple apps',
      'Control schemas based on function rather than spatial layout',
      'Steep learning curve for older demographics'
    ],
    solutionList: [
      'Modular widget system using strict baseline grid',
      'Spatial awareness approach (grouped by room)',
      'Ambient blurred backgrounds reflecting home state'
    ],
    contributionList: [
      'Led interaction design',
      'Created high-fidelity Protopie prototypes',
      'Designed complex spatial gestures',
      'Fine-tuned transition animations'
    ],
    outcomeList: [
      'Adopted as core OS layer for Lumina hardware',
      'Reduced task completion time by 60%',
      'Increased adoption rates among older users by 45%'
    ],
    keyLearning: 'Reduced task completion time by 60% and increased system adoption rates among older demographics by 45%.',
    technologies: ['Figma', 'Protopie', 'Design Systems'],
    imageUrl: 'https://picsum.photos/seed/design2/1200/800',
    year: '2024'
  },
  {
    id: 'ai-vision',
    title: 'AI Vision Engine',
    category: 'AI',
    client: 'Sentinel Tech',
    description: 'An AI-powered computer vision system capable of real-time object detection and contextual analysis within varied environments.',
    overview: 'An AI-powered computer vision system capable of real-time object detection and contextual analysis within varied environments.',
    challenge: 'Deploying robust computer vision models at the edge often results in high thermal output and significant battery drain. While initial lab tests showed high accuracy, field deployments struggled with battery life and suffered from false positives due to environmental factors like sun glare. Our task was to optimize a 50M parameter model to run on low-power IoT cameras at 30fps without compromising accuracy.',
    solution: 'By employing aggressive quantization and model pruning, we successfully reduced the memory footprint by 80%. We also built the monitoring interface using a highly optimized WebGL canvas layer to draw bounding boxes and confidence scores in real-time without blocking the main browser thread.',
    contribution: 'I engineered the computer vision model pipeline in Python, achieving a massive model size reduction via pruning methods, and developed the custom WebGL front-end integration for the monitoring dashboard.',
    outcome: 'The engine successfully processes video feeds at 36fps on standard IoT hardware, drawing less than 3 watts—a breakthrough for remote deployment in off-grid security scenarios.',
    problemList: [
      'High thermal output at the edge',
      'Significant battery drain',
      'False positives from environmental glare'
    ],
    solutionList: [
      'Aggressive quantization and model pruning',
      'WebGL canvas layer for monitoring',
      'Non-blocking bounding box rendering'
    ],
    contributionList: [
      'Optimized computer vision model pipeline',
      'Reduced memory footprint by 80%',
      'Developed WebGL front-end integration'
    ],
    outcomeList: [
      'Processes video feeds at 36fps on IoT hardware',
      'Draws less than 3 watts per device',
      'Deployed to remote off-grid locations'
    ],
    keyLearning: 'Aggressive quantization and pruning can dramatically expand the addressable physical environments for edge ML.',
    technologies: ['Python', 'TensorFlow', 'OpenCV', 'WebGL'],
    imageUrl: 'https://picsum.photos/seed/ai2/1200/800',
    year: '2026'
  }
];

const DEFAULT_POSTS: BlogPost[] = [
  {
    id: 'building-resilient-apps',
    title: 'Building Resilient Web Applications',
    category: 'Engineering',
    date: 'Oct 12, 2025',
    readTime: '5 min read',
    author: 'Meet Joshi',
    excerpt: 'An overview of the patterns and architectures required to build large scale, highly resilient single page applications using modern tooling.',
    content: '<p>The modern web is highly dynamic, but networks are inherently unstable. Building resilient applications requires shifting our mindset from "if the network fails" to "when the network fails."</p><h2>The Offline-First Paradigm</h2><p>In this article, we explore state management strategies, optimizing performance, and building robust data fetching pipelines that gracefully handle network instability.</p><blockquote>"Resilience is not a feature you add at the end of development; it is an architectural decision made on day one."</blockquote><h3>Optimistic UI Updates</h3><p>One of the most effective ways to make an application feel fast is to lie to the user—or rather, to be optimistic. When a user performs an action (like liking a post), update the UI immediately before the server responds.</p><pre><code>// Example of an optimistic update\nfunction optimisticUpdate(item) {\n  localCache.set(item.id, item);\n  api.sync(item).catch(() => localCache.rollback());\n}</code></pre><p>By combining optimistic updates with background synchronization, you create an illusion of zero-latency, even on a 3G connection.</p>',
    imageUrl: 'https://picsum.photos/seed/blog1/1200/800',
    galleryImages: ['https://picsum.photos/seed/detail1/800/600', 'https://picsum.photos/seed/detail2/800/600']
  },
  {
    id: 'design-systems-guide',
    title: 'The Evolution of Design Systems',
    category: 'Design',
    date: 'Nov 04, 2025',
    readTime: '4 min read',
    author: 'Meet Joshi',
    excerpt: 'Examining how modern design systems are moving beyond static component libraries to dynamic, token-driven architectures that scale across platforms.',
    content: '<p>Examining how modern design systems are moving beyond static component libraries to dynamic, token-driven architectures that scale across platforms.</p><h2>Beyond UI Components</h2><p>Tokens allow us to separate the definition of a brand from its implementation, giving teams the flexibility to iterate on visual styles without refactoring thousands of lines of UI markup.</p><ul><li><strong>Semantic Tokens:</strong> Names that describe purpose (e.g., <code>color-background-danger</code>).</li><li><strong>Primitive Tokens:</strong> Absolute values (e.g., <code>color-red-500</code>).</li></ul><p>When engineering teams align on semantic tokens, creating a dark mode goes from being a multi-month refactoring project to a simple theme swap at runtime.</p>',
    imageUrl: 'https://picsum.photos/seed/blog2/1200/800',
    galleryImages: ['https://picsum.photos/seed/detail3/800/600', 'https://picsum.photos/seed/detail4/800/600']
  }
];

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
        if (items.length === 0) {
           obs.next(DEFAULT_PROJECTS);
        } else {
           obs.next(items);
        }
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
          const defaultProj = DEFAULT_PROJECTS.find(p => p.id === slug);
          obs.next(defaultProj || undefined);
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
        if (items.length === 0) {
          obs.next(DEFAULT_POSTS);
        } else {
          obs.next(items);
        }
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
          const defaultPost = DEFAULT_POSTS.find(p => p.id === slug);
          obs.next(defaultPost || undefined);
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
