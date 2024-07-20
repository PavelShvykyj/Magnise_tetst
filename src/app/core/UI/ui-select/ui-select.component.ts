import { take } from 'rxjs';
import { FetchService } from './../../../services/fetch.service';
import { Component, DestroyRef, ElementRef, OnDestroy, OnInit, Signal, computed, effect, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoaderComponent } from '../loader/loader.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FocusMonitor } from '@angular/cdk/a11y';
import { startWith, filter } from 'rxjs';


@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LoaderComponent,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UiSelectComponent,
      multi: true
    }
  ],
  templateUrl: './ui-select.component.html',
  styleUrl: './ui-select.component.scss'
})
export class UiSelectComponent implements ControlValueAccessor, OnInit, OnDestroy {
  source = input.required<string>();
  isLoading = signal<boolean>(false);
  fetch = inject(FetchService);
  data  = [];
  params = input<Record<string,string>>();

  private focusMonitor = inject(FocusMonitor);
  private selfElement = inject(ElementRef);
  private destroyRef = inject(DestroyRef)
  private  fb = inject(NonNullableFormBuilder)

  options : Record<string, any>[] = [];
  labelName = input<string>('');
  keyName = input<string>('');
  tittle = input<string>('');

  onChangeFn = (value:any) => {};
  onBlurFn = () => {};

  valueControl = this.fb.control<any>(null,[Validators.required]);

  constructor() {
    effect(()=> {
      const params = this.params();
      this.Refresh();
    }, {allowSignalWrites: true})
  }

  ngOnInit(): void {
    this.Refresh()
    this.valueControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value=> {
      this.onChangeFn(value);
    })

    this.focusMonitor.monitor(this.selfElement,true).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(origin=>{
      if (!origin) {
        // Element lost focus
        this.onBlurFn();
      }
    })
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.selfElement);
  }

  // from model (from formcontrol for example to view )  our reactions on changing value outside
  writeValue(value: any): void {
    if(!value) {
      this.valueControl.setValue(null, {emitEvent: true});
      return
    }

    if (this.keyName() === '') {
      this.valueControl.setValue(value, {emitEvent: true});
      return
    }

    const options = [...this.options];
    const internalValue = !options ? [] : options.filter((el) => (value as Record<string, any>[]).find((vel)  => vel[this.keyName()] === el[this.keyName()] ))

    this.valueControl.setValue(internalValue.length > 0 ? internalValue[0] : null, {emitEvent: true});
  }

  // function we have to call on our changes
  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  // function we have to call on blur
  registerOnTouched(fn: any): void {
    this.onBlurFn = fn
  }

  // our reactions on changing disable status outside
  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.valueControl.disable()
    } else {
      this.valueControl.enable()
    }
  }

  Refresh() {
    this.valueControl.setValue(null, {emitEvent: true});
    this.data = [];
    this.isLoading.set(true);
    this.fetch.getList(this.source(),this.params())
    .pipe(take(1))
    .subscribe({
      next: data=> {this.options = data; this.isLoading.set(false)},
      error: err=> {this.options = []; console.log('ERROR on getting options'); }
    })
  }
}
