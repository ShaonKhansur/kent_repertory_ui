import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { HealthResponse } from '../../services/kent-api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeaderComponent {
  public themeService = inject(ThemeService);
  public healthStatus = input<HealthResponse | null>(null);

  public toggleTheme() {
    this.themeService.toggleTheme();
  }
}
