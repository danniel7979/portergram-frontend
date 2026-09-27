import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  public url = 'http://localhost:3800/api/';

  constructor(private http: HttpClient) { }

  getPublications(token: string) {
    return this.http.get(this.url + 'publications/1', {
      headers: { Authorization: token }
    });
  }

  addPublication(token: string, publication: any) {
    return this.http.post(this.url + 'publication', publication, {
      headers: { Authorization: token }
    });
  }

  uploadImagePub(
    id: string,
    files: File[],
    token: string
  ) {

    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post(
      this.url + 'publication/upload-image/' + id,
      formData,
      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  deletePublication(token: string, publicationId: string) {
    return this.http.delete(this.url + 'publication/' + publicationId, {
      headers: { Authorization: token }
    });
  }

  likePublication(token: string, id: string) {
    return this.http.post(
      this.url + 'publication/like/' + id,
      {},
      {
        headers: {
          Authorization: token
        }
      }
    );
  }
  // 💬 Añadir comentario (perfil)
  addCommentProfile(token: string, pubId: string, text: string) {
    return this.http.post(
      this.url + 'publication/comment/' + pubId,
      { text },
      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  // 🗑️ Eliminar comentario (perfil)
  deleteCommentProfile(token: string, pubId: string, commentId: string) {
    return this.http.delete(
      this.url + 'publication/comment/' + pubId + '/' + commentId,
      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  getUserPublications(token: string, userId: string) {
    return this.http.get<any>(
      this.url + 'publications-user/' + userId,
      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  replyComment(
    token: string,
    commentId: string,
    text: string
  ) {

    return this.http.post(

      this.url + 'comments/reply/' + commentId,

      { text },

      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  addComment(
    token: string,
    publicationId: string,
    text: string
  ) {
    return this.http.post(
      this.url + 'publication/comment/' + publicationId,
      {
        text
      },
      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  likeComment(token: string, commentId: string) {

    return this.http.post(

      this.url + 'comments/like/' + commentId,

      {},

      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  dislikeComment(token: string, commentId: string) {
    return this.http.post(
      this.url + 'comments/dislike/' + commentId,
      {},
      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  dislikePublication(
    token: string,
    publicationId: string
  ) {

    return this.http.post(

      this.url + 'publication/dislike/' + publicationId,

      {},

      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  replyCommentProfile(token: string, pubId: string, commentId: string, text: string) {
    return this.http.post(
      this.url + 'publication/comment/reply/' + pubId + '/' + commentId,
      { text },
      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  likeCommentProfile(token: string, pubId: string, commentId: string) {
    return this.http.post(
      this.url + 'publication/comment/like/' + pubId + '/' + commentId,
      {},
      { headers: { Authorization: token } }
    );
  }

  dislikeCommentProfile(token: string, pubId: string, commentId: string) {
    return this.http.post(
      this.url + 'publication/comment/dislike/' + pubId + '/' + commentId,
      {},
      { headers: { Authorization: token } }
    );
  }

  likeReplyProfile(token: string, pubId: string, commentId: string, replyId: string) {
    return this.http.post(
      this.url + 'publication/comment/reply/like/' + pubId + '/' + commentId + '/' + replyId,
      {},
      { headers: { Authorization: token } }
    );
  }

  dislikeReplyProfile(token: string, pubId: string, commentId: string, replyId: string) {
    return this.http.post(
      this.url + 'publication/comment/reply/dislike/' + pubId + '/' + commentId + '/' + replyId,
      {},
      { headers: { Authorization: token } }
    );
  }

  deleteReplyProfile(
    token: string,
    pubId: string,
    commentId: string,
    replyId: string
  ) {
    return this.http.delete(
      this.url + 'publication/comment/reply/' + pubId + '/' + commentId + '/' + replyId,
      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  toggleSharePublication(
    token: string,
    publicationId: string
  ) {
    return this.http.post<any>(
      this.url +
      'publication/share/' +
      publicationId,
      {},
      {
        headers: {
          Authorization: token
        }
      }
    );
  }

}