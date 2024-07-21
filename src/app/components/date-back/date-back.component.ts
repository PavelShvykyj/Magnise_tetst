import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LoaderComponent } from '../../core/UI/loader/loader.component';
import { FetchService } from '../../services/fetch.service';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedSetingsService } from '../../services/shared-setings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, take, takeUntil } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-date-back',
  standalone: true,
  imports: [    MatCardModule,
    MatButtonModule,
    LoaderComponent
  ],
  templateUrl: './date-back.component.html',
  styleUrl: './date-back.component.scss'
})
export class DateBackComponent implements OnInit {
  fetch = inject(FetchService);
  destroyRef = inject(DestroyRef);
  fb = inject(FormBuilder);
  sanitizer = inject(DomSanitizer);
  settings = inject(SharedSetingsService);
  cancelation = new Subject();
  isLoading = signal(false);
  htmlContentUrl : any;
  controls = {
    instrumentId: this.fb.control('', Validators.required),
    provider: this.fb.control('', Validators.required),
    interval: this.fb.control(1, Validators.required),
    periodicity: this.fb.control('minute', Validators.required),
    timeBack: this.fb.control('1.00:00:00', Validators.required)
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
      this.htmlContentUrl = undefined
      return
    }
    const sourceURL = '/api/data-consolidators/bars/v1/bars/time-back';
    const custed = {
      instrumentId: this.controls.instrumentId.value!.toString(),
      provider: this.controls.provider.value!.toString(),
      interval: this.controls.interval.value!.toString(),
      periodicity: this.controls.periodicity.value!.toString(),
      timeBack: this.controls.timeBack.value!.toString(),
    }

    this.isLoading.set(true);
    this.fetch.getData(sourceURL,custed).pipe(take(1),takeUntil(this.cancelation)).subscribe({
      next: res=> {
        this.isLoading.set(false);
        const blob = new Blob([res], { type: 'text/html' });
        this.htmlContentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
      },
      error: err=> {this.isLoading.set(false); this.htmlContentUrl = undefined; console.log('err', err)},
      complete: ()=> {this.isLoading.set(false)}
    })
  }
}
