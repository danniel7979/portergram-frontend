import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
    selector: 'app-messages',
    standalone: true,
    imports: [CommonModule, FormsModule, NgClass, RouterLink],
    templateUrl: './messages.html',
    styleUrl: './messages.css'
})
export class Messages {
    public identity: any;
    public token: string | null = null;
    public url = 'http://localhost:3800/api/';

    public users: any[] = [];
    public selectedUser: any = null;
    public messages: any[] = [];

    public newMessage = '';

    public theme = 'neon';
    public globalBackground = '';
    public allUsers: any[] = [];
    public followingUsers: any[] = [];
    public followersUsers: any[] = [];

    constructor(
        private messageService: MessageService,
        private userService: UserService,
        private followService: FollowService,
        private route: ActivatedRoute
    ) {

        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');

            const identity = localStorage.getItem('identity');
            if (identity) this.identity = JSON.parse(identity);

            this.theme = localStorage.getItem('theme') || 'neon';
            this.globalBackground = localStorage.getItem('globalBackground') || '';
        }

        this.loadUsers();
        this.loadFollowing();
        this.loadFollowers();
    }

    loadUsers() {
  if (!this.token) return;

  this.userService.getUsers(this.token, 1).subscribe({
    next: (res: any) => {

      this.users = res.users || [];

      this.route.queryParams.subscribe(params => {

        const userId = params['user'];

        if (userId) {

          const user = this.users.find(
            (u: any) => u._id === userId
          );

          if (user) {
            this.openChat(user);
          }

        }

      });

    },
    error: err => console.log(err)
  });
}

loadFollowing() {
  this.followService.getFollowingUsers(this.token!).subscribe({
    next: (res: any) => {
      console.log('FOLLOWING:', res);

      this.followingUsers = (res.follows || []).map(
        (follow: any) => follow.followed
      );
    },
    error: err => console.log('ERROR FOLLOWING:', err)
  });
}

loadFollowers() {
  this.followService.getFollowers(this.token!).subscribe({
    next: (res: any) => {
      console.log('FOLLOWERS:', res);

      this.followersUsers = (res.follows || []).map(
        (follow: any) => follow.user
      );
    },
    error: err => console.log('ERROR FOLLOWERS:', err)
  });
}

    openChat(user: any) {
        this.selectedUser = user;
        this.loadConversation(user._id);
    }

    loadConversation(userId: string) {
        if (!this.token) return;


        this.messageService.getConversation(this.token, userId).subscribe({
            next: (res: any) => {
                this.messages = (res.messages || []).sort(
                    (a: any, b: any) =>
                        b.created_at - a.created_at
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
                next: () => {
                    this.newMessage = '';
                    this.loadConversation(this.selectedUser._id);
                },
                error: err => console.log(err)
            });
    }

    isMine(message: any): boolean {
        return message.emitter?._id === this.identity?._id || message.emitter === this.identity?._id;
    }
}
