import { Component } from '@angular/core';
import { PhotosService } from './photos.service';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';

// TODO: split photo display into sub-component(s) appropriately

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  page = '';
  sub?: Subscription;
  constructor(readonly photos: PhotosService, readonly auth: AuthService) {}
}
