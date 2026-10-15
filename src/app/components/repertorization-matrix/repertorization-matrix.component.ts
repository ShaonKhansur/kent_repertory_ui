import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KentApiService, RankedRemedy } from '../../services/kent-api.service';
import { CaseBasketComponent } from '../case-basket/case-basket.component';

@Component({
  selector: 'app-repertorization-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule, CaseBasketComponent],
  templateUrl: './repertorization-matrix.component.html',
  styleUrl: './repertorization-matrix.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepertorizationMatrixComponent {
  public api = inject(KentApiService);

  // Filter text to quickly search a specific remedy within the results
  public remedyFilter = signal<string>('');

  // Toggle between showing Top 15 vs All ranked remedies
  public showAllRemedies = signal<boolean>(false);

  // Filtered & sliced remedies
  public displayedRemedies = computed<RankedRemedy[]>(() => {
    const matrix = this.api.repertorizationMatrix();
    if (!matrix || !matrix.ranked_remedies) return [];

    let list = matrix.ranked_remedies;
    const filter = this.remedyFilter().trim().toLowerCase();

    if (filter) {
      list = list.filter(
        (rem) =>
          rem.full_name.toLowerCase().includes(filter) || rem.abbr.toLowerCase().includes(filter),
      );
    }

    if (!this.showAllRemedies() && !filter) {
      return list.slice(0, 15);
    }

    return list;
  });

  public totalRankedCount = computed<number>(() => {
    return this.api.repertorizationMatrix()?.ranked_remedies?.length || 0;
  });

  public toggleShowAll() {
    this.showAllRemedies.update((v) => !v);
  }

  public exportCsv() {
    const matrix = this.api.repertorizationMatrix();
    if (!matrix || matrix.ranked_remedies.length === 0) return;

    const headers = [
      'Rank',
      'Remedy Name',
      'Abbreviation',
      'Covered',
      'Total Score',
      ...matrix.rubrics_summary.map((r) => `R${r.index + 1}: ${r.path.replace(/,/g, ' ')}`),
    ];

    const rows = matrix.ranked_remedies.map((rem) => {
      const grades = matrix.rubrics_summary.map((r) => rem.rubric_grades[r.index] ?? 0);
      return [
        rem.rank,
        `"${rem.full_name}"`,
        rem.abbr,
        `${rem.rubrics_covered}/${matrix.rubrics_analyzed}`,
        rem.total_score,
        ...grades,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `repertorization_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
