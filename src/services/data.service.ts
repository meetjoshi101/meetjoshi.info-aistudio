import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, map, switchMap, forkJoin, throwError } from 'rxjs';

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
  content?: string; 
}

export interface BlogPost {
  id: string; 
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  category: string;
  readTime: string;
  imageUrl: string;
  author?: string;
  galleryImages?: string[];
}

const HASHNODE_API = 'https://gql.hashnode.com';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  
  // Config Signals
  hashnodeHost = signal('meetjoshi.hashnode.dev');
  hashnodeApiKey = signal('d1a0ef5b-058d-4668-8c21-253592d269cd');
  hashnodeSeriesSlug = signal('project'); // Default series slug

  // Signals to track source
  dataSource = signal<'Hashnode API' | 'Local Backup'>('Local Backup');
  projectsSource = signal<string>('Local Backup');

  updateConfig(host: string, key: string, seriesSlug: string = 'project') {
    this.hashnodeHost.set(host);
    this.hashnodeApiKey.set(key);
    this.hashnodeSeriesSlug.set(seriesSlug);
  }

  // --- Mock Data (Fallback) ---
  private projects: Project[] = [
      {
        id: 'nexus-ecommerce',
        title: 'Nexus E-Commerce',
        client: 'Nexus Retail Group',
        year: '2023',
        description: 'A full-scale e-commerce platform featuring real-time inventory management, AI-driven product recommendations, and a seamless checkout experience.',
        category: 'Web',
        technologies: ['Angular', 'Node.js', 'Stripe', 'Tailwind'],
        imageUrl: 'https://picsum.photos/id/201/800/600',
        challenge: 'Nexus needed to migrate from a legacy monolithic system to a microservices architecture without disrupting their 50k daily active users. The main pain points were slow page loads (3s+) and a rigid CMS that made marketing campaigns difficult to launch.',
        solution: 'We architected a headless solution using Angular for the storefront and Node.js for the backend services. We implemented a redis caching layer to handle high-traffic product queries and integrated a builder.io CMS for marketing flexibility.',
        outcome: 'Page load times dropped to 0.8s, conversion rates increased by 15% in the first quarter, and the marketing team can now launch campaigns in minutes rather than days.'
      },
      {
        id: 'fittrack-pro',
        title: 'FitTrack Pro',
        client: 'HealthCorp Inc.',
        year: '2023',
        description: 'Mobile application for tracking fitness goals, visualizing workout progress, and connecting with personal trainers.',
        category: 'Mobile',
        technologies: ['Flutter', 'Firebase', 'Dart'],
        imageUrl: 'https://picsum.photos/id/73/800/600',
        challenge: 'Users were abandoning existing fitness apps due to complex data entry and lack of visual progress indicators. The client wanted a "zero-friction" logging experience.',
        solution: 'We utilized Flutter to create a buttery-smooth cross-platform experience. We implemented custom gesture controls for logging sets and reps, and used D3.js (via WebView) for complex but intuitive progress charts.',
        outcome: 'The app achieved a 4.8-star rating on the App Store and was featured in "Apps We Love". User retention at day-30 is 40% higher than the industry average.'
      },
      {
        id: 'golden-hour',
        title: 'Golden Hour Branding',
        client: 'Golden Hour Luxury',
        year: '2022',
        description: 'Complete brand identity design including logo, typography, and marketing assets for a luxury lifestyle brand.',
        category: 'Design',
        technologies: ['Figma', 'Illustrator', 'Motion'],
        imageUrl: 'https://picsum.photos/id/250/800/600',
        challenge: 'A new luxury lifestyle brand needed an identity that felt timeless yet modern, avoiding the clichéd minimalist aesthetic of competitors.',
        solution: 'We developed a visual language based on the warmth of the "golden hour" sun. This involved a custom serif typeface, a warm, earthy color palette, and a photography direction that emphasized natural light and texture.',
        outcome: 'The brand launch was a massive success, with the visual identity being cited by Vogue as "refreshingly warm and inviting".'
      },
      {
        id: 'vision-ai',
        title: 'Vision AI Dashboard',
        client: 'SafeCity Tech',
        year: '2022',
        description: 'Analytics dashboard leveraging computer vision to analyze retail foot traffic and customer sentiment in real-time.',
        category: 'AI',
        technologies: ['Python', 'TensorFlow', 'Angular', 'D3.js'],
        imageUrl: 'https://picsum.photos/id/870/800/600',
        challenge: 'Retailers have cameras but no data. They needed a way to visualize terabytes of video data in real-time to understand customer behavior.',
        solution: 'We built a high-performance Angular dashboard that consumes WebSocket streams from the Python/TensorFlow backend. We used WebGL for rendering heatmaps of foot traffic over store layouts.',
        outcome: 'Pilot stores saw a 10% increase in sales by optimizing product placement based on the heatmaps generated by our dashboard.'
      },
      {
        id: 'ecohome-hub',
        title: 'EcoHome Smart Hub',
        client: 'GreenLiving',
        year: '2021',
        description: 'IoT interface for managing smart home devices with energy optimization algorithms.',
        category: 'Web',
        technologies: ['React', 'GraphQL', 'AWS IoT'],
        imageUrl: 'https://picsum.photos/id/338/800/600',
        challenge: 'Connecting devices from different manufacturers (Zigbee, Z-Wave, WiFi) into a single, cohesive interface that non-tech-savvy users could understand.',
        solution: 'We created a unified GraphQL API to abstract the device differences. The UI focused on "Scenes" rather than devices, allowing users to control their home based on context (e.g., "Movie Night", "Away").',
        outcome: 'Reduced customer support calls by 60% due to the intuitive interface design.'
      },
      {
        id: 'fintech-vault',
        title: 'FinTech Vault',
        client: 'SecureBank',
        year: '2021',
        description: 'Secure banking application with biometric authentication and blockchain-based transaction verification.',
        category: 'Mobile',
        technologies: ['Swift', 'Kotlin', 'Blockchain'],
        imageUrl: 'https://picsum.photos/id/449/800/600',
        challenge: 'Building a banking app that felt as secure as a vault but as easy to use as a social media app.',
        solution: 'We implemented a hybrid security model using on-device biometrics and server-side behavioral analysis. The UI used subtle animations to confirm security actions, giving users peace of mind.',
        outcome: 'Acquired 100k users in the first 6 months with zero security breaches reported.'
      }
    ];

  private fallbackBlogPosts: BlogPost[] = [
      {
        id: 'the-future-of-angular',
        title: 'The Future of Angular: What v18+ Brings',
        excerpt: 'Exploring the new zoneless change detection, signal-based inputs, and how they revolutionize performance.',
        content: `<p>Angular has long been criticized for its reliance on Zone.js, a library that monkey-patches browser APIs to trigger change detection. While effective, it added overhead and made debugging stack traces a nightmare.</p><p>With the introduction of Signals and Zoneless change detection, Angular is entering a new era of performance. Signals provide a reactive primitive that allows the framework to know exactly <em>what</em> changed and <em>where</em>, rather than checking the entire component tree.</p><h3>Why Signals Matter</h3><p>Signals are not just a state management tool; they are the backbone of a fine-grained reactivity system. By adopting signals, we can drop Zone.js entirely, reducing bundle size and improving runtime performance significantly.</p>`,
        date: 'Oct 12, 2023',
        category: 'Development',
        readTime: '5 min read',
        imageUrl: 'https://picsum.photos/id/1/800/400',
        author: 'Meet Joshi',
        galleryImages: ['https://picsum.photos/id/4/800/600', 'https://picsum.photos/id/60/800/600']
      },
      {
        id: 'mastering-md3',
        title: 'Mastering Material Design 3',
        excerpt: 'A deep dive into the tonal palettes, dynamic color systems, and elevation guides of MD3.',
        content: `<p>Material Design 3 (or Material You) is Google's most expressive design system to date. It moves away from the rigid, shadow-heavy interfaces of MD2 towards a more organic, colorful, and flat aesthetic.</p><p>One of the key features is the dynamic color system, which extracts a color scheme from the user's wallpaper. This creates a deeply personal connection between the user and the app.</p><h3>Elevation & Layout</h3><p>MD3 replaces shadows with surface tonal variations to indicate elevation. This "surface-tint" approach is much subtler and works better in both light and dark modes.</p>`,
        date: 'Sep 28, 2023',
        category: 'Design',
        readTime: '7 min read',
        imageUrl: 'https://picsum.photos/id/106/800/400',
        author: 'Meet Joshi',
        galleryImages: ['https://picsum.photos/id/104/800/600', 'https://picsum.photos/id/152/800/600']
      }
    ];

  // --- Project Methods (Dynamic) ---
  
  getProjects(): Observable<Project[]> {
    const seriesSlug = this.hashnodeSeriesSlug();
    const host = this.hashnodeHost();
    
    // Updated Query: Tries to fetch specifically from Series first, also gets general posts for fallback
    const query = `
      query GetProjects($host: String!, $seriesSlug: String!) {
        publication(host: $host) {
          series(slug: $seriesSlug) {
            posts(first: 20) {
              edges {
                node {
                  slug
                  title
                  brief
                  coverImage {
                    url
                  }
                  tags {
                    name
                  }
                  publishedAt
                }
              }
            }
          }
          posts(first: 20) {
            edges {
              node {
                slug
                title
                brief
                coverImage {
                  url
                }
                tags {
                  name
                }
                publishedAt
              }
            }
          }
        }
      }
    `;

    return this.http.post<any>(HASHNODE_API, { 
      query, 
      variables: { host, seriesSlug } 
    }).pipe(
      map(response => {
        const pub = response?.data?.publication;
        
        let edges = pub?.series?.posts?.edges;
        let sourceMode = 'Series';

        // If series is empty, try the generic posts list filtered by tag
        if (!edges || edges.length === 0) {
           const allPosts = pub?.posts?.edges;
           if (allPosts) {
             edges = allPosts.filter((e: any) => 
               e.node.tags?.some((t: any) => t.name.toLowerCase() === 'project')
             );
             sourceMode = 'Tag (#project)';
           }
        }

        if (!edges || edges.length === 0) {
           console.warn(`Hashnode fetched but no projects found (checked Series '${seriesSlug}' and Tag '#project'). Using fallback.`);
           this.projectsSource.set('Local Backup');
           return this.projects;
        }

        this.projectsSource.set(`Hashnode (${sourceMode})`);
        
        return edges.map((edge: any) => {
           const node = edge.node;
           const tags = node.tags?.map((t: any) => t.name) || [];
           // Remove 'project' tag from display tags
           const displayTags = tags.filter((t: string) => t.toLowerCase() !== 'project');
           
           return {
             id: node.slug,
             title: node.title,
             description: node.brief,
             imageUrl: node.coverImage?.url || 'https://picsum.photos/800/600',
             technologies: displayTags,
             category: displayTags[0] || 'Web', // Default to first non-project tag
             client: 'Personal / Hashnode',
             year: new Date(node.publishedAt).getFullYear().toString()
           };
        });
      }),
      catchError(err => {
        console.error('Projects API Error', err);
        this.projectsSource.set('Local Backup');
        return of(this.projects);
      })
    );
  }

  getProjectBySlug(slug: string): Observable<Project | undefined> {
    const fallback = this.projects.find(p => p.id === slug);
    if (fallback) return of(fallback);

     const query = `
      query Post($slug: String!) {
        publication(host: "${this.hashnodeHost()}") {
          post(slug: $slug) {
            title
            content {
              html
            }
            coverImage {
              url
            }
            tags {
              name
            }
            brief
            publishedAt
          }
        }
      }
    `;

    return this.http.post<any>(HASHNODE_API, { query, variables: { slug } }).pipe(
       map(response => {
         const post = response?.data?.publication?.post;
         if (!post) return undefined;
         
         const tags = post.tags?.map((t: any) => t.name) || [];
         const displayTags = tags.filter((t: string) => t.toLowerCase() !== 'project');

         return {
           id: slug,
           title: post.title,
           description: post.brief,
           content: post.content.html, 
           imageUrl: post.coverImage?.url || 'https://picsum.photos/800/600',
           technologies: displayTags,
           category: displayTags[0] || 'Web',
           client: 'View on Hashnode',
           year: new Date(post.publishedAt).getFullYear().toString()
         } as Project;
       }),
       catchError(err => {
         console.error(err);
         return of(undefined);
       })
    );
  }


  // --- Blog Methods (Hashnode Integration) ---

  getBlogPosts(): Observable<BlogPost[]> {
    const query = `
      query Publication {
        publication(host: "${this.hashnodeHost()}") {
          id
          title
          posts(first: 10) {
            edges {
              node {
                slug
                title
                brief
                coverImage {
                  url
                }
                publishedAt
                readTimeInMinutes
                tags {
                  name
                }
              }
            }
          }
        }
      }
    `;

    return this.http.post<any>(HASHNODE_API, { query }).pipe(
      map(response => {
        const edges = response?.data?.publication?.posts?.edges;
        if (!edges || edges.length === 0) {
           this.dataSource.set('Local Backup');
           return this.fallbackBlogPosts;
        }

        this.dataSource.set('Hashnode API');
        
        return edges.map((edge: any) => ({
          id: edge.node.slug,
          title: edge.node.title,
          excerpt: edge.node.brief,
          content: '',
          date: new Date(edge.node.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          category: edge.node.tags?.[0]?.name || 'Tech',
          readTime: `${edge.node.readTimeInMinutes} min read`,
          imageUrl: edge.node.coverImage?.url || 'https://picsum.photos/800/400',
          author: 'Meet Joshi'
        }));
      }),
      catchError(error => {
        console.error('Error fetching from Hashnode (HTTP):', error);
        this.dataSource.set('Local Backup');
        return of(this.fallbackBlogPosts);
      })
    );
  }

  getBlogPostBySlug(slug: string): Observable<BlogPost | undefined> {
    const fallback = this.fallbackBlogPosts.find(p => p.id === slug);
    if (fallback) return of(fallback);

    const query = `
      query Post($slug: String!) {
        publication(host: "${this.hashnodeHost()}") {
          post(slug: $slug) {
            title
            content {
              html
            }
            coverImage {
              url
            }
            publishedAt
            readTimeInMinutes
            tags {
              name
            }
          }
        }
      }
    `;

    return this.http.post<any>(HASHNODE_API, { query, variables: { slug } }).pipe(
      map(response => {
        const post = response?.data?.publication?.post;
        if (!post) {
           return undefined;
        }

        return {
          id: slug,
          title: post.title,
          excerpt: '',
          content: post.content.html,
          date: new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          category: post.tags?.[0]?.name || 'Writing',
          readTime: `${post.readTimeInMinutes} min read`,
          imageUrl: post.coverImage?.url || 'https://picsum.photos/800/600',
          author: 'Meet Joshi',
          galleryImages: [] 
        } as BlogPost;
      }),
      catchError(error => {
        console.error('Error fetching post detail:', error);
        return of(undefined);
      })
    );
  }

  // --- Admin / Sync Method ---
  syncLocalPostsToHashnode(): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': this.hashnodeApiKey() });
    const idQuery = `query { publication(host: "${this.hashnodeHost()}") { id } }`;
    
    return this.http.post<any>(HASHNODE_API, { query: idQuery }, { headers }).pipe(
      switchMap(res => {
        const pubId = res.data?.publication?.id;
        if (!pubId) throw new Error(`Publication ID not found for host ${this.hashnodeHost()}. Check Hostname.`);
        
        const mutations = this.fallbackBlogPosts.map(post => {
          const mutation = `
            mutation PublishPost($input: PublishPostInput!) {
              publishPost(input: $input) {
                post { slug url }
              }
            }
          `;
          return this.http.post<any>(HASHNODE_API, {
            query: mutation,
            variables: {
              input: {
                title: post.title,
                slug: post.id,
                subtitle: post.excerpt,
                publicationId: pubId,
                contentMarkdown: post.content, 
                coverImageOptions: { coverImageURL: post.imageUrl }
              }
            }
          }, { headers }).pipe(
            map(res => {
              if (res.errors) return { success: false, title: post.title, error: res.errors[0].message };
              return { success: true, title: post.title, data: res.data };
            }),
            catchError(err => of({ success: false, title: post.title, error: err.message }))
          );
        });
        return forkJoin(mutations);
      }),
      catchError(err => {
        return throwError(() => new Error(err.message || 'Sync failed at publication step'));
      })
    );
  }

  // --- Admin / Sync Projects Method ---
  syncLocalProjectsToHashnode(): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': this.hashnodeApiKey() });
    const seriesSlug = this.hashnodeSeriesSlug();
    
    // Query to get both Publication ID and the specific Series ID
    const contextQuery = `
      query GetContext { 
        publication(host: "${this.hashnodeHost()}") { 
          id 
          series(slug: "${seriesSlug}") {
            id
          }
        } 
      }
    `;
    
    return this.http.post<any>(HASHNODE_API, { query: contextQuery }, { headers }).pipe(
      switchMap(res => {
        const pub = res.data?.publication;
        if (!pub?.id) throw new Error(`Publication ID not found for host ${this.hashnodeHost()}. Check Hostname.`);
        
        const pubId = pub.id;
        const seriesId = pub.series?.id;

        if (!seriesId) console.warn(`Series with slug '${seriesSlug}' not found. Projects will be published without a series.`);
        
        const mutations = this.projects.map(project => {
          const markdownContent = `
## The Challenge
${project.challenge || project.description}

## The Solution
${project.solution || 'Detailed technical breakdown...'}

## The Outcome
${project.outcome || 'Project results...'}

---
**Client:** ${project.client || 'Personal'}
**Year:** ${project.year}
**Tech Stack:** ${project.technologies.join(', ')}
          `;

          const mutation = `
            mutation PublishPost($input: PublishPostInput!) {
              publishPost(input: $input) {
                post { slug url }
              }
            }
          `;
          
          // Construct Input variables
          const input: any = {
            title: project.title,
            slug: project.id,
            subtitle: project.description,
            publicationId: pubId,
            contentMarkdown: markdownContent, 
            coverImageOptions: { coverImageURL: project.imageUrl },
            // Auto-tag with 'project' so it appears in the filter
            tags: [ { name: 'project', slug: 'project' } ]
          };

          // Append seriesId if found
          if (seriesId) {
            input.seriesId = seriesId;
          }

          return this.http.post<any>(HASHNODE_API, {
            query: mutation,
            variables: { input }
          }, { headers }).pipe(
            map(res => {
              if (res.errors) return { success: false, title: project.title, error: res.errors[0].message };
              return { success: true, title: project.title, data: res.data };
            }),
            catchError(err => of({ success: false, title: project.title, error: err.message }))
          );
        });
        return forkJoin(mutations);
      }),
      catchError(err => {
        return throwError(() => new Error(err.message || 'Sync failed at publication step'));
      })
    );
  }
}
