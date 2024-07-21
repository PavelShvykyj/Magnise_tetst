import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './services/auth-interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';


export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
     provideAnimationsAsync(),
     provideHttpClient(withInterceptors([AuthInterceptor])), provideCharts(withDefaultRegisterables()),
]};


