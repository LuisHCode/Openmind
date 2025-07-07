import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatChipsModule } from "@angular/material/chips";
import { RouterModule } from "@angular/router";
import { MatriculaApiService } from "../../services/matricula-api.service";
import { AuthService } from "../../services/auth.service";
import { Observable } from "rxjs";
import { Course } from "../../models/course.model";

@Component({
  selector: "app-my-courses",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    RouterModule,
  ],
  templateUrl: "./my-course.component.html",
  styleUrl: "./my-course.component.css",
})
export class MyCoursesComponent implements OnInit {
  enrolledCourses$!: Observable<(Course & { idMatricula: string, fechaMatricula: string })[]>;

  constructor(private matriculaApi: MatriculaApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadCursos();
  }

  loadCursos() {
    this.enrolledCourses$ = this.matriculaApi.getMisCursos();
  }

  desmatricularse(course: Course & { idMatricula: string, fechaMatricula: string }) {
    const user = this.auth.getCurrentUser();
    if (!user) {
      alert('Usuario no autenticado');
      return;
    }
    this.matriculaApi.desmatricularse(user.id, course.id).subscribe({
      next: () => this.loadCursos(),
      error: () => alert('No se pudo desmatricular')
    });
  }

  trackByCourseId(index: number, course: Course & { idMatricula: string, fechaMatricula: string }): string {
    return course.id;
  }
}
