import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { ProjectsComponent } from './pages/projects.component';
import { ProjectDetailsComponent } from './pages/project-details.component';
import { BlogComponent } from './pages/blog.component';
import { BlogDetailsComponent } from './pages/blog-details.component';
import { AboutComponent } from './pages/about.component';
import { ContactComponent } from './pages/contact.component';
import { LoginComponent } from './pages/admin/login.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout.component';
import { DashboardComponent } from './pages/admin/dashboard.component';
import { ProjectsListComponent } from './pages/admin/projects-list.component';
import { ProjectFormComponent } from './pages/admin/project-form.component';
import { BlogListComponent } from './pages/admin/blog-list.component';
import { BlogFormComponent } from './pages/admin/blog-form.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/:id', component: ProjectDetailsComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'blog/:id', component: BlogDetailsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },

  // Admin routes
  { path: 'admin/login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'projects', component: ProjectsListComponent },
      { path: 'projects/new', component: ProjectFormComponent },
      { path: 'projects/edit/:id', component: ProjectFormComponent },
      { path: 'blog', component: BlogListComponent },
      { path: 'blog/new', component: BlogFormComponent },
      { path: 'blog/edit/:id', component: BlogFormComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];