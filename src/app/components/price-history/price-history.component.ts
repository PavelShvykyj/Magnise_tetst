import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { LoaderComponent } from '../../core/UI/loader/loader.component';
import { JsonPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { FetchService } from '../../services/fetch.service';
import { SharedSetingsService } from '../../services/shared-setings.service';
import moment from 'moment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CountDataInput, DataSet } from '../count-back/count-back.component';
import { take } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export interface DataSetLinear extends DataSet {
  fill: boolean,
  tension: number,
  borderColor: string,
}

export function beforeToday(control: AbstractControl): ValidationErrors | null {
  const today = moment(new Date()).startOf("days").toDate();
  const isError = (control.value > today);
  const err: ValidationErrors = {afterToday: true }
  if (isError) {
    return err;
  }
  return null;

}

@Component({
  selector: 'app-price-history',
  standalone: true,
  imports: [LoaderComponent,
    JsonPipe,
    ReactiveFormsModule,
    BaseChartDirective,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule
      ],
  templateUrl: './price-history.component.html',
  styleUrl: './price-history.component.scss'
})
export class PriceHistoryComponent implements OnInit {
  fb = inject(FormBuilder);
  settings = inject(SharedSetingsService);
  fetch = inject(FetchService);
  destroyRef = inject(DestroyRef);

  displayData : ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  public chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: false,
  };

  today = moment(new Date()).startOf("days").toDate();
  dateRangeFilter = (d: Date): boolean => {
    return d <= this.today;
  }


  isLoading = signal(false);
  controls = {
    instrumentId: this.fb.control('', Validators.required),
    provider: this.fb.control('', Validators.required),
    interval: this.fb.control(1, Validators.required),
    periodicity: this.fb.control('minute', Validators.required),
    startDate: this.fb.control(moment(new Date()).subtract(2,'d').startOf("days").toDate(), Validators.required),
    endDate: this.fb.control(moment(new Date()).subtract(1,'d').startOf("days").toDate(), [Validators.required, beforeToday]),

  }

  formGroup = this.fb.group(this.controls);

  ngOnInit(): void {
    this.settings.instrumentId
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((value)=> {
      this.controls.instrumentId.setValue(value);
    })

    this.settings.provider
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((value)=> {
      this.controls.provider.setValue(value);
    })


    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(()=> {
        this.Refresh()
      })

  }

  Refresh() {
    if (this.formGroup.invalid) {
      // set empty data
      return
    }
    const sourceURL = '/api/bars/v1/bars/date-range';
    const custed = {
      instrumentId: this.controls.instrumentId.value!.toString(),
      provider: this.controls.provider.value!.toString(),
      interval: this.controls.interval.value!.toString(),
      periodicity: this.controls.periodicity.value!.toString(),
      startDate: moment(this.controls.startDate.value).format('YYYY-MM-DD') ,
      endDate: moment(this.controls.endDate.value).format('YYYY-MM-DD')


    }

    this.isLoading.set(true);
    this.fetch.getList(sourceURL,custed).pipe(take(1)).subscribe({
      next: res=> {this.isLoading.set(false); this.MapDataToDisplayData(res)},
      error: err=> {this.isLoading.set(false); this.displayData.labels = []; this.displayData.datasets = []},
    })

  }

  MapDataToDisplayData(inputData: Array<CountDataInput>) {
    const outputdata : ChartConfiguration<'line'>['data'] = {
      labels: [],
      datasets: []
    };



    const c: DataSetLinear = {
      label: 'close',
      backgroundColor: '#e6e9fa',
      fill: true,
      tension: 0.5,
      borderColor: '#3d62dd',
      data: []
    };

    inputData.forEach(el => {
      outputdata.labels?.push(moment(el.t).format('dd hh:mm'));

      c.data.push(parseFloat(el.c));

    });

    outputdata.datasets.push(c);
    this.displayData = {...outputdata};
  }
}
