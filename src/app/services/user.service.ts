import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public url = 'http://localhost:3800/api/';

  constructor(private http: HttpClient) {}

  getUser(id: string, token: string) {
  return this.http.get(this.url + 'user/' + id, {
    headers: {
      Authorization: token
    }
  });
}

  uploadImage(userId: string, file: File, token: string) {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post(
      this.url + 'update-image-user/' + userId,
      formData,
      {
        headers: {
          Authorization: token
        }
      }
    );
  }

  getUsers(token: string, page = 1) {
  return this.http.get(this.url + 'users/' + page, {
    headers: { Authorization: token }
  });
}

updateProfileSettings(userId: string, data: any, token: string) {
  return this.http.put(
    this.url + 'update-profile-settings/' + userId,
    data,
    {
      headers: {
        Authorization: token
      }
    }
  );
}

register(user: any) {
  return this.http.post(
    this.url + 'register',
    user
  );
}



getCounters(token: string, userId: string) {
  return this.http.get(
    this.url + 'counters/' + userId,
    {
      headers: {
        Authorization: token
      }
    }
  );
}

login(user: any) {
  return this.http.post<any>(
    this.url + 'login',
    user
  );
}

forgotPassword(email: string) {
  return this.http.post<any>(
    this.url + 'forgot-password',
    { email }
  );
}

resetPassword(token: string, password: string) {
  return this.http.post<any>(
    this.url + 'reset-password/' + token,
    { password }
  );
}

toggleBan(token: string, userId: string) {
  return this.http.put(
    this.url + 'admin/toggle-ban/' + userId,
    {},
    {
      headers: {
        Authorization: token
      }
    }
  );
}

uploadAvatar(token: string, userId: string, file: File) {
  const formData = new FormData();

  formData.append('image', file);

  return this.http.post(
    this.url + 'update-image-user/' + userId,
    formData,
    {
      headers: {
        Authorization: token
      }
    }
  );
}

getToken() {
    return localStorage.getItem('token');
}

deleteAvatar(token: string, userId: string) {
  return this.http.delete(
    this.url + 'delete-image-user/' + userId,
    {
      headers: {
        Authorization: token
      }
    }
  );
}

deleteAccount(token: string) {
  return this.http.delete(this.url + 'account', {
    headers: { Authorization: token }
  });
}

}