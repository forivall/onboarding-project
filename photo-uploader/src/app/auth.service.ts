import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

const storageKey = '10kc.auth.token';

export interface UserInfo {
  _id: string;
  email: string;
  username: string;

  createdAt: string;
  updatedAt: string;
}

export interface LoginRegisterResponse {
  token: string;
  user: UserInfo;
}

export interface UserInfoLogin {
  email: string;
  password: string;
}

export interface UserInfoRegister extends UserInfoLogin {
  username?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // TODO: decode jwt to get id and load that, and then we can hide the delete
  // button for other users photos
  token = window.sessionStorage.getItem(storageKey);
  constructor(private readonly http: HttpClient) {}

  register(info: UserInfoRegister) {
    return this.http
      .post<LoginRegisterResponse>('/api/user/register', info)
      .pipe(
        tap((resp) => {
          this.loggedIn(resp);
        })
      );
  }

  // TODO: tap and require subscription instead
  login(info: UserInfoLogin) {
    this.http.post('/api/user/login', info).subscribe((resp) => {
      this.loggedIn(resp as LoginRegisterResponse);
    });
  }

  logout() {
    this.token = null;
    window.sessionStorage.removeItem(storageKey);
  }

  private loggedIn(resp: LoginRegisterResponse) {
    this.token = resp.token;
    window.sessionStorage.setItem(storageKey, resp.token);
  }
}
