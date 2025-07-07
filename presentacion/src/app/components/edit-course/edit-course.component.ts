import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { CourseApiService } from "../../services/course-api.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-edit-course",
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
  templateUrl: "./edit-course.component.html",
  styleUrl: "./edit-course.component.css",
})
export class EditCourseComponent implements OnInit {
  courseForm: FormGroup;
  isUpdating = false;
  courseId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private courseApi: CourseApiService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.courseForm = this.fb.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      category: ["", Validators.required],
      level: ["", Validators.required],
      duration: ["", Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ["", Validators.required],
      cupo: [0, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get("id");
    if (this.courseId) {
      this.courseApi.getAll().subscribe(courses => {
        const course = courses.find(c => c.id === this.courseId);
        if (course) {
          this.courseForm.patchValue({
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            duration: course.duration.replace(' Semanas', ''),
            price: course.price,
            imageUrl: course.imageUrl || ""
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.courseForm.valid && this.courseId) {
      this.isUpdating = true;
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.snackBar.open("Debes iniciar sesión para editar un curso", "Cerrar", { duration: 3000 });
        this.isUpdating = false;
        return;
      }
      const form = this.courseForm.value;
      const body = {
        titulo: form.title,
        descripcion: form.description,
        categoria: form.category,
        nivel: form.level,
        semanas_duracion: parseInt(form.duration, 10) || 8,
        precio: form.price,
        imagen_url: form.imageUrl,
        creador_id: user.id,
        fecha_inicio: new Date().toISOString().slice(0, 10),
        cupo: 30
      };
      this.courseApi.update(this.courseId, body).subscribe({
        next: () => {
          this.isUpdating = false;
          this.snackBar.open("¡Curso actualizado exitosamente!", "Cerrar", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.router.navigate(["/my-created-courses"]);
        },
        error: () => {
          this.isUpdating = false;
          this.snackBar.open(
            "Error al actualizar el curso. Intenta de nuevo.",
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
      imageUrl: "",
    });
  }
}
