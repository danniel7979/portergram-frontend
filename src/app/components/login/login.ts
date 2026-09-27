import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { isPrivatePreview } from '../../services/private-preview-api.interceptor';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  public readonly privatePreview = isPrivatePreview();
  public user = {
    email: '',
    password: '',
    gettoken: false
  };

  public status = '';
  public mode: 'login' | 'register' | 'recovery' = 'login';

  public registerUser = {
    name: '',
    surname: '',
    nick: '',
    email: '',
    password: ''
  };
  public recoveryEmail = '';
  public recoveryLink = '';

  constructor(private userService: UserService,
    private router: Router
  ) { }

  enterPrivatePreview() {
    this.user.email = 'daniel@portergram.local';
    this.user.password = 'private-preview';
    this.onSubmit();
  }

  onSubmit() {
    this.userService.login(this.user).subscribe({
      next: (response) => {
        console.log(response);

        if (response.user) {
          this.user.gettoken = true;

          this.userService.login(this.user).subscribe({
            next: (responseToken) => {
              console.log(responseToken);

              if (responseToken.token) {
                localStorage.setItem('token', responseToken.token);
                localStorage.setItem('identity', JSON.stringify(response.user));
                localStorage.setItem('theme', response.user.theme || 'neon');

                localStorage.setItem(
                  'globalBackground',
                  response.user.globalBackground || ''
                );

                localStorage.setItem(
                  'navBackground',
                  response.user.navBackground || ''
                );

                document.documentElement.style.setProperty(
                  '--scroll-color',
                  response.user.scrollColor || '#00f7ff'
                );
                this.status = 'success';
                this.router.navigate(['/home']);
              } else {
                this.status = 'error';
              }
            },
            error: () => {
              this.status = 'error';
            }
          });

        } else {
          this.status = 'error';
        }
      },
      error: () => {
        this.status = 'error';
      }
    });
  }

  toggleMode() {
    this.status = '';
    this.mode = this.mode === 'login' ? 'register' : 'login';
  }

  onRegister() {
    this.userService.register(this.registerUser).subscribe({
      next: (res: any) => {
        if (res.user) {
          this.status = 'success';
          this.mode = 'login';
        } else {
          this.status = 'error';
        }
      },
      error: err => {
        console.log(err);
        this.status = 'error';
      }
    });
  }

  showRecovery() {
    this.status = '';
    this.mode = 'recovery' as any;
  }

  onForgotPassword() {
    this.userService.forgotPassword(this.recoveryEmail).subscribe({
      next: (res: any) => {
        console.log('RESET RESPONSE:', res);

        this.status = 'success';
        this.recoveryLink = res.resetLink || '';
      },
      error: (err: any) => {
        console.log(err);
        this.status = 'error';
      }
    });
  }

}
