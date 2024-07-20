import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthStateService } from './auth-state.service';

export enum WebSocketStatusEnum {
  CONNECT = "connect",
  DISCONECT = "disconect",
  ERROR = "error",
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  ws: WebSocket;
  auth = inject(AuthStateService);
  connected$: Subject<string> = new Subject<string>()
  messages$: Subject<MessageEvent> = new Subject<MessageEvent>()
  output = '';

  public connect() {
    this.ws = new WebSocket(`${environment.baseSWW}?token=${this.auth.token}`);

    this.ws.onopen = () => {
      console.log("Successfully connected: " + environment.baseSWW)

      this.connected$.next(WebSocketStatusEnum.CONNECT)
      if (this.output) {
        setTimeout(()=> {
          this.ws.send(this.output)
        },1000);


      }
    }


    this.ws.onmessage = (event) => {
      this.messages$.next(event)
    }

    this.ws.onerror = () => {
      this.connected$.next(WebSocketStatusEnum.DISCONECT)
      this.ws.close()
    }

    this.ws.onclose = ()=> {
      this.connected$.next(WebSocketStatusEnum.DISCONECT)
    }

  }

  getMessages() {
    return this.messages$.asObservable()
  }

  getConnection() {
    return this.connected$.asObservable()
  }

  sendMessage(payload: string) {
    this.output = payload;
    this.ws.close();
    setTimeout(()=> this.connect(), 1500);

  }
}


// send {"type":"l1-subscription","id":"1","instrumentId":"5071e03c-80d3-4b28-870d-28533306c8c6","provider":"dxfeed","subscribe":true,"kinds":["forex"]}
// send {"type":"l1-subscription","id":"1","instrumentId":"ad9e5345-4c3b-41fc-9437-1d253f62db52","provider":"simulation","subscribe":true,"kinds":["ask","bid","last"]}
