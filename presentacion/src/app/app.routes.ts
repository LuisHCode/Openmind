import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'my-courses',
        loadComponent: () => import('./components/my-courses/my-courses.component').then(m => m.MyCoursesComponent)
      },
      {
        path: 'create-course',
        loadComponent: () => import('./components/create-course/create-course.component').then(m => m.CreateCourseComponent)
      },
      {
        path: 'my-created-courses',
        loadComponent: () => import('./components/my-created-courses/my-created-courses.component').then(m => m.MyCreatedCoursesComponent)
      },
      {
        path: 'course-details/:id',
        loadComponent: () => import('./components/course-details/course-details.component').then(m => m.CourseDetailsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];