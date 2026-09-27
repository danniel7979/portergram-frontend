import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  public url = 'http://localhost:3800/api/';

  constructor(private http: HttpClient) {}

  follow(token: string, followed: string) {
    return this.http.post(this.url + 'follow', { followed }, {
      headers: { Authorization: token }
    });
  }

  unfollow(token: string, followed: string) {
    return this.http.delete(this.url + 'unfollow/' + followed, {
      headers: { Authorization: token }
    });
  }

  isFollowing(token: string, userId: string) {
  return this.http.get(this.url + 'get-my-follows/' + userId, {
    headers: { Authorization: token }
  });
}

isFollowedBy(token: string, userId: string) {
  return this.http.get(this.url + 'is-followed/' + userId, {
    headers: { Authorization: token }
  });
}

getFollowingUsers(token: string) {

  const headers = new HttpHeaders({
    Authorization: token
  });

  return this.http.get(
    this.url + 'following',
    { headers }
  );
}

getFollowers(token: string) {

  const headers = new HttpHeaders({
    Authorization: token
  });

  return this.http.get(
    this.url + 'followed',
    { headers }
  );
}

}