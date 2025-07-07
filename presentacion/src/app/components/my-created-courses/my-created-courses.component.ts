import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatMenuModule } from "@angular/material/menu";
import { CourseApiService } from "../../services/course-api.service";
import { AuthService } from "../../services/auth.service";
import { Course } from "../../models/course.model";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-my-created-courses",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    RouterModule,
  ],
  templateUrl: "./my-created-courses.component.html",
  styleUrl: "my-created-courses.component.css",
})
export class MyCreatedCoursesComponent implements OnInit {
  createdCourses$: Observable<Course[]>;

  constructor(
    private courseApi: CourseApiService,
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.getCurrentUser();
    this.createdCourses$ = this.courseApi.getAll().pipe(
      map((courses) => (user ? courses.filter((c) => c.creador_id === user.id) : []))
    );
  }

  ngOnInit(): void {}

  trackByCourseId(index: number, course: Course): string {
    return course.id;
  }

  viewCourseDetails(courseId: string): void {
    this.router.navigate(["/course-details", courseId]);
  }

  editCourse(courseId: string): void {
    this.router.navigate(["/edit-course", courseId]);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  }

  deleteCourse(courseId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.')) {
      this.courseApi.delete(courseId).subscribe({
        next: () => {
          this.createdCourses$ = this.courseApi.getAll().pipe(
            map((courses) => {
              const user = this.authService.getCurrentUser();
              return user ? courses.filter((c) => c.creador_id === user.id) : [];
            })
          );
        },
        error: () => {
          alert('Error al eliminar el curso.');
        }
      });
    }
  }
}
