import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatChipsModule } from "@angular/material/chips";
import { CourseService } from "../../services/course.service";
import { Course } from "../../models/course.model";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

interface CourseWithProgress extends Course {
  progress: number;
}

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
  ],
  templateUrl: "./my-course.component.html",
  styleUrl: "./my-course.component.css",
})
export class MyCoursesComponent implements OnInit {
  enrolledCourses$: Observable<CourseWithProgress[]>;

  constructor(private courseService: CourseService) {
    this.enrolledCourses$ = this.courseService.getEnrolledCourses().pipe(
      map((courses) =>
        courses.map((course) => ({
          ...course,
          progress: Math.floor(Math.random() * 100),
        }))
      )
    );
  }

  ngOnInit(): void {}

  trackByCourseId(index: number, course: CourseWithProgress): string {
    return course.id;
  }
}
