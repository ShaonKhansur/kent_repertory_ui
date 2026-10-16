import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  KentApiService,
  SearchedRubric,
  ClarifyResponse,
  HealthResponse,
} from './services/kent-api.service';
import { AppHeaderComponent } from './components/header/header.component';
import {
  RubricSearchComponent,
  SearchCriteria,
} from './components/rubric-search/rubric-search.component';
import { RubricListComponent } from './components/rubric-list/rubric-list.component';
import { ClarifyPanelComponent } from './components/clarify-panel/clarify-panel.component';
import { RepertorizationMatrixComponent } from './components/repertorization-matrix/repertorization-matrix.component';

export type MobileTab = 'search' | 'clarify' | 'matrix';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    AppHeaderComponent,
    RubricSearchComponent,
    RubricListComponent,
    ClarifyPanelComponent,
    RepertorizationMatrixComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  public api = inject(KentApiService);

  // Search and clarification state
  public isSearching = signal<boolean>(false);
  public searchResults = signal<SearchedRubric[]>([]);
  public activeClarify = signal<ClarifyResponse | null>(null);
  public isClarifying = signal<boolean>(false);
  public healthStatus = signal<HealthResponse | null>(null);

  // Track last executed search criteria
  public lastCriteria = signal<SearchCriteria>({
    query: 'forsaken feeling in the evening',
    chapters: ['Mind'],
    topK: 10,
  });

  // Mobile navigation tab
  public activeMobileTab = signal<MobileTab>('search');

  // Computed IDs of rubrics currently in the case basket
  public selectedRubricIds = computed<string[]>(() => {
    return this.api.selectedRubrics().map((r) => r.id);
  });

  public caseCount = computed<number>(() => {
    return this.api.selectedRubrics().length;
  });

  ngOnInit() {
    this.checkHealth();
    // Default initial search
    this.executeSearch(this.lastCriteria());
  }

  public checkHealth() {
    this.api.checkHealth().subscribe({
      next: (res) => this.healthStatus.set(res),
      error: () => this.healthStatus.set(null),
    });
  }

  public onApiModeChanged() {
    this.healthStatus.set(null);
    this.checkHealth();
    this.executeSearch(this.lastCriteria());
  }

  public executeSearch(criteria: SearchCriteria) {
    this.lastCriteria.set(criteria);
    this.isSearching.set(true);
    this.api.searchRubrics(criteria.query, criteria.chapters, criteria.topK).subscribe({
      next: (res) => {
        this.searchResults.set(res.rubrics || []);
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search error', err);
        this.searchResults.set([]);
        this.isSearching.set(false);
      },
    });
  }

  public openClarify(rubric: SearchedRubric) {
    this.isClarifying.set(true);
    // On mobile screens, automatically navigate to the Clarify tab
    this.activeMobileTab.set('clarify');

    this.api.getClarifyingQuestions(rubric.id, rubric.rubric_path).subscribe({
      next: (res) => {
        this.activeClarify.set(res);
        this.isClarifying.set(false);
      },
      error: (err) => {
        console.error('Clarify error', err);
        this.isClarifying.set(false);
      },
    });
  }

  public closeClarify() {
    this.activeClarify.set(null);
    if (this.activeMobileTab() === 'clarify') {
      this.activeMobileTab.set('search');
    }
  }

  public onModalitySelected(modality: string) {
    // Append modality and re-run search in the search component
    const ch = this.activeClarify()?.chapter;
    this.executeSearch({
      query: `${modality}`,
      chapters: ch ? [ch] : ['Mind'],
      topK: 10,
    });
    this.activeMobileTab.set('search');
  }

  public addRubricToCase(rubric: SearchedRubric) {
    this.api.addRubric(rubric);
  }

  public setMobileTab(tab: MobileTab) {
    this.activeMobileTab.set(tab);
  }
}
