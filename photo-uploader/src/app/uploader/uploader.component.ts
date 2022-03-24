import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { PhotoListItem } from '../types';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent {
  @Output() uploaded = new EventEmitter<PhotoListItem>();
  percentDone?: number;
  uploadResponse?: PhotoListItem;
  uploading = false;
  file?: File;
  constructor(private readonly http: HttpClient) {}

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
          const photo = event.body as PhotoListItem;
          this.uploadResponse = photo;
          this.uploaded.emit(photo);
        }
      });
  }
}
