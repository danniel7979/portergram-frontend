import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  public url = 'http://localhost:3800/api/';

  constructor(private http: HttpClient) {}

  private getHeaders(token: string) {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token
    });
  }

  sendMessage(token: string, receiver: string, text: string) {
    return this.http.post(
      this.url + 'message',
      { receiver, text },
      { headers: this.getHeaders(token) }
    );
  }

  getConversation(token: string, userId: string) {
    return this.http.get(
      this.url + 'conversation/' + userId,
      { headers: this.getHeaders(token) }
    );
  }

  getReceivedMessages(token: string, page: number = 1) {
    return this.http.get(
      this.url + 'my-messages/' + page,
      { headers: this.getHeaders(token) }
    );
  }

  getSentMessages(token: string, page: number = 1) {
    return this.http.get(
      this.url + 'sent-messages/' + page,
      { headers: this.getHeaders(token) }
    );
  }

  getUnviewedMessages(token: string) {
    return this.http.get(
      this.url + 'unviewed-messages',
      { headers: this.getHeaders(token) }
    );
  }

  setViewedMessage(token: string, messageId: string) {
    return this.http.put(
      this.url + 'set-viewed-message/' + messageId,
      {},
      { headers: this.getHeaders(token) }
    );
  }
}