
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, map, of, take, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  token : string = '';

  exparatin_period = 3600*1000;


}

