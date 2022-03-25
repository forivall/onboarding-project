import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { PhotoListItem } from './types';

@Injectable({
  providedIn: 'root',
})
export class PhotosService {
  // TODO: learn if these work when accessed in a component
  loadingPhotos = true;
  photos: PhotoListItem[] = [];

  constructor(private readonly http: HttpClient, readonly auth: AuthService) {
    this.loadPhotos();
  }

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

  uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post('/api/photos', formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe((event) => {
        if (event instanceof HttpResponse) {
          const photo = event.body as PhotoListItem;
          this.photos.push(photo);
        }
        return event;
      });
  }
}
