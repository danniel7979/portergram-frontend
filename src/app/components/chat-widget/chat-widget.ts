import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { FollowService } from '../../services/follow.service';
import { SocketService } from '../../services/socket';
import { NotificationSoundService } from '../../services/notification-sound';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css'
})
export class ChatWidget {
  public open = false;

  public identity: any;
  public token: string | null = null;
  public url = 'http://localhost:3800/api/';

  public users: any[] = [];
  public selectedUser: any = null;
  public messages: any[] = [];

  public newMessage = '';
  public onlineUsers: string[] = [];

  public showNotification = false;
  public notificationText = '';
  public unreadByUser: any = {};

  get totalUnread(): number {
    return Object.values(this.unreadByUser)
      .reduce((total: number, value: any) => total + Number(value), 0);
  }

  constructor(
    private messageService: MessageService,
    private followService: FollowService,
    private socketService: SocketService,
    private notificationSound: NotificationSoundService
  ) {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');

      const identity = localStorage.getItem('identity');

      if (identity) {
        this.identity = JSON.parse(identity);
      }

      if (this.identity?._id) {
        this.socketService.userOnline(this.identity._id);
      }

      window.addEventListener('open-private-chat', (event: any) => {
        this.open = true;
        this.openChat(event.detail);
      });

      this.socketService.listenOnlineUsers((users: string[]) => {
        this.onlineUsers = users;

        this.users = this.users.map(user => ({
          ...user,
          online: this.onlineUsers.includes(user._id)
        }));
      });

      this.socketService.listenBuzz((data: any) => {
        document.body.classList.remove('screen-shake');
        void document.body.offsetWidth;
        document.body.classList.add('screen-shake');

        setTimeout(() => {
          document.body.classList.remove('screen-shake');
        }, 700);

        if (
          this.selectedUser &&
          data.emitter === this.selectedUser._id
        ) {
          this.messages.unshift({
            type: 'buzz',
            text: `${this.selectedUser.name} te acaba de enviar un zumbido ⚡`,
            created_at: Math.floor(Date.now() / 1000)
          });
        }
      });

      this.socketService.listenOnlineUsers((users: string[]) => {
        console.log('ONLINE USERS SOCKET:', users);

        this.onlineUsers = users.map((id: any) => id.toString());

        this.users = this.users.map(user => ({
          ...user,
          online: this.onlineUsers.includes(user._id?.toString())
        }));

        console.log(
          'USERS ONLINE TRUE:',
          this.users.filter((u: any) => u.online)
        );
      });

      this.socketService.listenNewMessage((message: any) => {
        const emitterId =
          typeof message.emitter === 'object'
            ? message.emitter._id
            : message.emitter;

        const receiverId =
          typeof message.receiver === 'object'
            ? message.receiver._id
            : message.receiver;

        const isIncoming =
          receiverId === this.identity?._id &&
          emitterId !== this.identity?._id;

        const isCurrentChatOpen =
          this.open &&
          this.selectedUser &&
          emitterId === this.selectedUser._id;

        if (isCurrentChatOpen) {
          this.loadConversation(this.selectedUser._id);
          return;
        }

        if (isIncoming) {
          this.unreadByUser[emitterId] =
            (this.unreadByUser[emitterId] || 0) + 1;

          this.notificationSound.play('message');

          if (!this.open) {
            this.notificationText = 'Nuevo mensaje recibido 💬';
            this.showNotification = true;

            setTimeout(() => {
              this.showNotification = false;
            }, 3000);
          }
        }
      });

      if (this.token) {
        this.loadUsers();
      }
    }
  }

  loadUsers() {
    if (!this.token) return;

    this.followService.getFollowingUsers(this.token).subscribe({
      next: (res: any) => {
        console.log('SEGUIDOS CHAT:', res);

        this.users = (res.follows || []).map((follow: any) => ({
          ...follow.followed,
          online: this.onlineUsers.includes(follow.followed._id?.toString())
        }));

        console.log('USUARIOS CHAT:', this.users);
        console.log('ONLINE:', this.onlineUsers);

      },
      error: err => {
        console.log('ERROR SEGUIDOS CHAT:', err);
        this.users = [];
      }
    });
  }

  openChat(user: any) {
    this.selectedUser = user;

    this.unreadByUser[user._id] = 0;
    this.showNotification = false;

    this.loadConversation(user._id);
  }

  backToUsers() {
    this.selectedUser = null;
    this.messages = [];
  }

  loadConversation(userId: string) {
    if (!this.token) return;

    this.messageService.getConversation(this.token, userId).subscribe({
      next: (res: any) => {
        this.messages = (res.messages || []).sort(
          (a: any, b: any) => b.created_at - a.created_at
        );
      },
      error: err => console.log(err)
    });
  }

  sendMessage() {
    if (!this.token || !this.selectedUser || !this.newMessage.trim()) return;

    this.messageService
      .sendMessage(this.token, this.selectedUser._id, this.newMessage.trim())
      .subscribe({
        next: (res: any) => {
          this.newMessage = '';

          this.socketService.sendPrivateMessage(res.message);

          this.loadConversation(this.selectedUser._id);
        },
        error: err => console.log(err)
      });
  }

  sendBuzz() {
    if (!this.selectedUser || !this.identity) return;

    this.socketService.sendBuzz({
      emitter: this.identity._id,
      receiver: this.selectedUser._id
    });
  }

  isMine(message: any): boolean {
    return (
      message.type !== 'buzz' &&
      (
        message.emitter?._id === this.identity?._id ||
        message.emitter === this.identity?._id
      )
    );
  }

  toggleChat() {
    this.open = !this.open;

    if (this.open) {
      this.showNotification = false;
    }
  }
}