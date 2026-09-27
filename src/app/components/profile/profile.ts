import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PublicationService } from '../../services/publication.service';
import { FollowService } from '../../services/follow.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { HostListener } from '@angular/core';
import { StoryService } from '../../services/story.service';
import { Router } from '@angular/router';
import { MyWorldService } from '../../services/my-world.service';
import {
  GardenWorld
} from '../my-world/garden-world/garden-world';

import {
  StadiumWorld
} from '../my-world/stadium-world/stadium-world';

import {
  SpaceBaseWorld
} from '../my-world/space-base-world/space-base-world';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, NgClass, RouterModule, FormsModule, GardenWorld,
    StadiumWorld,
    SpaceBaseWorld],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  public user: any;
  public publications: any[] = [];
  public url = 'http://localhost:3800/api/';
  public token: string | null = null;
  public identity: any = null;
  public following = false;
  public followedBy = false;
  public selectedPost: any = null;
  public selectedIndex: number = -1;
  public likeAnimationPostId: string | null = null;
  public heartOverlayPostId: string | null = null;
  public theme = 'neon';
  public globalBackground = '';
  public privateProfile = false;
  public openLikesPostId: string | null = null;
  public openDislikesPostId: string | null = null;
  public stories: any[] = [];
  public selectedStory: any = null;
  public selectedStoryIndex = 0;
  public selectedStoryUserId: string | null = null;
  public showStoryForm = false;
  public profileWorld: any = null;
  public profileWorldLoading: boolean = false;
  public profileWorldError: string = '';

  @HostListener('document:click')
  closeReactionDropdowns(): void {
    this.openLikesPostId = null;
    this.openDislikesPostId = null;
  }

  isOwnPublication(pub: any): boolean {
    const publicationUserId =
      pub?.user?._id || pub?.user;

    return String(publicationUserId) ===
      String(this.identity?._id);
  }

  hasShared(pub: any): boolean {
    if (!this.identity?._id) {
      return false;
    }

    if (typeof pub?.sharedByMe === 'boolean') {
      return pub.sharedByMe;
    }

    return Array.isArray(pub?.shares) &&
      pub.shares.some((share: any) => {
        const shareUserId =
          share?.user?._id ||
          share?.user;

        return String(shareUserId) ===
          String(this.identity._id);
      });
  }

  getSharesCount(pub: any): number {
    if (
      typeof pub?.sharesCount ===
      'number'
    ) {
      return pub.sharesCount;
    }

    return Array.isArray(pub?.shares)
      ? pub.shares.length
      : 0;
  }

  sharePublication(pub: any): void {
    if (
      !this.token ||
      !pub?._id ||
      this.isOwnPublication(pub) ||
      pub.shareLoading
    ) {
      return;
    }

    pub.shareLoading = true;
    pub.shareMessage = '';

    this.publicationService
      .toggleSharePublication(
        this.token,
        pub._id
      )
      .subscribe({
        next: (response: any) => {
          pub.shares =
            response.shares || [];

          pub.sharesCount =
            response.sharesCount || 0;

          pub.sharedByMe =
            response.shared === true;

          pub.shareMessage =
            response.message;

          pub.shareLoading = false;

          const viewingOwnProfile =
            String(this.user?._id) ===
            String(this.identity?._id);

          if (
            viewingOwnProfile &&
            pub.isShared &&
            !response.shared
          ) {
            this.publications =
              this.publications.filter(
                publication =>
                  publication._id !== pub._id
              );

            if (
              this.selectedPost?._id ===
              pub._id
            ) {
              this.closePost();
            }

            return;
          }

          setTimeout(() => {
            pub.shareMessage = '';
          }, 2500);
        },

        error: (error: any) => {
          pub.shareLoading = false;

          pub.shareMessage =
            error?.error?.message ||
            'No se pudo compartir la publicación';

          setTimeout(() => {
            pub.shareMessage = '';
          }, 3000);
        }
      });
  }

  likePublication(pub: any) {
    if (!this.token) return;

    this.openLikesPostId = null;
    this.openDislikesPostId = null;

    this.publicationService.likePublication(this.token!, pub._id)
      .subscribe({
        next: (response: any) => {
          pub.likes = response.publication.likes;
          pub.dislikes = response.publication.dislikes;

          this.likeAnimationPostId = pub._id;

          setTimeout(() => {
            if (this.likeAnimationPostId === pub._id) {
              this.likeAnimationPostId = null;
            }
          }, 900);

          if (this.selectedPost?._id === pub._id) {
            this.selectedPost.likes = response.publication.likes;
            this.selectedPost.dislikes = response.publication.dislikes;
          }
        },
        error: (err) => console.log(err)
      });
  }

  dislikePublication(pub: any) {
    if (!this.token) return;

    this.openLikesPostId = null;
    this.openDislikesPostId = null;

    this.publicationService.dislikePublication(this.token!, pub._id)
      .subscribe({
        next: (response: any) => {
          pub.dislikes = response.publication.dislikes;
          pub.likes = response.publication.likes;

          this.likeAnimationPostId = pub._id;

          setTimeout(() => {
            if (this.likeAnimationPostId === pub._id) {
              this.likeAnimationPostId = null;
            }
          }, 900);

          if (this.selectedPost?._id === pub._id) {
            this.selectedPost.dislikes = response.publication.dislikes;
            this.selectedPost.likes = response.publication.likes;
          }
        },
        error: (err) => console.log(err)
      });
  }

  hasDisliked(pub: any): boolean {
    return pub.dislikes?.some((user: any) =>
      user._id === this.identity?._id || user === this.identity?._id
    );
  }

  hasLiked(pub: any): boolean {
    if (!pub?.likes || !this.identity?._id) return false;

    return pub.likes.some((like: any) => {
      if (typeof like === 'object') {
        return like._id == this.identity._id;
      }
      return like == this.identity._id;
    });
  }

  toggleLikes(postId: string): void {
    this.openLikesPostId = this.openLikesPostId === postId ? null : postId;
    this.openDislikesPostId = null;
  }

  toggleDislikes(postId: string): void {
    console.log('DISLIKES', postId);
    this.openDislikesPostId = this.openDislikesPostId === postId ? null : postId;
    this.openLikesPostId = null;
  }

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private publicationService: PublicationService,
    private followService: FollowService,
    private storyService: StoryService,
    private myWorldService: MyWorldService,
    private router: Router
  ) {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      const identity = localStorage.getItem('identity');

      if (identity) {
        this.identity = JSON.parse(identity);
      }

      this.theme =
        localStorage.getItem('theme') || 'neon';

      this.globalBackground =
        localStorage.getItem('globalBackground') || '';
    }

    this.selectedStory = null;
    this.selectedStoryUserId = null;
    this.selectedStoryIndex = 0;

    this.loadUser();
    this.loadStories();

  }

  loadUser() {
    if (!this.token) return;

    this.route.params.subscribe(params => {
      const id = params['id'];

      this.userService.getUser(id, this.token!)
        .subscribe({
          next: (response: any) => {
            this.privateProfile = false;
            this.user = response.user;

            // Cargar el mundo del usuario cuyo perfil estamos viendo
            this.loadProfileWorld(id);

            this.loadFollowStatus(id);
            this.loadPublications(id);
          },
          error: (err) => {
            if (err.status === 403 && err.error?.privateProfile) {
              this.privateProfile = true;
              this.user = null;
              this.publications = [];

              // Por seguridad, vaciamos también el mundo
              this.profileWorld = null;
            }
          }
        });
    });
  }

  loadPublications(userId: string) {

    console.log('Entrando en loadPublications', userId);

    this.publicationService
      .getUserPublications(this.token!, userId)
      .subscribe((response: any) => {

        console.log("RESPUESTA COMPLETA:", response);

        this.publications = response.publications
          .map((pub: any) => {

            pub.comments = (pub.comments || []).sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );

            pub.comments.forEach((comment: any) => {
              comment.replies = (comment.replies || []).sort(
                (a: any, b: any) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              );
            });

            return pub;
          })
          .sort(
            (a: any, b: any) =>
              new Date(
                b.profileDate ||
                b.sharedAt ||
                b.created_at
              ).getTime() -
              new Date(
                a.profileDate ||
                a.sharedAt ||
                a.created_at
              ).getTime()
          );

        console.log(
          'PUBLICACIONES DEL PERFIL:',
          this.publications
        );

        console.log(
          'PRIMERA PUBLICACIÓN:',
          this.publications?.[0]
        );
      });
  }

  followUser() {
    if (!this.token || !this.user) return;

    this.followService.follow(this.token, this.user._id).subscribe({
      next: () => {
        this.following = true;
        this.loadFollowStatus(this.user._id);
      },
      error: (err) => console.log(err)
    });
  }

  unfollowUser() {
    if (!this.token || !this.user) return;

    this.followService.unfollow(this.token, this.user._id).subscribe({
      next: () => {
        this.following = false;
        this.loadFollowStatus(this.user._id);
      },
      error: (err) => console.log(err)
    });
  }

  openPost(pub: any, index: number) {

    if (pub.comments) {

      pub.comments = pub.comments.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }

    this.selectedPost = pub;
    this.selectedIndex = index;

    if (this.selectedPost.comments) {

      this.selectedPost.comments =
        this.selectedPost.comments.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
    }
  }

  closePost() {
    this.selectedPost = null;
    this.selectedIndex = -1;
  }

  prevPost() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.selectedPost = this.publications[this.selectedIndex];
    }
  }

  nextPost() {
    if (this.selectedIndex < this.publications.length - 1) {
      this.selectedIndex++;
      this.selectedPost = this.publications[this.selectedIndex];
    }
  }

  addComment(pub: any) {
    if (!this.token || !pub?.newComment?.trim()) return;

    this.publicationService.addCommentProfile(this.token!, pub._id, pub.newComment)
      .subscribe({
        next: (response: any) => {
          const updated = response.publication.comments || [];

          // actualizar SOLO comentarios
          pub.comments = updated;
          pub.newComment = '';

          // sincronizar con el array principal
          const original = this.publications.find(p => p._id === pub._id);
          if (original) {
            original.comments = updated;
          }

          // sincronizar modal
          if (this.selectedPost?._id === pub._id) {
            this.selectedPost.comments = updated;
            this.selectedPost.newComment = '';
          }
        },
        error: (err) => console.log(err)
      });
  }

  deleteComment(pub: any, commentId: string) {
    if (!this.token) return;

    this.publicationService.deleteCommentProfile(
      this.token,
      pub._id,
      commentId
    ).subscribe({
      next: (response: any) => {
        pub.comments = response.publication.comments;

        if (this.selectedPost?._id === pub._id) {
          this.selectedPost.comments = response.publication.comments;
        }
      },
      error: (err) => console.log(err)
    });
  }

  isVideo(file: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(file);
  }

  loadFollowStatus(id: string) {
    if (!this.token) return;

    this.followService.isFollowing(this.token, id)
      .subscribe((res: any) => {
        this.following = res.following === true;
      });

    this.followService.isFollowedBy(this.token, id)
      .subscribe((res: any) => {
        this.followedBy = res.followedBy === true;
      });
  }

  deletePublication(publicationId: string) {

    if (!this.token) return;

    this.publicationService.deletePublication(
      this.token,
      publicationId
    ).subscribe({

      next: () => {

        this.publications =
          this.publications.filter(
            pub => pub._id !== publicationId
          );

        if (this.selectedPost?._id === publicationId) {
          this.closePost();
        }

      },

      error: err => console.log(err)

    });
  }

  replyComment(pub: any, comment: any) {
    if (!this.token || !comment.replyText?.trim()) return;

    this.publicationService.replyCommentProfile(
      this.token,
      pub._id,
      comment._id,
      comment.replyText
    ).subscribe({
      next: (response: any) => {
        comment.replies = comment.replies || [];
        comment.replies.push(response.reply);

        comment.replyText = '';
        comment.showReply = false;
      },
      error: err => console.log(err)
    });
  }

  likeComment(pub: any, comment: any) {
    if (!this.token) return;

    this.publicationService.likeCommentProfile(
      this.token,
      pub._id,
      comment._id
    ).subscribe({
      next: (response: any) => {
        const updatedComment = response.publication.comments.find(
          (c: any) => c._id === comment._id
        );

        if (updatedComment) {
          comment.likes = updatedComment.likes;
          comment.dislikes = updatedComment.dislikes;
        }
      },
      error: err => console.log(err)
    });
  }

  dislikeComment(pub: any, comment: any) {
    if (!this.token) return;

    this.publicationService.dislikeCommentProfile(
      this.token,
      pub._id,
      comment._id
    ).subscribe({
      next: (response: any) => {
        const updatedComment = response.publication.comments.find(
          (c: any) => c._id === comment._id
        );

        if (updatedComment) {
          comment.likes = updatedComment.likes;
          comment.dislikes = updatedComment.dislikes;
        }
      },
      error: err => console.log(err)
    });
  }

  likeReply(pub: any, comment: any, reply: any) {
    if (!this.token) return;

    this.publicationService.likeReplyProfile(
      this.token,
      pub._id,
      comment._id,
      reply._id
    ).subscribe({
      next: (response: any) => {
        const updatedComment = response.publication.comments.find(
          (c: any) => c._id === comment._id
        );

        const updatedReply = updatedComment?.replies.find(
          (r: any) => r._id === reply._id
        );

        if (updatedReply) {
          reply.likes = updatedReply.likes;
          reply.dislikes = updatedReply.dislikes;
        }
      },
      error: err => console.log(err)
    });
  }

  dislikeReply(pub: any, comment: any, reply: any) {
    if (!this.token) return;

    this.publicationService.dislikeReplyProfile(
      this.token,
      pub._id,
      comment._id,
      reply._id
    ).subscribe({
      next: (response: any) => {
        const updatedComment = response.publication.comments.find(
          (c: any) => c._id === comment._id
        );

        const updatedReply = updatedComment?.replies.find(
          (r: any) => r._id === reply._id
        );

        if (updatedReply) {
          reply.likes = updatedReply.likes;
          reply.dislikes = updatedReply.dislikes;
        }
      },
      error: err => console.log(err)
    });
  }

  hasLikedComment(item: any): boolean {
    if (!item?.likes || !this.identity?._id) return false;

    return item.likes.some((like: any) =>
      String(like?._id || like) === String(this.identity._id)
    );
  }

  hasDislikedComment(item: any): boolean {
    if (!item?.dislikes || !this.identity?._id) return false;

    return item.dislikes.some((dislike: any) =>
      String(dislike?._id || dislike) === String(this.identity._id)
    );
  }

  deleteReply(pub: any, comment: any, reply: any) {
    if (!this.token) return;

    this.publicationService.deleteReplyProfile(
      this.token,
      pub._id,
      comment._id,
      reply._id
    ).subscribe({
      next: (response: any) => {
        const updatedComment = response.publication.comments.find(
          (c: any) => String(c._id) === String(comment._id)
        );

        if (updatedComment) {
          comment.replies = updatedComment.replies;
        }
      },
      error: err => console.log(err)
    });
  }

  loadStories() {
    if (!this.token) return;

    this.storyService.getStories(this.token).subscribe({
      next: (res: any) => {
        this.stories = res.stories || [];
      },
      error: err => console.log(err)
    });
  }

  getUserStory(userId: string) {
    return this.stories.find(
      (story: any) => story.user?._id === userId
    );
  }

  getUserStories(userId: string) {
    return this.stories.filter(
      (story: any) => story.user?._id === userId
    );
  }

  openUserStories(userId: string) {
    console.log('ABRIR HISTORIAS USER:', userId);

    const stories = this.getUserStories(userId);

    console.log('HISTORIAS DEL USER:', stories);

    if (!stories.length) return;

    this.selectedStoryUserId = userId;
    this.selectedStoryIndex = 0;
    this.selectedStory = stories[0];

    console.log('SELECTED STORY:', this.selectedStory);
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

  openNewStoryForm() {

    this.closeStory();
    console.log('REDIRIGIENDO A HOME');
    this.router.navigate(['/home'], {
      queryParams: {
        newStory: '1'
      }

    });

  }

  uploadAvatar(event: Event): void {

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !this.identity || !this.token) {
      return;
    }

    this.userService
      .uploadAvatar(this.token, this.identity._id, file)
      .subscribe({

        next: (response: any) => {

          console.log('Avatar actualizado:', response);

          // Actualizar el usuario logueado
          this.identity.image = response.user.image;

          localStorage.setItem(
            'identity',
            JSON.stringify(this.identity)
          );

          // Si estoy viendo mi propio perfil,
          // actualizar también la imagen de la card
          if (this.user && this.user._id === this.identity._id) {
            this.user.image = response.user.image;
          }

          input.value = '';

        },

        error: (err) => {
          console.error(err);
          input.value = '';
        }

      });

  }

  loadProfileWorld(userId: string): void {

    if (!this.token) {
      return;
    }

    this.profileWorldLoading = true;
    this.profileWorldError = '';

    this.myWorldService
      .getUserAsideWorld(userId, this.token)
      .subscribe({

        next: (response: any) => {

          this.profileWorld =
            response.world || null;

          this.profileWorldLoading = false;

          console.log(
            'MUNDO DEL PERFIL:',
            this.profileWorld
          );
        },

        error: (error: any) => {

          this.profileWorldLoading = false;

          this.profileWorld = null;

          this.profileWorldError =
            error?.error?.message ||
            'No se pudo cargar el mundo del usuario';
        }

      });
  }

  openProfileWorld(): void {

    if (
      !this.user?._id ||
      !this.profileWorld?.worldType
    ) {
      return;
    }

    console.log(
      'ENTRANDO AL MUNDO DEL USUARIO:',
      {
        userId: this.user._id,
        worldType: this.profileWorld.worldType
      }
    );

    this.router.navigate(
      ['/my-world'],
      {
        queryParams: {
          world: this.profileWorld.worldType,
          userId: this.user._id
        }
      }
    );
  }

}
