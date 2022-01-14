import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { IAppConfig } from './app-config';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  static settings: IAppConfig;
  private httpClient: HttpClient;

  constructor(handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
  }

  load() {
    const jsonFile = 'assets/json/config.json';

    return new Promise<void>((resolve, reject) => {
      this.httpClient
        .get(jsonFile)
        .toPromise()
        .then((response) => {
          AppConfigService.settings = <IAppConfig>response;

          //console.log('Config Loaded');
          //console.log(AppConfigService.settings);
          resolve();
        })
        .catch((response: any) => {
          reject(`Could not load the config file`);
        });
    });
  }
}
