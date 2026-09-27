import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatWidget } from './components/chat-widget/chat-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ChatWidget],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('inst-angular5');

  get isLogged(): boolean {
    if (typeof window === 'undefined') return false;

    return !!localStorage.getItem('token');
  }

  get showChatWidget(): boolean {
    if (!this.isLogged || typeof window === 'undefined') return false;

    return !window.location.pathname.startsWith('/messages');
  }
}
