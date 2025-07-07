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
import { CourseApiService } from "../../services/course-api.service";
import { Course } from "../../models/course.model";
import { Observable, combineLatest, map, startWith } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { MatriculaApiService } from "../../services/matricula-api.service";

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
  filteredCourses$: Observable<Course[]>;
  enrolledIds: Set<string> = new Set();

  searchControl = new FormControl("");
  categoryControl = new FormControl("");
  levelControl = new FormControl("");

  public userId: string | null = null;
  public userName: string | null = null;
  public isLoggedIn: boolean = false;

  constructor(
    private courseApi: CourseApiService,
    private snackBar: MatSnackBar,
    private router: Router,
    public authService: AuthService,
    private matriculaApi: MatriculaApiService
  ) {
    this.courses$ = this.courseApi.getAll();
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
    const user = this.authService.getCurrentUser();
    this.userId = user?.id ?? null;
    this.userName = user?.name ?? null;
    this.isLoggedIn = !!user;
    if (this.isLoggedIn) {
      this.matriculaApi.getMisCursos().subscribe((misCursos) => {
        this.enrolledIds = new Set(misCursos.map((c) => c.id));
      });
    }
  }

  ngOnInit(): void {}

  enroll(course: Course) {
    if (!this.isLoggedIn || !this.userId) return;
    this.matriculaApi.enrollToCourse(course.id).subscribe({
      next: () => {
        course.isEnrolled = true;
        this.enrolledIds.add(course.id);
        if (course.cupo > 0) {
          course.cupo = course.cupo - 1;
        }
        this.snackBar.open("¡Te has matriculado en el curso!", "Cerrar", {
          duration: 2000,
        });
      },
      error: (err) => {
        let msg = 'No se pudo matricular';
        if (err?.error?.error) {
          msg = err.error.error;
        }
        this.snackBar.open(msg, "Cerrar", {
          duration: 3000,
        });
      },
    });
  }

  trackByCourseId(index: number, course: Course): string {
    return course.id;
  }
}
