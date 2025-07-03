import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, Router } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatBadgeModule } from "@angular/material/badge";
import { MatDividerModule } from "@angular/material/divider";
import { AuthService, AuthUser } from "../../services/auth.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
  ],
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.css"],
})
export class LayoutComponent implements OnInit {
  currentUser$: Observable<AuthUser | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {}

  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
  }
}
