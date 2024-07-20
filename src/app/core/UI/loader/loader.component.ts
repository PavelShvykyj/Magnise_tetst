import { style } from '@angular/animations';
import { Component, HostBinding, input } from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  @HostBinding('style.height')
  height = input<number>(35);
  titlle = input<string>('Data is loading...');

}
