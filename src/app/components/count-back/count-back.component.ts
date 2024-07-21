import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedSetingsService } from '../../services/shared-setings.service';
import { FetchService } from '../../services/fetch.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, take, takeUntil } from 'rxjs';
import { LoaderComponent } from '../../core/UI/loader/loader.component';
import { JsonPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import moment from 'moment';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface CountDataInput {
  t: string,
  o: string,
  h: string,
  l: string,
  c: string,
}

export interface DataSet {
  label: string,
  backgroundColor: string,
  data: Array<number>
}

@Component({
  selector: 'app-count-back',
  standalone: true,
  imports: [LoaderComponent,
    JsonPipe,
    BaseChartDirective,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './count-back.component.html',
  styleUrl: './count-back.component.scss'
})
export class CountBackComponent implements OnInit {
  fb = inject(FormBuilder);
  settings = inject(SharedSetingsService);
  fetch = inject(FetchService);
  destroyRef = inject(DestroyRef);
  cancelation = new Subject();

  displayData : ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  public chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
  };

  isLoading = signal(false);
  controls = {
    instrumentId: this.fb.control('', Validators.required),
    provider: this.fb.control('', Validators.required),
    interval: this.fb.control(1, Validators.required),
    periodicity: this.fb.control('minute', Validators.required),
    barsCount: this.fb.control(20, [Validators.required, Validators.max(50)]),
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
    this.cancelation.next(true);
    if (this.formGroup.invalid) {
      this.displayData  = {
        labels: [],
        datasets: []
      };
      return
    }

    const sourceURL = '/api/bars/v1/bars/count-back';
    const custed = {
      instrumentId: this.controls.instrumentId.value!.toString(),
      provider: this.controls.provider.value!.toString(),
      interval: this.controls.interval.value!.toString(),
      periodicity: this.controls.periodicity.value!.toString(),
      barsCount: this.controls.barsCount.value!.toString(),
    }

    this.isLoading.set(true);
    this.fetch.getList(sourceURL,custed).pipe(take(1),takeUntil(this.cancelation)).subscribe({
      next: res=> {this.isLoading.set(false); this.MapDataToDisplayData(res)},
      error: err=> {this.isLoading.set(false); this.displayData.labels = []; this.displayData.datasets = []},
      complete: ()=> {this.isLoading.set(false)}
    })
  }

  MapDataToDisplayData(inputData: Array<CountDataInput>) {
    const outputdata : ChartConfiguration<'bar'>['data'] = {
      labels: [],
      datasets: []
    };

    const o: DataSet = {
      label: 'o',
      backgroundColor: '#e6e9fa',
      data: []
    };

    const h: DataSet = {
      label: 'h',
      backgroundColor: '#c1c7f3',
      data: []
    };

    const l: DataSet = {
      label: 'l',
      backgroundColor: '#96a3ea',
      data: []
    };

    const c: DataSet = {
      label: 'c',
      backgroundColor: '#677fe3',
      data: []
    };

    inputData.forEach(el => {
      outputdata.labels?.push(moment(el.t).format('mm'));
      o.data.push(parseFloat(el.o));
      h.data.push(parseFloat(el.h));
      c.data.push(parseFloat(el.c));
      l.data.push(parseFloat(el.l));
    })

    o.label = o.label.concat(' ').concat(o.data[0].toString());
    h.label = h.label.concat(' ').concat(h.data[0].toString());
    c.label = c.label.concat(' ').concat(c.data[0].toString());
    l.label = l.label.concat(' ').concat(l.data[0].toString());

    o.data = this.Normalize(o);
    h.data = this.Normalize(h);
    c.data = this.Normalize(c);
    l.data = this.Normalize(l);

    outputdata.datasets.push(o);
    outputdata.datasets.push(h);
    outputdata.datasets.push(l);
    outputdata.datasets.push(c);
    this.displayData = {...outputdata};
  }

  Normalize(res : {data: Array<number>}) {
    const first = res.data[0];
    res.data.splice(0,1);
    return res.data.map(el => el-first);
  }
}
