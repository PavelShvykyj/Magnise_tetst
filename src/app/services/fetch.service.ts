import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of, take, tap } from 'rxjs';
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class FetchService {
  client = inject(HttpClient);
  auth = inject(AuthStateService)

  Refresh(loginData: {login: string, password: string}) {
    let body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', 'app-cli');
    body.set('username', loginData.login);
    body.set('password', loginData.password);

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers = headers.append('Accept', '*/*');

    return this.client.post(`/identity/realms/fintatech/protocol/openid-connect/token`,
      body.toString(), {headers: headers})
    .pipe(
      tap(data => {this.auth.exparation_period = ((data as any).expires_in*1000 - 500)}),
      map(data => {return (data as any).access_token}),

      take(1),
    )

  }

  getList(source: string, inputparams:Record<string,string> | undefined) : Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`
    });

    let params = new HttpParams();
    if (!!inputparams) {
      const keys = Object.keys(inputparams);
      keys.forEach(key => {
        params = params.append(key, inputparams[key]);
      });
    }

    return this.client.get(source,{headers, params})
    .pipe(map(res=> {return (res as any)['data']}));
  }

  getData(source: string, inputparams:Record<string,string> | undefined) : Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`
    });

    let params = new HttpParams();
    if (!!inputparams) {
      const keys = Object.keys(inputparams);
      keys.forEach(key => {
        params = params.append(key, inputparams[key]);
      });
    }

    return this.client.get(source,{headers, params, responseType: 'text'});
  }
}


