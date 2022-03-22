import { Component } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  percentDone?: number;
  uploadResponse?: { id?: string };
  file?: File;

  constructor(private readonly http: HttpClient) {}

  onFileChange(event: Event) {
    this.percentDone = undefined;
    this.uploadResponse = undefined;

    const el = event.currentTarget as HTMLInputElement;
    this.file = el.files?.[0];
  }

  upload() {
    if (!this.file) return;

    const formData = new FormData();
    formData.append('file', this.file);

    this.percentDone = 0;

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
          this.uploadResponse = event.body ?? {};
        }
      });
  }
}
