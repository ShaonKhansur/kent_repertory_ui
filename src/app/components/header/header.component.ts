import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { HealthResponse, KentApiService } from '../../services/kent-api.service';

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
  public api = inject(KentApiService);
  public healthStatus = input<HealthResponse | null>(null);
  public modeChanged = output<void>();

  public toggleTheme() {
    this.themeService.toggleTheme();
  }

  public toggleApiMode() {
    this.api.toggleApiMode();
    this.modeChanged.emit();
  }
}
