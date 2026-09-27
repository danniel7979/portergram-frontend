import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FollowService {
  public url = 'http://localhost:3800/api/';

  constructor(private http: HttpClient) {}

  follow(token: string, followed: string) {
    return this.http.post(this.url + 'follow', { followed }, {
      headers: { Authorization: token }
    });
  }

  unfollow(token: string, followed: string) {
    return this.http.delete(this.url + 'follow/' + followed, {
      headers: { Authorization: token }
    });
  }
}