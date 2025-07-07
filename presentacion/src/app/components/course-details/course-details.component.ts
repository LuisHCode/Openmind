import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatChipsModule } from "@angular/material/chips";
import { MatMenuModule } from "@angular/material/menu";
import { CourseService } from "../../services/course.service";
import { Course, User } from "../../models/course.model";
import { Observable, switchMap } from "rxjs";
import { MatriculaApiService } from '../../services/matricula-api.service';
import { PrintService } from '../../services/print-service';

@Component({
  selector: "app-course-details",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatMenuModule,
  ],
  templateUrl: "./course-details.component.html",
  styleUrl: "./course-details.component.css",
})
export class CourseDetailsComponent implements OnInit {
  course$: Observable<Course | undefined>;
  students$: Observable<User[]>;
  displayedColumns: string[] = [
    "avatar",
    "name",
    "enrolledAt",
    "actions",
  ];
  creadorNombre: string = '';
  estudiantesCount: number = 0;
  ingresosTotales: number = 0;
  matriculadosCount: number = 0;
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private matriculaApi: MatriculaApiService,
    private printService: PrintService
  ) {
    this.course$ = this.route.params.pipe(
      switchMap((params) => this.courseService.getCourseById(params["id"]))
    );

    this.students$ = this.route.params.pipe(
      switchMap((params) => this.courseService.getCourseStudents(params["id"]))
    );

    this.course$.subscribe(course => {
      if (course) {
        this.creadorNombre = course.instructor;
      }
    });
    this.students$.subscribe(students => {
      this.estudiantesCount = students.length;
      this.matriculadosCount = students.length;
      this.course$.subscribe(course => {
        if (course) {
          this.ingresosTotales = course.price * students.length;
        }
      });
    });
  }

  ngOnInit(): void {}

  goBack(): void {
    this.router.navigate(["/my-created-courses"]);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  }

  getRandomProgress(): number {
    return Math.floor(Math.random() * 100);
  }

  suspenderEstudiante(student: User, courseId: string) {
    this.matriculaApi
      .desmatricularse(student.id, courseId)
      .subscribe({
        next: () => {
          this.students$ = this.route.params.pipe(
            switchMap((params) => this.courseService.getCourseStudents(params["id"]))
          );
        },
        error: (err: any) => {
          alert('Error al suspender estudiante');
        },
      });
  }

  exportarListaEstudiantes(course: Course, students: User[]) {
    this.printService.print(
      ['Nombre', 'Email', 'Fecha de matrícula'],
      students.map(e => [e.name, e.email, e.enrolledAt ? this.formatDate(e.enrolledAt) : '']),
      `Matrícula Curso: ${course.title}`,
      true
    );
  }
}
