import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export interface ModelMetrics {
  modelType: 'ML' | 'DL' | 'HYBRID';
  precision: number;
  recall: number;
  latencyMs: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class Metrics {
  // Ruta donde tu FastAPI estará sirviendo los datos reales
  private apiUrl = 'http://localhost:8000/metrics';

  // Inyectamos el HttpClient para poder hacer peticiones a tu backend
  constructor(private http: HttpClient) {}

  getRealTimeMetrics(modelType: string): Observable<ModelMetrics> {
    // Sigue consultando cada 2 segundos, pero ahora hace una petición GET real
    return timer(0, 2000).pipe(
      switchMap(() => this.http.get<any>(`${this.apiUrl}?modelType=${modelType}`)),
      map(data => ({
        modelType: data.modelType as 'ML' | 'DL' | 'HYBRID',
        precision: data.precision,
        recall: data.recall,
        latencyMs: data.latencyMs,
        // Convertimos el string de fecha a un objeto Date para el gráfico
        timestamp: new Date()
      }))
    );
  }
}
