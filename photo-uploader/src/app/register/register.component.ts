import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  email = '';
  password = '';
  password2 = '';

  message = '';
  constructor(readonly auth: AuthService) {}

  doRegister() {
    if (this.password !== this.password2) {
      this.message = 'Passwords must be the same';
      return;
    }
    this.auth.register({
      email: this.email,
      password: this.password,
    });
  }
}
