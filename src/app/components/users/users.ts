import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoryService } from '../../services/story.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, NgClass, RouterLink, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users {
  public users: any[] = [];
  public token: string | null = null;
  public url = 'http://localhost:3800/api/';
  public theme = 'neon';
  public globalBackground = '';
  public allUsers: any[] = [];
  public followingUsers: any[] = [];
  public followersUsers: any[] = [];
  public pageMode: 'summary' | 'following' | 'followers' | 'all' = 'summary';
  public identity: any = null;
  public searchFollowing = '';
  public searchFollowers = '';
  public searchAll = '';
  public stories: any[] = [];
  public selectedStory: any = null;
  public selectedStoryIndex = 0;
  public selectedStoryUserId: string | null = null;

  constructor(private userService: UserService,
    private route: ActivatedRoute,
    private followService: FollowService,
    private storyService: StoryService
  ) {

    const identity = localStorage.getItem('identity');

    if (identity) {
      this.identity = JSON.parse(identity);
    }

    this.route.url.subscribe(url => {
      const path = url.map(segment => segment.path).join('/');

      if (path === 'users/following') this.pageMode = 'following';
      else if (path === 'users/followers') this.pageMode = 'followers';
      else if (path === 'users/all') this.pageMode = 'all';
      else this.pageMode = 'summary';
    });

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      this.theme = localStorage.getItem('theme') || 'neon';
      this.globalBackground = localStorage.getItem('globalBackground') || '';
      this.loadUsers();
      this.loadFollowing();
      this.loadFollowers();
      this.loadStories();
    }
  }

  getUsers() {
    if (!this.token) return;

    this.userService.getUsers(this.token).subscribe((response: any) => {
      this.users = response.users;
    });
  }

  loadUsers() {
    if (!this.token) return;

    this.userService.getUsers(this.token, 1).subscribe({
      next: (res: any) => {
        this.allUsers = res.users || [];
        this.updateUserRelations();
      },
      error: err => console.log(err)
    });
  }

  loadFollowing() {
    if (!this.token) return;

    this.followService.getFollowingUsers(this.token).subscribe({
      next: (res: any) => {
        this.followingUsers = (res.follows || []).map(
          (follow: any) => follow.followed
        );

        this.updateUserRelations();
      },
      error: err => console.log(err)
    });
  }

  loadFollowers() {
    if (!this.token) return;

    this.followService.getFollowers(this.token).subscribe({
      next: (res: any) => {
        this.followersUsers = (res.follows || []).map(
          (follow: any) => follow.user
        );

        this.updateUserRelations();
      },
      error: err => console.log(err)
    });
  }

  openPrivateChat(user: any) {
    localStorage.setItem('openChatUser', JSON.stringify(user));

    window.dispatchEvent(
      new CustomEvent('open-private-chat', {
        detail: user
      })
    );
  }

  followUser(user: any) {
    if (!this.token) return;

    const userId = String(user._id);

    this.followService.follow(this.token, userId).subscribe({
      next: () => {

        this.allUsers = this.allUsers.map((currentUser: any) =>
          String(currentUser._id) === userId
            ? { ...currentUser, following: true }
            : currentUser
        );

        this.followersUsers = this.followersUsers.map((currentUser: any) =>
          String(currentUser._id) === userId
            ? { ...currentUser, following: true }
            : currentUser
        );

        const alreadyExists = this.followingUsers.some(
          (currentUser: any) => String(currentUser._id) === userId
        );

        if (!alreadyExists) {
          this.followingUsers = [
            ...this.followingUsers,
            {
              ...user,
              following: true
            }
          ];
        }
      },
      error: err => console.log(err)
    });
  }

  unfollowUser(user: any) {
    if (!this.token || !user?._id) return;

    const userId = String(user._id);

    this.followService.unfollow(this.token, userId).subscribe({
      next: () => {

        // Solo se elimina de "Usuarios que sigo"
        this.followingUsers = this.followingUsers.filter(
          (currentUser: any) =>
            String(currentUser._id) !== userId
        );

        console.log("ALL USERS:", this.allUsers.length);
        console.log(
          this.allUsers.map(u => ({
            nick: u.nick,
            following: u.following
          }))
        );

        // En "Todos los usuarios" permanece
        const userInAll = this.allUsers.find(
          (currentUser: any) =>
            String(currentUser._id) === userId
        );

        if (userInAll) {
          userInAll.following = false;
        }

        // En "Usuarios que me siguen" también permanece
        const userInFollowers = this.followersUsers.find(
          (currentUser: any) =>
            String(currentUser._id) === userId
        );

        if (userInFollowers) {
          userInFollowers.following = false;
        }

        // Nueva referencia para que Angular actualice la vista
        this.allUsers = [...this.allUsers];
        this.followersUsers = [...this.followersUsers];

        console.log(
          '¿SIGUE EN ALL USERS?',
          this.allUsers.some(
            (currentUser: any) =>
              String(currentUser._id) === userId
          )
        );
      },

      error: err => {
        console.log('ERROR AL DEJAR DE SEGUIR:', err);
      }
    });
  }

  isFollowing(user: any): boolean {
    return user.following === true;
  }

  updateUserRelations() {
    const addRelations = (user: any) => ({
      ...user,

      following: this.followingUsers.some(
        (currentUser: any) =>
          String(currentUser._id) === String(user._id)
      ),

      followedBy: this.followersUsers.some(
        (currentUser: any) =>
          String(currentUser._id) === String(user._id)
      )
    });

    this.allUsers = this.allUsers.map(addRelations);
    this.followingUsers = this.followingUsers.map(addRelations);
    this.followersUsers = this.followersUsers.map(addRelations);
  }

  limitedUsers(users: any[]) {
    return this.pageMode === 'summary'
      ? users.slice(0, 4)
      : users;
  }

  showSection(section: string): boolean {
    return this.pageMode === 'summary' || this.pageMode === section;
  }

  toggleBan(user: any) {

    if (!this.token) return;

    this.userService.toggleBan(
      this.token,
      user._id
    ).subscribe({

      next: (res: any) => {
        user.banned = res.banned;
      },

      error: err => console.log(err)

    });
  }

  filterUsers(users: any[], search: string) {
    if (!search.trim()) return users;

    const term = search.toLowerCase();

    return users.filter((user: any) =>
      user.name?.toLowerCase().includes(term) ||
      user.surname?.toLowerCase().includes(term) ||
      user.nick?.toLowerCase().includes(term)
    );
  }

  loadStories() {
    if (!this.token) return;

    this.storyService.getStories(this.token).subscribe({
      next: (res: any) => {
        this.stories = res.stories || [];

        console.log('HISTORIAS EN USERS:', this.stories);

        this.stories.forEach((story: any) => {
          console.log('STORY USER:', story.user);
          console.log('STORY USER ID:', story.user?._id || story.user?.id || story.user);
        });
      },
      error: err => console.log(err)
    });
  }

  getUserStory(userId: string) {
    return this.stories.find((story: any) => {
      const storyUserId = story.user?._id || story.user?.id || story.user;

      return storyUserId?.toString() === userId?.toString();
    });
  }

  getUserStories(userId: string) {
    return this.stories.filter((story: any) => {
      const storyUserId = story.user?._id || story.user?.id || story.user;

      return storyUserId?.toString() === userId?.toString();
    });
  }

  openUserStories(userId: string) {
    const stories = this.getUserStories(userId);

    if (!stories.length) return;

    this.selectedStoryUserId = userId;
    this.selectedStoryIndex = 0;
    this.selectedStory = stories[0];

    console.log('HISTORIA ABIERTA:', this.selectedStory);
    console.log('MEDIA:', this.selectedStory.media);
  }

  closeStory() {
    this.selectedStory = null;
    this.selectedStoryUserId = null;
    this.selectedStoryIndex = 0;
  }

  nextStory() {
    if (!this.selectedStoryUserId) return;

    const stories = this.getUserStories(this.selectedStoryUserId);
    if (!stories.length) return;

    this.selectedStoryIndex =
      this.selectedStoryIndex + 1 >= stories.length
        ? 0
        : this.selectedStoryIndex + 1;

    this.selectedStory = stories[this.selectedStoryIndex];
  }

  prevStory() {
    if (!this.selectedStoryUserId) return;

    const stories = this.getUserStories(this.selectedStoryUserId);
    if (!stories.length) return;

    this.selectedStoryIndex =
      this.selectedStoryIndex - 1 < 0
        ? stories.length - 1
        : this.selectedStoryIndex - 1;

    this.selectedStory = stories[this.selectedStoryIndex];
  }

  isVideo(file: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(file);
  }

}
