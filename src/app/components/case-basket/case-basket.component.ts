import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchedRubric } from '../../services/kent-api.service';

@Component({
  selector: 'app-case-basket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './case-basket.component.html',
  styleUrl: './case-basket.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseBasketComponent {
  public selectedRubrics = input<SearchedRubric[]>([]);

  public removeRubric = output<string>();
  public clearAll = output<void>();

  public showConfirmClear = signal<boolean>(false);

  public promptClear() {
    this.showConfirmClear.set(true);
  }

  public cancelClear() {
    this.showConfirmClear.set(false);
  }

  public confirmClear() {
    this.showConfirmClear.set(false);
    this.clearAll.emit();
  }

  public onRemove(id: string) {
    this.removeRubric.emit(id);
  }
}
