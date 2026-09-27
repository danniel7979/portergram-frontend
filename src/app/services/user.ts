import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public url = 'http://localhost:3800/api/';

  constructor(private http: HttpClient) {}

  login(user: any): Observable<any> {
    return this.http.post(this.url + 'login', user);
  }
}