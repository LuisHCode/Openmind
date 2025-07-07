import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatChipsModule } from "@angular/material/chips";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { CourseService } from "../../services/course.service";
import { Course, CourseStats } from "../../models/course.model";
import { Observable, combineLatest, map, startWith } from "rxjs";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent implements OnInit {
  courses$: Observable<Course[]>;
  stats$: Observable<CourseStats>;
  filteredCourses$: Observable<Course[]>;

  searchControl = new FormControl("");
  categoryControl = new FormControl("");
  levelControl = new FormControl("");

  isEnrolling = false;
  enrollingCourseId: string | null = null;

  constructor(
    private courseService: CourseService,
    private snackBar: MatSnackBar,
    private router: Router,
    public authService: AuthService
  ) {
    this.courses$ = this.courseService.getAllCourses();
    this.stats$ = this.courseService.getStats();

    // Filtrar cursos basado en controles de búsqueda
    this.filteredCourses$ = combineLatest([
      this.courses$,
      this.searchControl.valueChanges.pipe(startWith("")),
      this.categoryControl.valueChanges.pipe(startWith("")),
      this.levelControl.valueChanges.pipe(startWith("")),
    ]).pipe(
      map(([courses, search, category, level]) => {
        return courses.filter((course) => {
          const matchesSearch =
            !search ||
            course.title.toLowerCase().includes(search.toLowerCase()) ||
            course.instructor.toLowerCase().includes(search.toLowerCase()) ||
            course.category.toLowerCase().includes(search.toLowerCase());

          const matchesCategory = !category || course.category === category;
          const matchesLevel = !level || course.level === level;

          return matchesSearch && matchesCategory && matchesLevel;
        });
      })
    );
  }

  ngOnInit(): void {}

  trackByCourseId(index: number, course: Course): string {
    return course.id;
  }

  enrollInCourse(courseId: string): void {
    if (this.courseService.isEnrolledInCourse(courseId)) {
      return; // Ya está matriculado
    }

    this.isEnrolling = true;
    this.enrollingCourseId = courseId;

    this.courseService.enrollInCourse(courseId).subscribe({
      next: (success) => {
        this.isEnrolling = false;
        this.enrollingCourseId = null;
        if (success) {
          this.snackBar.open("¡Te has matriculado exitosamente!", "Cerrar", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });

          // Refrescar los datos para mostrar el estado actualizado
          this.courses$ = this.courseService.getAllCourses();
          this.stats$ = this.courseService.getStats();
        }
      },
      error: () => {
        this.isEnrolling = false;
        this.enrollingCourseId = null;
        this.snackBar.open(
          "Error al matricularse. Intenta de nuevo.",
          "Cerrar",
          {
            duration: 3000,
            panelClass: ["error-snackbar"],
          }
        );
      },
    });
  }
}
