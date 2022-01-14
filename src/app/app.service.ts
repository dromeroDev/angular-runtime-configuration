import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from './config/app-config.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  protected apiServer = AppConfigService.settings.url_server;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http
      .get(this.apiServer)
      .pipe(map((res: any) => res['results']));
  }
}
