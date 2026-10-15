import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchedRubric } from '../../services/kent-api.service';
import { RubricCardComponent } from '../rubric-card/rubric-card.component';

@Component({
  selector: 'app-rubric-list',
  standalone: true,
  imports: [CommonModule, RubricCardComponent],
  templateUrl: './rubric-list.component.html',
  styleUrl: './rubric-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubricListComponent {
  public rubrics = input<SearchedRubric[]>([]);
  public isSearching = input<boolean>(false);
  public selectedIds = input<string[]>([]);

  public addRequested = output<SearchedRubric>();
  public clarifyRequested = output<SearchedRubric>();

  public isRubricSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }
}
