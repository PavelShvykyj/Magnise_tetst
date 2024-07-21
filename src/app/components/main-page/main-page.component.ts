import { Component, HostListener } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { RealtimeComponent } from '../realtime/realtime.component';
import { CountBackComponent } from '../count-back/count-back.component';
import { PriceHistoryComponent } from '../price-history/price-history.component';
import { DateBackComponent } from '../date-back/date-back.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [MatGridListModule,RealtimeComponent,CountBackComponent,PriceHistoryComponent,DateBackComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

  headerHeght = 104;
  tileHeght = window.innerHeight - this.headerHeght - 16;

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.tileHeght = window.innerHeight - this.headerHeght - 16;
  }

}
