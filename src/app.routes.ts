import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { ProjectsComponent } from './pages/projects.component';
import { ProjectDetailsComponent } from './pages/project-details.component';
import { BlogComponent } from './pages/blog.component';
import { BlogDetailsComponent } from './pages/blog-details.component';
import { AboutComponent } from './pages/about.component';
import { ContactComponent } from './pages/contact.component';

import { LoginComponent } from './pages/login.component';
import { AdminGuard } from './services/admin.guard';
import { AdminLayoutComponent } from './pages/admin/layout.component';
import { AdminProjectsComponent } from './pages/admin/admin-projects.component';
import { AdminInquiriesComponent } from './pages/admin/admin-inquiries.component';
import { AdminBlogComponent } from './pages/admin/admin-blog.component';
import { AdminContentComponent } from './pages/admin/admin-content.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/:id', component: ProjectDetailsComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'blog/:id', component: BlogDetailsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminLayoutComponent, 
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'projects', pathMatch: 'full' },
      { path: 'projects', component: AdminProjectsComponent },
      { path: 'blog', component: AdminBlogComponent },
      { path: 'inquiries', component: AdminInquiriesComponent },
      { path: 'content', component: AdminContentComponent }
    ]
  },
  
  { path: '**', redirectTo: '' }
];