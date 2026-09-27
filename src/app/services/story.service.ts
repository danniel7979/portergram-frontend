import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StoryService {

  public url = 'http://localhost:3800/api/';

  constructor(private http: HttpClient) {}

  createStory(token: string, file: File, icon: string, text: string, duration: number) {
    const formData = new FormData();

    formData.append('media', file);
    formData.append('icon', icon);
    formData.append('text', text || '');
    formData.append('duration', duration.toString());

    return this.http.post(
      this.url + 'story',
      formData,
      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  getStories(token: string) {
    return this.http.get(
      this.url + 'stories',
      {
        headers: {
          Authorization: token
        }
      }
    );
  }

}