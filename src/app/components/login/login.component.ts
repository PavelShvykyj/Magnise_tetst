import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoaderComponent } from '../../core/UI/loader/loader.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthStateService } from '../../services/auth-state.service';
import { FetchService } from '../../services/fetch.service';
import { take } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LoaderComponent,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public auth = inject(AuthStateService);
  private fb = inject(NonNullableFormBuilder);
  fetch = inject(FetchService);
  socket = inject(SocketService);
  router: Router = inject(Router);
  snackBar = inject(MatSnackBar);
  controls = {
    login: this.fb.control('', Validators.required),
    password: this.fb.control('', Validators.required),
  };
  private destroyRef = inject(DestroyRef);
  formGroup = this.fb.group(this.controls);
  isLoading = signal(false);

  Submit() {
    if (this.formGroup.invalid) {
      return;
    }

    this.isLoading.set(true);
    const custed = {
      login: this.controls.login.value!,
      password: this.controls.password.value!,
    };

    this.fetch
      .Refresh(custed)
      .pipe(take(1))
      .subscribe({
        next: (token) => {
          this.isLoading.set(false);
          this.auth.token = token as string;
          this.socket.connect();
          this.router.navigate(['/main'])
        },
        complete: () => {
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.snackBar.open('Something goes wrong', 'close', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
            duration: 1500
          })
        },
      });
  }
}
