import { Component } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';

// TODO: split into multiple components appropriately

interface PhotoListItem {
  _id: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  percentDone?: number;
  uploadResponse?: PhotoListItem;
  uploading = false;
  file?: File;

  loadingPhotos = true;
  photos: PhotoListItem[] = [];

  constructor(private readonly http: HttpClient) {
    this.loadPhotos();
  }

  onFileChange(event: Event) {
    this.percentDone = undefined;
    this.uploadResponse = undefined;
    this.uploading = false;

    const el = event.currentTarget as HTMLInputElement;
    this.file = el.files?.[0];
  }

  upload() {
    if (!this.file) return;

    const formData = new FormData();
    formData.append('file', this.file);

    this.percentDone = 0;
    this.uploading = true;

    this.http
      .post('/api/photos', formData, {
        reportProgress: true,
        observe: 'events',
      })
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.percentDone = Math.round((100 * event.loaded) / event.total);
          }
        } else if (event instanceof HttpResponse) {
          this.uploadResponse = event.body as PhotoListItem;
          this.photos.push(this.uploadResponse);
        }
      });
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
