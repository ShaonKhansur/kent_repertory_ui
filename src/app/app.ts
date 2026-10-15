import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KentApiService, SearchedRubric, ClarifyResponse, HealthResponse } from './services/kent-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  public api = inject(KentApiService);

  public query = signal('forsaken feeling in the evening');
  public selectedChapter = signal('Mind');
  public isSearching = signal(false);
  public searchResults = signal<SearchedRubric[]>([]);
  public activeClarify = signal<ClarifyResponse | null>(null);
  public isClarifying = signal(false);
  public healthStatus = signal<HealthResponse | null>(null);

  public chapters = [
    'Mind', 'Vertigo', 'Head', 'Eye', 'Vision', 'Ear', 'Hearing', 'Nose',
    'Face', 'Mouth', 'Teeth', 'Throat', 'External Throat', 'Stomach', 'Abdomen',
    'Rectum', 'Stool', 'Bladder', 'Kidneys', 'Prostate Gland', 'Urethra', 'Urine',
    'Genitalia Male', 'Genitalia Female', 'Larynx and Trachea', 'Respiration', 'Cough',
    'Expectoration', 'Chest', 'Back', 'Extremities', 'Sleep', 'Chill', 'Fever',
    'Perspiration', 'Skin', 'Generalities'
  ];

  ngOnInit() {
    this.checkHealth();
    this.onSearch();
  }

  checkHealth() {
    this.api.checkHealth().subscribe({
      next: (res) => this.healthStatus.set(res),
      error: () => this.healthStatus.set(null)
    });
  }

  onSearch() {
    const q = this.query().trim();
    if (!q) return;

    this.isSearching.set(true);
    this.api.searchRubrics(q, this.selectedChapter(), 6).subscribe({
      next: (res) => {
        this.searchResults.set(res.rubrics || []);
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search error', err);
        this.searchResults.set([]);
        this.isSearching.set(false);
      }
    });
  }

  openClarify(rubric: SearchedRubric) {
    this.isClarifying.set(true);
    this.api.getClarifyingQuestions(rubric.id, rubric.rubric_path).subscribe({
      next: (res) => {
        this.activeClarify.set(res);
        this.isClarifying.set(false);
      },
      error: (err) => {
        console.error('Clarify error', err);
        this.isClarifying.set(false);
      }
    });
  }

  closeClarify() {
    this.activeClarify.set(null);
  }

  addRubric(rubric: SearchedRubric) {
    this.api.addRubric(rubric);
  }

  removeRubric(id: string) {
    this.api.removeRubric(id);
  }

  isRubricSelected(id: string): boolean {
    return this.api.selectedRubrics().some(r => r.id === id);
  }

  selectSubRubric(subLabel: string) {
    const current = this.query();
    this.query.set(`${current} ${subLabel}`);
    this.onSearch();
  }
}
