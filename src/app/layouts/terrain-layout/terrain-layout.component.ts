import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-terrain-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="w-full min-h-screen bg-gray-50">
      <router-outlet></router-outlet>
    </main>
  `
})
export class TerrainLayoutComponent {}
