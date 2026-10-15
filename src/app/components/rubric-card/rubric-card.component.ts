import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchedRubric, Remedy } from '../../services/kent-api.service';

@Component({
  selector: 'app-rubric-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rubric-card.component.html',
  styleUrl: './rubric-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubricCardComponent {
  public rubric = input.required<SearchedRubric>();
  public isSelected = input<boolean>(false);

  public addRequested = output<SearchedRubric>();
  public clarifyRequested = output<SearchedRubric>();

  // Expandable remedy toggle
  public showAllRemedies = signal<boolean>(false);

  // Visible remedies based on toggle state
  public visibleRemedies = computed<Remedy[]>(() => {
    const list = this.rubric().remedies || [];
    if (this.showAllRemedies()) {
      return list;
    }
    return list.slice(0, 8);
  });

  public remainingRemediesCount = computed<number>(() => {
    const total = this.rubric().remedies?.length || 0;
    return Math.max(0, total - 8);
  });

  public toggleShowAllRemedies() {
    this.showAllRemedies.update((v) => !v);
  }

  public onAdd() {
    if (!this.isSelected()) {
      this.addRequested.emit(this.rubric());
    }
  }

  public onClarify() {
    this.clarifyRequested.emit(this.rubric());
  }
}
