import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

declare const Office: any;

if (environment.production) {
  enableProdMode();
}

Office.initialize = (reason: any) => {
  console.log('Excel addin: initalizing office.js...');
  platformBrowserDynamic().bootstrapModule(AppModule)
    .then((success: any) => {
      console.log('Excel addin: bootstrap success', success);
    })
    .catch((error: any) => {
      console.log('Excel addin: bootstrap error', error);
    });
};


