import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigModel } from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
    data: any = {};

    constructor(private http: HttpClient) {
      console.log('Creates Config Service');
      this.load();
    }

    load() {
        console.log('Loads configurations');
        return new Promise<{}>((resolve, reject) => {
            const langPath = `assets/config.json`;

            console.log('Loads configurations: promise');
            this.http.get<{}>(langPath).subscribe(
              translation => {
                this.data = Object.assign({}, translation || {});
                console.log('Loads configurations: resolved');
                resolve(this.data);
              },
              error => {
                this.data = {};
                console.log('Loads configurations: error');
                resolve(this.data);
              }
            );
          });
        }

    getModel() {
      return new ConfigModel().deserialize(this.data);
    }

    formatString(str: string, ...val: string[]) {
      for (let index = 0; index < val.length; index++) {
        str = str.replace(`{${index}}`, val[index]);
      }
      return str;
    }
}
