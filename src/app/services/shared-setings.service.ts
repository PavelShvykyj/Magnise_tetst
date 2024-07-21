import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedSetingsService {
  private instrumentId$: Subject<any> = new Subject<any>();
  private provider$: Subject<any> = new Subject<any>();

  get instrumentId(): Observable<any> {
    return this.instrumentId$.asObservable();
  }

  get provider(): Observable<any> {
    return this.provider$.asObservable();
  }

  set instrumentId(value: any) {
    this.instrumentId$.next(value);
  }

  set provider(value: any) {
    this.provider$.next(value);
  }
}
