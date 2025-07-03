import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { CourseService } from "../../services/course.service";

@Component({
  selector: "app-create-course",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: "./create-course.component.html",
  styleUrl: "./create-course.component.css",
})
export class CreateCourseComponent {
  courseForm: FormGroup;
  isCreating = false;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.courseForm = this.fb.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      category: ["", Validators.required],
      level: ["", Validators.required],
      duration: ["", Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [
        "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1",
        Validators.required,
      ],
    });
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      this.isCreating = true;

      this.courseService.createCourse(this.courseForm.value).subscribe({
        next: (course) => {
          this.isCreating = false;
          this.snackBar.open("¡Curso creado exitosamente!", "Cerrar", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.router.navigate(["/my-created-courses"]);
        },
        error: () => {
          this.isCreating = false;
          this.snackBar.open(
            "Error al crear el curso. Intenta de nuevo.",
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

  resetForm(): void {
    this.courseForm.reset();
    this.courseForm.patchValue({
      price: 0,
      imageUrl:
        "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1",
    });
  }
}
