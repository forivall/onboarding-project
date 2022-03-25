import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class BearerTokenInterceptor implements HttpInterceptor {
  constructor(private readonly auth: AuthService) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const { token } = this.auth;
    let authReq = req;
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
    }
    return next.handle(authReq).pipe(
      tap((event) => {
        // Response = 4
        if (event.type === 4) {
          // auto log out when the server says youre logged out.
          // in a more complete service, this should be more well defined before
          // implementation
          const isLoggedIn = event.headers.get('x-is-logged-in');
          if (isLoggedIn === 'false' && this.auth.token) {
            this.auth.logout();
          }
        }
      })
    );
  }
}
