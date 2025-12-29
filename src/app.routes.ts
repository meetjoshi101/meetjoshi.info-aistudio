import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { ProjectsComponent } from './pages/projects.component';
import { ProjectDetailsComponent } from './pages/project-details.component';
import { BlogComponent } from './pages/blog.component';
import { BlogDetailsComponent } from './pages/blog-details.component';
import { AboutComponent } from './pages/about.component';
import { ContactComponent } from './pages/contact.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/:id', component: ProjectDetailsComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'blog/:id', component: BlogDetailsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }
];