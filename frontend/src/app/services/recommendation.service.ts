import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recommendation } from '../models';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private apiUrl = 'http://localhost:8080/api/recommendations';

  constructor(private http: HttpClient) {}

  getForUser(topN = 10): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(this.apiUrl, {
      params: new HttpParams().set('topN', topN),
    });
  }

  getPopular(topN = 10): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.apiUrl}/popular`, {
      params: new HttpParams().set('topN', topN),
    });
  }
}
