import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  imports: [RouterOutlet]
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideAnimations()
  ]
}).catch(err => console.error(err));