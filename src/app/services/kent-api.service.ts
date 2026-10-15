import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Remedy {
  abbr: string;
  full_name: string;
  grade: 1 | 2 | 3;
}

export interface SearchedRubric {
  id: string;
  rubric_path: string;
  rubric_label: string;
  chapter: string;
  page: number;
  author: string;
  source_url: string;
  depth: number;
  similarity_score: number;
  remedy_count: number;
  remedies: Remedy[];
  immediate_child_rubrics: string[];
}

export interface SearchResponse {
  query: string;
  chapter: string;
  chapters?: string[];
  count: number;
  rubrics: SearchedRubric[];
}

export interface ClarifyResponse {
  rubric_path: string;
  chapter: string;
  page: number;
  child_sub_rubrics: Array<{ label: string; remedies_count: number }>;
  clarifying_questions: string;
}

export interface RankedRemedy {
  rank: number;
  abbr: string;
  full_name: string;
  rubrics_covered: number;
  total_score: number;
  rubric_grades: Record<number, number>;
}

export interface RepertorizeResponse {
  rubrics_analyzed: number;
  rubrics_summary: Array<{ index: number; path: string; page: number; remedy_count: number }>;
  ranked_remedies: RankedRemedy[];
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  dataset: { available: boolean; total_rubrics?: number; size_mb?: number };
  ollama: { connected: boolean; url: string; models_available: string[] };
  models: { embedding: string; embedding_ready: boolean; chat: string; chat_ready: boolean };
  cached_chapters: string[];
}

@Injectable({
  providedIn: 'root',
})
export class KentApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  // State Signals
  public selectedRubrics = signal<SearchedRubric[]>([]);
  public repertorizationMatrix = signal<RepertorizeResponse | null>(null);
  public isRepertorizing = signal<boolean>(false);

  checkHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
  }

  searchRubrics(
    query: string,
    chapters: string[] | string = 'Mind',
    topK: number = 8,
  ): Observable<SearchResponse> {
    const chaptersPayload = Array.isArray(chapters)
      ? chapters
      : typeof chapters === 'string'
        ? [chapters]
        : ['Mind'];
    return this.http.post<SearchResponse>(`${this.baseUrl}/search`, {
      query,
      chapters: chaptersPayload,
      chapter: chaptersPayload[0] || 'Mind',
      topK,
    });
  }

  getClarifyingQuestions(rubric_id: string, rubric_path?: string): Observable<ClarifyResponse> {
    return this.http.post<ClarifyResponse>(`${this.baseUrl}/clarify`, { rubric_id, rubric_path });
  }

  repertorize(rubric_ids: string[]): Observable<RepertorizeResponse> {
    return this.http.post<RepertorizeResponse>(`${this.baseUrl}/repertorize`, { rubric_ids });
  }

  addRubric(rubric: SearchedRubric) {
    const current = this.selectedRubrics();
    if (!current.some((r) => r.id === rubric.id)) {
      const updated = [...current, rubric];
      this.selectedRubrics.set(updated);
      this.refreshRepertorization();
    }
  }

  removeRubric(rubricId: string) {
    const updated = this.selectedRubrics().filter((r) => r.id !== rubricId);
    this.selectedRubrics.set(updated);
    if (updated.length > 0) {
      this.refreshRepertorization();
    } else {
      this.repertorizationMatrix.set(null);
    }
  }

  clearAllRubrics() {
    this.selectedRubrics.set([]);
    this.repertorizationMatrix.set(null);
  }

  refreshRepertorization() {
    const ids = this.selectedRubrics().map((r) => r.id);
    if (ids.length === 0) {
      this.repertorizationMatrix.set(null);
      return;
    }
    this.isRepertorizing.set(true);
    this.repertorize(ids).subscribe({
      next: (res) => {
        this.repertorizationMatrix.set(res);
        this.isRepertorizing.set(false);
      },
      error: (err) => {
        console.error('Repertorization calculation failed', err);
        this.isRepertorizing.set(false);
      },
    });
  }
}
