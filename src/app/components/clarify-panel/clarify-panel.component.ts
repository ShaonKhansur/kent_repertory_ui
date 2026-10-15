import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarifyResponse } from '../../services/kent-api.service';

@Component({
  selector: 'app-clarify-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clarify-panel.component.html',
  styleUrl: './clarify-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClarifyPanelComponent {
  public clarifyData = input<ClarifyResponse | null>(null);
  public isClarifying = input<boolean>(false);

  public closeRequested = output<void>();
  public modalitySelected = output<string>();

  public onClose() {
    this.closeRequested.emit();
  }

  public onModalityClick(label: string) {
    this.modalitySelected.emit(label);
  }
}
