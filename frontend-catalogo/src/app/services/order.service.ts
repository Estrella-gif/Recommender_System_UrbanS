import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, PageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  create(items: { productId: number; quantity: number }[]): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, { items });
  }

  list(page = 0, size = 10): Observable<PageResponse<Order>> {
    return this.http.get<PageResponse<Order>>(this.apiUrl, {
      params: new HttpParams().set('page', page).set('size', size),
    });
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }
}
