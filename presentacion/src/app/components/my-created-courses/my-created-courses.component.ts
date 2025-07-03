import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatMenuModule } from "@angular/material/menu";
import { CourseService } from "../../services/course.service";
import { Course } from "../../models/course.model";
import { Observable } from "rxjs";

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
  ],
  templateUrl: "./my-created-courses.component.html",
  styleUrl: "my-created-courses.component.css",
})
export class MyCreatedCoursesComponent implements OnInit {
  createdCourses$: Observable<Course[]>;

  constructor(private courseService: CourseService, private router: Router) {
    this.createdCourses$ = this.courseService.getCreatedCourses();
  }

  ngOnInit(): void {}

  trackByCourseId(index: number, course: Course): string {
    return course.id;
  }

  viewCourseDetails(courseId: string): void {
    this.router.navigate(["/course-details", courseId]);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  }
}
