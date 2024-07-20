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

  Refresh() {
    let body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', 'app-cli');
    body.set('username', environment.login);
    body.set('password', environment.pass);


    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers = headers.append('Accept', '*/*');

    this.client.post(`/identity/realms/fintatech/protocol/openid-connect/token`,
      body.toString(), {headers: headers})
    .pipe(
      catchError((err)=> {
        return of({
        expires_in: 30,
        access_token: ''
      })}),
      tap(data => {this.auth.exparatin_period = ((data as any).expires_in*1000 - 500)}),
      map(data => {return (data as any).access_token}),
      take(1),
    )
      .subscribe(
          token => {
            this.auth.token = token as string;
            setTimeout(()=> this.Refresh(),this.auth.exparatin_period)
          });
  }

  getProviders() {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.auth.token}`
    });

   return this.client.get('/api/instruments/v1/providers',{headers});

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

    return this.client.get(source,{headers, params}).pipe(map(res=> {return (res as any)['data']}));
  }

}


