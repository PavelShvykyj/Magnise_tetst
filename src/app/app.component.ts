import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStateService } from './services/auth-state.service';
import { FetchService } from './services/fetch.service';
import { SocketService } from './services/socket.service';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {




  ngOnInit(): void {
  }

}
