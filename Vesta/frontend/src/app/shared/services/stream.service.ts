import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  startStream(rtspUrl: string): Observable<any> {
    const options = { url: rtspUrl, wsPort: 3333 };

    return this.http.post(`${this.apiUrl}/start-stream`, options);
  }

  stopStream(rtspUrl: string): Observable<any> {
    const options = { url: rtspUrl, wsPort: 3333 };
    return this.http.post(`${this.apiUrl}/stop-stream`, options);
  }
}
