import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {
  public token = '';
  public password = '';
  public repeatPassword = '';
  public status = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    this.token = this.route.snapshot.params['token'];
  }

  resetPassword() {
    if (!this.password || this.password !== this.repeatPassword) {
      this.status = 'error';
      return;
    }

    this.userService.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.status = 'success';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: err => {
        console.log(err);
        this.status = 'error';
      }
    });
  }
}
