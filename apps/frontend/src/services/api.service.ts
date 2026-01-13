import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private getHeaders(includeAuth: boolean = false): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (includeAuth) {
      const token = this.getStoredToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  get<T>(endpoint: string, requiresAuth: boolean = false): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(requiresAuth)
    });
  }

  post<T>(endpoint: string, body: any, requiresAuth: boolean = false): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders(requiresAuth)
    });
  }

  put<T>(endpoint: string, body: any, requiresAuth: boolean = false): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders(requiresAuth)
    });
  }

  delete<T>(endpoint: string, requiresAuth: boolean = false): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(requiresAuth)
    });
  }

  // Upload file (FormData)
  uploadFile<T>(endpoint: string, formData: FormData, requiresAuth: boolean = true): Observable<T> {
    let headers = new HttpHeaders();

    if (requiresAuth) {
      const token = this.getStoredToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Don't set Content-Type for FormData, let browser set it with boundary
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, {
      headers
    });
  }
}
