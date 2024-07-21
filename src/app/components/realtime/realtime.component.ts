import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoaderComponent } from '../../core/UI/loader/loader.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { UiSelectComponent } from '../../core/UI/ui-select/ui-select.component';
import { AuthStateService } from '../../services/auth-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, merge, Observable, tap } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { NgClass } from '@angular/common';
import { SharedSetingsService } from '../../services/shared-setings.service';


export interface displayRealTimeData {
  date: Date,
  bid: number ,
  ask: number ,
  last: number
}

export const EMPTY_DATA : displayRealTimeData = {
  date: new Date(),
  bid: 0,
  ask: 0,
  last: 0
}

@Component({
  selector: 'app-realtime',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    AsyncPipe,
    DecimalPipe,
    NgClass,
    LoaderComponent,
    UiSelectComponent,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './realtime.component.html',
  styleUrl: './realtime.component.scss'
})
export class RealtimeComponent implements OnInit {

  public auth = inject(AuthStateService);
  private fb = inject(NonNullableFormBuilder);
  socket = inject(SocketService)
  settings = inject(SharedSetingsService);
  realtimeData$ : Observable<any>;
  displayData = signal<displayRealTimeData>(EMPTY_DATA)
  isSocketConnected = signal(false)

  controls = {
    provider :  this.fb.control(null,Validators.required),
    symvol: this.fb.control(null,{updateOn: 'blur', validators: [Validators.required]}),
    insrument:this.fb.control(null,Validators.required),
  }
  private destroyRef = inject(DestroyRef);
  formGroup = this.fb.group(this.controls);
  instrSourceparams = signal<Record<string,string>| undefined>(undefined)

  ngOnInit(): void {
      this.socket.getConnection().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res=> {
        this.isSocketConnected.set(res === 'connect')
      })

      this.controls.provider.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(value=> {this.displayData.set(EMPTY_DATA);this.setInstumentParametrs(); this.settings.provider = value});

      this.controls.symvol.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(value=> {this.displayData.set(EMPTY_DATA);this.setInstumentParametrs()});

      this.controls.insrument.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(value=>{this.displayData.set(EMPTY_DATA); this.RealTimeData(); this.settings.instrumentId = (value as any)?.id } );

      this.realtimeData$ = this.socket.getMessages()
        .pipe(
              map(event=> {return event?.data ? JSON.parse(event?.data) : {}}),
              filter(message => {
                return !!this.controls.insrument.value && message?.instrumentId === this.controls.insrument?.value['id']
              }));

      this.realtimeData$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: data => {

          if (!!data?.bid) {
            this.displayData.update(current=> {return {...current, date: data.bid.timestamp, bid: data.bid.price}})
          }

          if (!!data?.ask) {
            this.displayData.update(current=> {return {...current, date: data.ask.timestamp, ask: data.ask.price}})
          }

          if (!!data?.last) {
            this.displayData.update(current=> {return {...current, date: data.last.timestamp, last: data.last.price}})
          }

        }
      }
      )
  }

  setInstumentParametrs() {
    this.controls.insrument.setValue(null);

    this.instrSourceparams.set({
      provider: this.controls.provider.value!,
      symbol: this.controls.symvol.value!
    })

  }

  RealTimeData() {
    const instrument = this.controls.insrument.value;
    if(!instrument) {
      return;
    }

    const custed = (instrument! as Record<string,any>);

    const message =   {
          "type": "l1-subscription",
          "id": "1",
          "instrumentId": custed['id'],
          "provider": "simulation",
          "subscribe": true,
          "kinds": [
            "ask","bid","last"
          ]
        }

    this.socket.sendMessage(JSON.stringify(message));
  }

}
