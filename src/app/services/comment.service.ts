import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private url = 'http://localhost:3800/api/comments';

  constructor(private http: HttpClient) {}

  addComment(postId: string, text: string) {
    const token = localStorage.getItem('token');

    return this.http.post(
      this.url,
      { postId, text },
      {
        headers: {
          Authorization: token || ''
        }
      }
    );
  }

  getComments(postId: string) {
    return this.http.get<any[]>(`${this.url}/post/${postId}`);
  }

  deleteComment(commentId: string) {
    const token = localStorage.getItem('token');

    return this.http.delete(`${this.url}/${commentId}`, {
      headers: {
        Authorization: token || ''
      }
    });
  }
}