import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { PhotoListItem } from './types';

// TODO: split photo display into sub-component(s) appropriately

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  loadingPhotos = true;
  photos: PhotoListItem[] = [];

  constructor(private readonly http: HttpClient) {
    this.loadPhotos();
  }

  // TODO: this should be in a service
  loadPhotos() {
    this.http.get('/api/photos').subscribe((body) => {
      this.photos = (body as { items: PhotoListItem[] }).items;
      this.loadingPhotos = false;
    });
  }

  deletePhoto(id: string) {
    this.http.delete(`/api/photos/${id}`).subscribe(() => {
      this.photos = this.photos.filter((photo) => photo._id !== id);
      // optional: could reload the entire list here instead.
    });
  }
}
