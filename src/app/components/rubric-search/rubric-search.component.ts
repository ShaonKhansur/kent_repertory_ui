import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchCriteria {
  query: string;
  chapters: string[];
  topK: number;
}

@Component({
  selector: 'app-rubric-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rubric-search.component.html',
  styleUrl: './rubric-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RubricSearchComponent {
  public isSearching = input<boolean>(false);
  public searchTriggered = output<SearchCriteria>();

  public query = signal<string>('forsaken feeling in the evening');
  public selectedChapters = signal<string[]>(['Mind']);
  public topK = signal<number>(10);

  public isDropdownOpen = signal<boolean>(false);
  public filterTerm = signal<string>('');

  public readonly chapters: string[] = [
    'Mind', 'Vertigo', 'Head', 'Eye', 'Vision', 'Ear', 'Hearing', 'Nose',
    'Face', 'Mouth', 'Teeth', 'Throat', 'External Throat', 'Stomach', 'Abdomen',
    'Rectum', 'Stool', 'Bladder', 'Kidneys', 'Prostate Gland', 'Urethra', 'Urine',
    'Genitalia Male', 'Genitalia Female', 'Larynx and Trachea', 'Respiration', 'Cough',
    'Expectoration', 'Chest', 'Back', 'Extremities', 'Sleep', 'Chill', 'Fever',
    'Perspiration', 'Skin', 'Generalities',
  ];

  public readonly topKOptions: number[] = [5, 8, 10, 15, 25, 50];

  public isAllSelected = computed<boolean>(() => {
    return this.selectedChapters().length === this.chapters.length;
  });

  public filteredChapters = computed<string[]>(() => {
    const term = this.filterTerm().toLowerCase().trim();
    if (!term) return this.chapters;
    return this.chapters.filter((ch) => ch.toLowerCase().includes(term));
  });

  public chapterSummary = computed<string>(() => {
    const sel = this.selectedChapters();
    if (sel.length === this.chapters.length) {
      return 'All Chapters (37)';
    }
    if (sel.length === 0) {
      return 'Select Chapters';
    }
    if (sel.length <= 2) {
      return sel.join(', ');
    }
    return `${sel[0]}, ${sel[1]} (+${sel.length - 2} more)`;
  });

  public toggleChapter(ch: string) {
    const current = this.selectedChapters();
    if (current.includes(ch)) {
      if (current.length === 1) return; // Prevent 0 chapters
      this.selectedChapters.set(current.filter((c) => c !== ch));
    } else {
      this.selectedChapters.set([...current, ch]);
    }
  }

  public removeChapter(ch: string, ev?: Event) {
    if (ev) ev.stopPropagation();
    const current = this.selectedChapters();
    if (current.length <= 1) return;
    this.selectedChapters.set(current.filter((c) => c !== ch));
  }

  public isChapterSelected(ch: string): boolean {
    return this.selectedChapters().includes(ch);
  }

  public selectAll() {
    this.selectedChapters.set([...this.chapters]);
  }

  public resetToDefault() {
    this.selectedChapters.set(['Mind']);
  }

  public toggleDropdown() {
    this.isDropdownOpen.update((v) => !v);
  }

  public closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  public triggerSearch() {
    const q = this.query().trim();
    if (!q) return;
    this.isDropdownOpen.set(false);
    this.searchTriggered.emit({
      query: q,
      chapters: this.selectedChapters(),
      topK: this.topK(),
    });
  }

  public clearQuery() {
    this.query.set('');
  }

  public setQuickSearch(term: string, chapters: string[]) {
    this.query.set(term);
    this.selectedChapters.set(chapters);
    this.triggerSearch();
  }

  public onTopKChange(newTopK: number) {
    this.topK.set(newTopK);
  }
}
