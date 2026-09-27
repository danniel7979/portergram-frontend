import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PublicationService } from '../../services/publication.service';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../services/comment.service';
import { UserService } from '../../services/user.service';
import { HostListener } from '@angular/core';
import { StoryService } from '../../services/story.service';
import { NotificationSoundService } from '../../services/notification-sound';
import { MyWorldService } from '../../services/my-world.service';
import {
  GardenWorld
} from '../my-world/garden-world/garden-world';
import { StadiumWorld } from '../my-world/stadium-world/stadium-world';
import {
  SpaceBaseWorld
} from '../my-world/space-base-world/space-base-world';
import { AVAILABLE_WORLDS } from '../my-world/data/available-worlds';
import { switchMap } from 'rxjs';


type WorldType =
  | 'garden'
  | 'stadium'
  | 'space-base';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgClass, RouterLink, FormsModule, GardenWorld, StadiumWorld, SpaceBaseWorld],
  templateUrl: './home.html',
  styleUrl: './home.css',
})

export class Home {
  public identity: any;
  public token: string | null = null;

  public url = 'http://localhost:3800/api/';
  public publications: any[] = [];
  /*public gardenElements: GardenElement[] = [];*/
  public newPublication: any = {
    text: ''
  };
  public myWorld: any = null;
  public myWorldLoading = false;
  public myWorldError = '';
  public hasWorld = false;
  public selectedWorld: WorldType | null = null;
  public showWorldSelection = false;
  public worldSelectionError = '';

  cameraFacingMode: 'user' | 'environment' = 'environment';
  showCamera: boolean = false;
  cameraStream: MediaStream | null = null;

  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  isRecording: boolean = false;
  availableCameras: MediaDeviceInfo[] = [];
  selectedCameraId: string | null = null;
  storyMediaRecorder: MediaRecorder | null = null;
  storyRecordedChunks: Blob[] = [];
  storyIsRecording: boolean = false;

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

  closeCamera() {

    if (
      this.mediaRecorder &&
      this.isRecording
    ) {

      this.mediaRecorder.stop();

      this.isRecording = false;
    }

    this.stopCameraStream();

    this.showCamera = false;
  }

  private stopCameraStream() {

    if (!this.cameraStream) {
      return;
    }

    this.cameraStream
      .getTracks()
      .forEach(track => {
        track.stop();
      });

    this.cameraStream = null;
  }

  selectedFilesToRemove: Set<number> = new Set();
  toggleFileSelection(index: number): void {

    if (this.selectedFilesToRemove.has(index)) {
      this.selectedFilesToRemove.delete(index);
    } else {
      this.selectedFilesToRemove.add(index);
    }
  }


  removeSelectedFiles(): void {

    if (this.selectedFilesToRemove.size === 0) {
      return;
    }

    this.filesToUploadPub =
      this.filesToUploadPub.filter(
        (_file, index) =>
          !this.selectedFilesToRemove.has(index)
      );

    this.selectedFilesToRemove.clear();

    if (this.filesToUploadPub.length === 0) {

      this.fileName = '';

    } else if (this.filesToUploadPub.length === 1) {

      this.fileName =
        this.filesToUploadPub[0].name;

    } else {

      this.fileName =
        `${this.filesToUploadPub.length} archivos seleccionados`;
    }
  }

  public filesToUploadPub: File[] = [];
  public fileName: string = '';

  public likeAnimationPostId: string | null = null;

  public theme = 'neon';
  public globalBackground = '';
  public navBackground = '';
  public openLikesPostId: string | null = null;
  public openDislikesPostId: string | null = null;
  public showDislikesModal = false;
  public selectedDislikes: any[] = [];
  public storyFile: File | null = null;
  public storyIcon: string = '💥';
  public storyText: string = '';
  public stories: any[] = [];
  public showStoryForm: boolean = false;
  public selectedStory: any = null;
  public selectedStoryIndex: number = 0;
  public selectedStoryUserId: string | null = null;
  public storyDuration = 24;
  public mobileNavOpen = false;

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
    document.body.style.overflow = this.mobileNavOpen ? 'hidden' : '';
  }

  closeMobileNav(): void {
    this.mobileNavOpen = false;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  closeMobileNavWithEscape(): void {
    if (this.mobileNavOpen) this.closeMobileNav();
  }

  @HostListener('window:resize')
  closeMobileNavOnDesktop(): void {
    if (window.innerWidth > 1024 && this.mobileNavOpen) {
      this.closeMobileNav();
    }
  }

  // ==========================
  // CÁMARA PARA HISTORIAS
  // ==========================

  showStoryCamera: boolean = false;

  storyCameraStream: MediaStream | null = null;

  storySelectedCameraId: string | null = null;


  public availableWorlds = [
    {
      id: 'garden' as const,
      name: 'Jardín',
      icon: '🌵',
      description: 'Un jardín que crece con tu actividad.'
    },
    {
      id: 'stadium' as const,
      name: 'Estadio',
      icon: '🏟️',
      description: 'Un estadio que evoluciona con tu actividad.'
    },
    {
      id: 'space-base' as const,
      name: 'Base espacial',
      icon: '🚀',
      description: 'Una base espacial que evoluciona hasta convertirse en una colonia interplanetaria.'
    }
  ];
  private refreshMyWorldAfterActivity(): void {
    setTimeout(() => {
      this.loadMyWorldAside();
    }, 500);
  }

  startStoryVideoRecording(): void {

    if (
      !this.storyCameraStream ||
      this.storyIsRecording
    ) {
      return;
    }

    this.storyRecordedChunks = [];

    try {

      this.storyMediaRecorder =
        new MediaRecorder(
          this.storyCameraStream
        );

      this.storyMediaRecorder.ondataavailable =
        (event: BlobEvent) => {

          if (
            event.data &&
            event.data.size > 0
          ) {
            this.storyRecordedChunks.push(
              event.data
            );
          }
        };

      this.storyMediaRecorder.onstop = () => {

        const mimeType =
          this.storyMediaRecorder?.mimeType ||
          'video/webm';

        const blob =
          new Blob(
            this.storyRecordedChunks,
            {
              type: mimeType
            }
          );

        const extension =
          mimeType.includes('mp4')
            ? 'mp4'
            : 'webm';

        const file =
          new File(
            [blob],
            `portergram-story-${Date.now()}.${extension}`,
            {
              type: mimeType
            }
          );

        this.storyFile = file;

        console.log(
          'VÍDEO PARA HISTORIA:',
          this.storyFile
        );

        this.storyRecordedChunks = [];

        this.closeStoryCamera();
      };

      this.storyMediaRecorder.start();

      this.storyIsRecording = true;

    } catch (error) {

      console.error(
        'ERROR GRABANDO VÍDEO DE HISTORIA:',
        error
      );
    }
  }

  stopStoryVideoRecording(): void {

    if (
      !this.storyMediaRecorder ||
      !this.storyIsRecording
    ) {
      return;
    }

    this.storyMediaRecorder.stop();

    this.storyIsRecording = false;
  }

  showUsers(pub: any, type: 'likes' | 'dislikes') {

    this.selectedDislikes =
      type === 'likes'
        ? (pub.likes || [])
        : (pub.dislikes || []);

    this.showDislikesModal = true;
  }

  loadSelectedWorld(): void {
    this.selectedWorld = null;
    this.hasWorld = false;
    this.myWorld = null;
  }

  private get worldPreferenceKey(): string | null {
    return this.identity?._id
      ? `portergramSelectedWorld:${this.identity._id}`
      : null;
  }

  removeSelectedWorld(): void {
    const confirmed = window.confirm(
      '¿Quieres dejar de mostrar Mi Mundo? El progreso no se eliminará.'
    );

    if (!confirmed || !this.token) return;

    this.myWorldService
      .setWorldVisibility(false, this.token)
      .subscribe({
        next: () => {
          this.selectedWorld = null;
          this.hasWorld = false;
          this.myWorld = null;

          const key = this.worldPreferenceKey;
          if (key) localStorage.setItem(key, 'none');
        },
        error: (error: any) => {
          console.error('Error al ocultar el mundo:', error);
        }
      });
  }

  selectWorld(worldType: WorldType): void {
    const token = this.token;
    if (!token) return;

    this.myWorldService
      .selectWorld(worldType, token)
      .pipe(
        switchMap(() =>
          this.myWorldService.setWorldVisibility(true, token)
        )
      )
      .subscribe({
        next: () => {
          this.selectedWorld = worldType;
          this.hasWorld = true;

          const key = this.worldPreferenceKey;
          if (key) localStorage.setItem(key, worldType);

          this.showWorldSelection = false;
          this.loadMyWorldAside();
        },
        error: (error: any) => {
          this.worldSelectionError =
            error?.error?.message ||
            'No se pudo seleccionar el mundo. Inténtalo de nuevo.';
        }
      });
  }

  openWorldSelection(): void {
    this.worldSelectionError = '';
    this.showWorldSelection = true;
  }

  selectGardenWorld(): void {
    this.selectWorld('garden');
  }

  selectStadiumWorld(): void {
    this.selectWorld('stadium');
  }



  closeWorldSelection(): void {
    this.showWorldSelection = false;
  }

  openFullWorld(): void {

    if (!this.hasWorld || !this.selectedWorld) {
      return;
    }

    console.log(
      'ENTRANDO AL MUNDO:',
      this.selectedWorld
    );

    this.router.navigate(
      ['/my-world'],
      {
        queryParams: {
          world: this.selectedWorld
        }
      }
    );
  }

  constructor(
    private publicationService: PublicationService,
    private userService: UserService,
    private commentService: CommentService,
    private storyService: StoryService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationSound: NotificationSoundService,
    private myWorldService: MyWorldService
  ) {
    if (typeof window === 'undefined') {
      return;
    }

    navigator.mediaDevices.enumerateDevices()

    const identityStored =
      localStorage.getItem('identity');

    this.token =
      localStorage.getItem('token');

    if (identityStored) {
      try {
        this.identity =
          JSON.parse(identityStored);
      } catch (error) {
        console.error(
          'Identity guardada no válida:',
          error
        );

        this.identity = null;
      }
    }

    this.theme =
      localStorage.getItem('theme') ||
      this.identity?.theme ||
      'neon';

    this.globalBackground =
      localStorage.getItem('globalBackground') ||
      this.identity?.globalBackground ||
      '';

    this.navBackground =
      localStorage.getItem('navBackground') ||
      '';

    document.documentElement.style.setProperty(
      '--scroll-color',
      this.identity?.scrollColor || '#00f7ff'
    );

    console.log(
      'TOKEN AL CREAR HOME:',
      this.token
    );

    /*
     * No hacemos peticiones privadas si no existe token.
     */
    if (!this.token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadPublications();
    this.loadCounters();
    this.loadStories();
    this.loadSelectedWorld();
    this.loadMyWorldAside();

    this.route.queryParams.subscribe(params => {
      if (params['newStory'] === '1') {
        this.showStoryForm = true;
      }

      if (params['chooseWorld'] === '1') {
        this.openWorldSelection();
      }

      if (
        params['newStory'] === '1' ||
        params['chooseWorld'] === '1'
      ) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  isVideo(file: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(file);
  }

  loadPublications() {
    if (!this.token) return;

    this.publicationService.getPublications(this.token).subscribe({
      next: (response: any) => {
        let pubs = response.publications || [];

        if (this.identity?.role !== 'ROLE_ADMIN') {
          // aquí deja tu filtro normal si tienes uno
          // pubs = pubs.filter(...)
        }

        this.publications = pubs.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        this.publications.forEach((pub: any) => {
          pub.currentFile = 0;

          pub.comments = (pub.comments || []).sort(
            (a: any, b: any) =>
              new Date(
                b.created_at || b.createdAt
              ).getTime() -
              new Date(
                a.created_at || a.createdAt
              ).getTime()
          );
        });
      },
      error: err => console.log(err)
    });

  }

  fileChangeEventPub(event: any) {

    this.filesToUploadPub = Array.from(event.target.files);

    if (this.filesToUploadPub.length > 0) {

      this.fileName =
        this.filesToUploadPub.length === 1
          ? this.filesToUploadPub[0].name
          : this.filesToUploadPub.length + ' archivos seleccionados';

    } else {

      this.fileName = '';

    }
  }

  async openCamera(): Promise<void> {

    try {

      this.stopCameraStream();

      this.showCamera = true;

      const permissionStream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

      const devices =
        await navigator.mediaDevices.enumerateDevices();

      this.availableCameras =
        devices.filter(
          device => device.kind === 'videoinput'
        );

      console.log(
        'CÁMARAS DETECTADAS:',
        this.availableCameras
      );

      permissionStream
        .getTracks()
        .forEach(track => track.stop());


      if (this.availableCameras.length <= 1) {

        this.cameraStream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });

      } else {

        const normalCamera =
          this.availableCameras.find(cam => {

            const label =
              cam.label.toLowerCase();

            return (
              !label.includes('virtual') &&
              !label.includes('eshare') &&
              !label.includes('ir') &&
              !label.includes('infrared')
            );
          });

        if (!normalCamera) {
          throw new Error(
            'No se encontró una cámara física'
          );
        }

        this.selectedCameraId =
          normalCamera.deviceId;

        console.log(
          'CÁMARA SELECCIONADA:',
          normalCamera.label
        );

        this.cameraStream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: {
                exact: normalCamera.deviceId
              }
            },
            audio: false
          });

        const videoTrack =
          this.cameraStream.getVideoTracks()[0];

        console.log(
          'CÁMARA REAL UTILIZADA:',
          videoTrack?.label
        );
      }


      setTimeout(async () => {

        const video =
          document.getElementById(
            'cameraPreview'
          ) as HTMLVideoElement;

        if (!video || !this.cameraStream) {

          console.error(
            'No se encontró cameraPreview'
          );

          return;
        }

        video.srcObject =
          this.cameraStream;

        const videoTrack =
          this.cameraStream.getVideoTracks()[0];

        console.log(
          'CÁMARA REAL UTILIZADA:',
          videoTrack?.label
        );

        try {

          await video.play();

          console.log(
            'CÁMARA FUNCIONANDO:',
            {
              width: video.videoWidth,
              height: video.videoHeight,
              cameras:
                this.availableCameras.length
            }
          );

        } catch (error) {

          console.error(
            'ERROR REPRODUCIENDO CÁMARA:',
            error
          );
        }

      }, 150);

    } catch (error) {

      console.error(
        'ERROR ABRIENDO CÁMARA:',
        error
      );

      this.showCamera = false;

      alert(
        'No se ha podido abrir la cámara. Comprueba los permisos de Windows y del navegador.'
      );
    }
  }

  addPublication() {
    if (!this.token) return;

    const text = this.newPublication.text?.trim() || '';

    if (!text && this.filesToUploadPub.length === 0) return;

    const publicationData = {
      text: text
    };

    this.publicationService.addPublication(this.token, publicationData).subscribe({
      next: (response: any) => {
        const newPub =
          response.publication ||
          response.pub ||
          response.publicationStored ||
          response;

        const pubId = newPub?._id;

        if (!pubId) {
          console.log('No viene _id en la respuesta:', response);
          return;
        }

        if (this.filesToUploadPub.length > 0) {
          this.publicationService
            .uploadImagePub(pubId, this.filesToUploadPub, this.token!)
            .subscribe({
              next: () => {
                this.resetPublicationForm();
                this.loadPublications();
                this.refreshMyWorldAfterActivity();
              },
              error: err => console.log('ERROR UPLOAD:', err)
            });
        } else {
          this.resetPublicationForm();
          this.loadPublications();
          this.refreshMyWorldAfterActivity();
        }
      },
      error: err => console.log('ERROR CREAR:', err)
    });
  }

  resetPublicationForm() {
    this.newPublication.text = '';
    this.filesToUploadPub = [];
    this.selectedFilesToRemove.clear();
    this.fileName = '';
  }

  deletePublication(id: string) {
    if (!this.token) return;

    const confirmDelete = confirm('¿Seguro que quieres eliminar esta publicación?');

    if (!confirmDelete) return;

    this.publicationService.deletePublication(this.token, id).subscribe({
      next: () => {
        this.loadPublications();
        this.refreshMyWorldAfterActivity();
      },
      error: err => console.log(err)
    });
  }

  likePublication(pub: any) {
    if (!this.token) return;

    this.publicationService.likePublication(this.token, pub._id).subscribe({
      next: (response: any) => {
        pub.likes = response.publication.likes;
        pub.dislikes = response.publication.dislikes;

        this.openLikesPostId = null;
        this.openDislikesPostId = null;

        this.likeAnimationPostId = pub._id;
        this.notificationSound.play('like');
        this.refreshMyWorldAfterActivity();

        setTimeout(() => {
          if (this.likeAnimationPostId === pub._id) {
            this.likeAnimationPostId = null;
          }
        }, 700);
      },
      error: err => console.log(err)
    });
  }

  hasLiked(pub: any): boolean {
    if (!pub.likes || !this.identity) return false;

    return pub.likes.some((like: any) => {
      if (typeof like === 'object') {
        return like._id == this.identity._id;
      }

      return like == this.identity._id;
    });
  }

  hasDisliked(pub: any): boolean {

    if (!pub.dislikes || !this.identity) {
      return false;
    }

    return pub.dislikes.some((dislike: any) => {

      if (typeof dislike === 'object') {
        return dislike._id == this.identity._id;
      }

      return dislike == this.identity._id;
    });
  }

  addComment(
    publicationId: string,
    text: string
  ): void {
    if (
      !this.token ||
      !text ||
      !text.trim()
    ) {
      return;
    }

    this.publicationService
      .addComment(
        this.token,
        publicationId,
        text.trim()
      )
      .subscribe({
        next: (response: any) => {
          const pub = this.publications.find(
            (publication: any) =>
              publication._id === publicationId
          );

          if (pub && response.comment) {
            pub.comments = pub.comments || [];
            pub.comments.unshift(response.comment);
            pub.newComment = '';
          }

          this.notificationSound.play('comment');
          this.refreshMyWorldAfterActivity();
        },

        error: (error: any) => {
          console.error(
            'ERROR AL CREAR COMENTARIO:',
            error
          );
        }
      });
  }

  deleteComment(
    publicationId: string,
    commentId: string
  ): void {
    if (!this.token) {
      return;
    }

    const confirmDelete = confirm(
      '¿Seguro que quieres eliminar este comentario?'
    );

    if (!confirmDelete) {
      return;
    }

    this.publicationService
      .deleteCommentProfile(
        this.token,
        publicationId,
        commentId
      )
      .subscribe({
        next: () => {
          const pub = this.publications.find(
            (publication: any) =>
              publication._id === publicationId
          );

          if (pub) {
            pub.comments = (
              pub.comments || []
            ).filter(
              (comment: any) =>
                comment._id !== commentId
            );
          }

          this.refreshMyWorldAfterActivity();
        },

        error: (error: any) => {
          console.error(
            'ERROR AL ELIMINAR COMENTARIO:',
            error
          );
        }
      });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('identity');

    window.location.href = '/login';
  }

  loadCounters() {
    if (!this.token || !this.identity) return;

    this.userService.getCounters(this.token, this.identity._id)
      .subscribe({
        next: (res: any) => {
          this.followersCount = res.followed || 0;
          this.followingCount = res.following || 0;
        },
        error: err => console.log(err)
      });
  }

  public followersCount = 0;
  public followingCount = 0;

  toggleLikes(pubId: string) {
    this.openLikesPostId = null;

    this.openLikesPostId =
      this.openLikesPostId === pubId
        ? null
        : pubId;
  }

  replyComment(pub: any, comment: any) {

    if (!comment.replyText?.trim()) {
      return;
    }

    this.publicationService
      .replyCommentProfile(
        this.token!,
        pub._id,
        comment._id,
        comment.replyText
      )
      .subscribe({

        next: (response: any) => {

          if (!comment.replies) {
            comment.replies = [];
          }

          comment.replies.unshift(
            response.reply
          );

          comment.replyText = '';
          comment.showReply = false;

          this.notificationSound.play('comment');

          this.refreshMyWorldAfterActivity();
        },

        error: (err: any) =>
          console.log(err)

      });
  }

  likeComment(pub: any, comment: any): void {
    if (!this.token) {
      return;
    }

    this.publicationService
      .likeCommentProfile(
        this.token,
        pub._id,
        comment._id
      )
      .subscribe({
        next: (response: any) => {
          const updatedComment =
            response.publication?.comments?.find(
              (item: any) =>
                String(item._id) ===
                String(comment._id)
            );

          if (updatedComment) {
            comment.likes =
              updatedComment.likes || [];

            comment.dislikes =
              updatedComment.dislikes || [];
          }

          this.notificationSound.play('like');
        },

        error: (error: any) => {
          console.error(
            'ERROR LIKE COMENTARIO:',
            error
          );
        }
      });
  }

  hasLikedComment(comment: any): boolean {

    if (!comment?.likes || !this.identity) {
      return false;
    }

    const myId =
      this.identity._id ||
      this.identity.sub;

    return comment.likes.some((like: any) => {

      const likeId =
        typeof like === 'string'
          ? like
          : like?._id;

      return String(likeId) === String(myId);
    });
  }

  hasDislikedComment(comment: any): boolean {

    if (!comment.dislikes || !this.identity) {
      return false;
    }

    return comment.dislikes.some(
      (u: any) => u._id === this.identity._id
    );
  }

  dislikeComment(pub: any, comment: any): void {
    if (!this.token) {
      return;
    }

    this.publicationService
      .dislikeCommentProfile(
        this.token,
        pub._id,
        comment._id
      )
      .subscribe({
        next: (response: any) => {
          const updatedComment =
            response.publication?.comments?.find(
              (item: any) =>
                item._id === comment._id
            );

          if (updatedComment) {
            comment.likes =
              updatedComment.likes || [];

            comment.dislikes =
              updatedComment.dislikes || [];
          }

          this.notificationSound.play(
            'dislike'
          );
        },

        error: (error: any) => {
          console.error(
            'ERROR DISLIKE COMENTARIO:',
            error
          );
        }
      });
  }

  dislikePublication(pub: any) {

    this.publicationService.dislikePublication(
      this.token!,
      pub._id
    ).subscribe({

      next: (response: any) => {

        pub.likes = response.publication.likes;
        pub.dislikes = response.publication.dislikes;
        this.notificationSound.play('dislike');
        this.refreshMyWorldAfterActivity();

      },

      error: err => console.log(err)

    });
  }

  hasDislikedPublication(pub: any): boolean {

    if (!pub.dislikes || !this.identity) {
      return false;
    }

    return pub.dislikes.some(
      (u: any) => u._id === this.identity._id
    );
  }

  showDislikes(pub: any) {

    this.selectedDislikes = pub.dislikes || [];

    this.showDislikesModal = true;
  }

  toggleDislikes(pubId: string) {
    this.openLikesPostId = null;

    this.openDislikesPostId =
      this.openDislikesPostId === pubId ? null : pubId;
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: MouseEvent) {

    const target = event.target as HTMLElement;

    const clickedDropdown =
      target.closest('.likes-dropdown');

    const clickedButton =
      target.closest('.likes-toggle');

    if (!clickedDropdown && !clickedButton) {

      this.openLikesPostId = null;
      this.openDislikesPostId = null;

    }
  }

  nextFile(pub: any) {

    if (!pub.files?.length) return;

    pub.currentFile++;

    if (pub.currentFile >= pub.files.length) {
      pub.currentFile = 0;
    }

  }

  previousFile(pub: any) {

    if (!pub.files?.length) return;

    pub.currentFile--;

    if (pub.currentFile < 0) {
      pub.currentFile = pub.files.length - 1;
    }

  }

  storyFileChange(event: any) {
    this.storyFile = event.target.files[0];
  }

  toggleStoryForm() {
    this.showStoryForm = !this.showStoryForm;
  }

  createStory() {
    if (!this.token || !this.storyFile) return;

    this.storyService.createStory(
      this.token,
      this.storyFile,
      this.storyIcon,
      this.storyText,
      this.storyDuration
    ).subscribe({
      next: () => {
        this.storyFile = null;
        this.storyIcon = '💥';
        this.storyText = '';
        this.showStoryForm = false;
        this.loadStories();
        this.notificationSound.play('story');
        this.refreshMyWorldAfterActivity();
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

  getMyStory() {
    if (!this.identity?._id) return null;

    return this.getUserStory(this.identity._id);
  }

  getMyStories() {
    return this.getUserStories(this.identity._id);
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

  openStory(story: any) {

    if (!story) {
      this.showStoryForm = true;
      return;
    }

    this.selectedStoryUserId = story.user._id;

    const stories = this.getUserStories(this.selectedStoryUserId!);

    this.selectedStoryIndex = stories.findIndex(
      (s: any) => s._id === story._id
    );

    if (this.selectedStoryIndex < 0) {
      this.selectedStoryIndex = 0;
    }

    this.selectedStory = stories[this.selectedStoryIndex];

  }

  closeStory() {
    this.selectedStory = null;
    this.selectedStoryUserId = null;
    this.selectedStoryIndex = 0;
  }

  nextStory() {
    if (!this.selectedStoryUserId) return;

    const stories = this.getUserStories(this.selectedStoryUserId);

    if (stories.length === 0) return;

    this.selectedStoryIndex++;

    if (this.selectedStoryIndex >= stories.length) {
      this.selectedStoryIndex = 0;
    }

    this.selectedStory = stories[this.selectedStoryIndex];
  }

  prevStory() {
    if (!this.selectedStoryUserId) return;

    const stories = this.getUserStories(this.selectedStoryUserId);

    if (stories.length === 0) return;

    this.selectedStoryIndex--;

    if (this.selectedStoryIndex < 0) {
      this.selectedStoryIndex = stories.length - 1;
    }

    this.selectedStory = stories[this.selectedStoryIndex];
  }

  openNewStoryForm() {
    this.selectedStory = null;
    this.showStoryForm = true;

    this.storyFile = null;
    this.storyText = '';
    this.storyIcon = '💥';

    setTimeout(() => {
      const form = document.querySelector('.story-form');
      form?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  }

  openUserStories(userId: string) {
    const stories = this.getUserStories(userId);

    if (stories.length === 0) return;

    this.selectedStoryUserId = userId;
    this.selectedStoryIndex = 0;
    this.selectedStory = stories[0];
  }

  loadMyWorldAside(): void {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');

    if (!token) {
      this.myWorldError = 'No se encontró el token de autenticación';
      return;
    }

    this.myWorldLoading = true;
    this.myWorldError = '';

    this.myWorldService.getAsideWorld(token).subscribe({
      next: (response: any) => {
        const world = response.world;
        const worldType = world?.worldType;
        const key = this.worldPreferenceKey;

        const hiddenByUser =
          key !== null && localStorage.getItem(key) === 'none';

        const validWorld =
          worldType === 'garden' ||
          worldType === 'stadium' ||
          worldType === 'space-base';

        if (
          hiddenByUser ||
          response.visible === false ||
          world?.visible === false ||
          !validWorld
        ) {
          this.myWorld = null;
          this.selectedWorld = null;
          this.hasWorld = false;
          this.myWorldLoading = false;
          return;
        }

        this.myWorld = world;
        this.selectedWorld = worldType;
        this.hasWorld = true;
        this.myWorldLoading = false;
      },

      error: (error: any) => {
        this.myWorldLoading = false;
        this.myWorld = null;
        this.selectedWorld = null;
        this.hasWorld = false;

        this.myWorldError =
          error?.error?.message ||
          'No se pudo cargar Mi Mundo';
      }
    });
  }

  dislikeReply(
    pub: any,
    comment: any,
    reply: any
  ): void {
    if (!this.token) {
      return;
    }

    this.publicationService
      .dislikeReplyProfile(
        this.token,
        pub._id,
        comment._id,
        reply._id
      )
      .subscribe({
        next: (response: any) => {
          const updatedComment =
            response.publication?.comments?.find(
              (item: any) =>
                item._id === comment._id
            );

          const updatedReply =
            updatedComment?.replies?.find(
              (item: any) =>
                item._id === reply._id
            );

          if (updatedReply) {
            reply.likes =
              updatedReply.likes || [];

            reply.dislikes =
              updatedReply.dislikes || [];
          }

          this.notificationSound.play(
            'dislike'
          );
        },

        error: (error: any) => {
          console.error(
            'ERROR DISLIKE RESPUESTA:',
            error
          );
        }
      });
  }

  likeReply(
    pub: any,
    comment: any,
    reply: any
  ): void {
    if (!this.token) {
      return;
    }

    this.publicationService
      .likeReplyProfile(
        this.token,
        pub._id,
        comment._id,
        reply._id
      )
      .subscribe({
        next: (response: any) => {
          const updatedComment =
            response.publication?.comments?.find(
              (item: any) =>
                item._id === comment._id
            );

          const updatedReply =
            updatedComment?.replies?.find(
              (item: any) =>
                item._id === reply._id
            );

          if (updatedReply) {
            reply.likes =
              updatedReply.likes || [];

            reply.dislikes =
              updatedReply.dislikes || [];
          }

          this.notificationSound.play('like');
        },

        error: (error: any) => {
          console.error(
            'ERROR LIKE RESPUESTA:',
            error
          );
        }
      });
  }

  uploadAvatar(event: Event): void {

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !this.identity) {
      return;
    }

    // <-- AQUÍ
    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    this.userService
      .uploadAvatar(token, this.identity._id, file)
      .subscribe({
        next: (response: any) => {

          console.log(response);

          this.identity.image = response.user.image;

          localStorage.setItem(
            'identity',
            JSON.stringify(this.identity)
          );

          input.value = '';

        },
        error: err => {
          console.error(err);
        }
      });

  }

  getWorldIcon(): string {

    const world = this.availableWorlds.find(
      w => w.id === this.selectedWorld
    );

    return world?.icon || '🌍';
  }

  async switchCamera(): Promise<void> {

    if (this.availableCameras.length <= 1) {

      console.log(
        'Solo hay una cámara disponible'
      );

      return;
    }

    this.cameraFacingMode =
      this.cameraFacingMode === 'environment'
        ? 'user'
        : 'environment';

    await this.openCamera();
  }

  capturePhoto(): void {

    const video =
      document.getElementById(
        'cameraPreview'
      ) as HTMLVideoElement;

    if (!video) {
      return;
    }

    // La cámara todavía no está preparada
    if (
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {

      console.log(
        'CÁMARA TODAVÍA NO PREPARADA:',
        {
          readyState: video.readyState,
          width: video.videoWidth,
          height: video.videoHeight
        }
      );

      alert(
        'Espera un momento a que la cámara termine de cargar.'
      );

      return;
    }

    const canvas =
      document.createElement('canvas');

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      blob => {

        if (!blob) {
          return;
        }

        const file =
          new File(
            [blob],
            `portergram-photo-${Date.now()}.jpg`,
            {
              type: 'image/jpeg'
            }
          );

        this.filesToUploadPub.push(file);

        this.fileName =
          this.filesToUploadPub.length === 1
            ? file.name
            : `${this.filesToUploadPub.length} archivos seleccionados`;

        console.log(
          'FOTO CAPTURADA:',
          file
        );

        this.closeCamera();

      },
      'image/jpeg',
      0.92
    );
  }

  startVideoRecording() {

    if (
      !this.cameraStream ||
      this.isRecording
    ) {
      return;
    }

    this.recordedChunks = [];

    try {

      this.mediaRecorder =
        new MediaRecorder(
          this.cameraStream
        );

      this.mediaRecorder.ondataavailable =
        (event: BlobEvent) => {

          if (
            event.data &&
            event.data.size > 0
          ) {
            this.recordedChunks.push(
              event.data
            );
          }

        };

      this.mediaRecorder.onstop = () => {

        const mimeType =
          this.mediaRecorder?.mimeType ||
          'video/webm';

        const blob =
          new Blob(
            this.recordedChunks,
            {
              type: mimeType
            }
          );

        const extension =
          mimeType.includes('mp4')
            ? 'mp4'
            : 'webm';

        const file =
          new File(
            [blob],
            `portergram-video-${Date.now()}.${extension}`,
            {
              type: mimeType
            }
          );

        this.filesToUploadPub.push(
          file
        );

        this.fileName =
          this.filesToUploadPub.length === 1
            ? file.name
            : `${this.filesToUploadPub.length} archivos seleccionados`;

        this.recordedChunks = [];

        this.closeCamera();
      };

      this.mediaRecorder.start();

      this.isRecording = true;

    } catch (error) {

      console.error(
        'ERROR INICIANDO GRABACIÓN:',
        error
      );

    }
  }

  stopVideoRecording() {

    if (
      !this.mediaRecorder ||
      !this.isRecording
    ) {
      return;
    }

    this.mediaRecorder.stop();

    this.isRecording = false;
  }

  async detectCameras(): Promise<void> {

    try {

      const devices =
        await navigator.mediaDevices.enumerateDevices();

      this.availableCameras =
        devices.filter(
          device => device.kind === 'videoinput'
        );

      console.log(
        'CÁMARAS DETECTADAS:',
        this.availableCameras
      );

      this.availableCameras.forEach((camera, index) => {

        console.log(
          `CÁMARA ${index}:`,
          camera.label,
          camera.deviceId
        );

      });

      const physicalCamera =
        this.availableCameras.find(camera => {

          const label =
            camera.label.toLowerCase();

          return (
            !label.includes('virtual') &&
            !label.includes('eshare') &&
            !label.includes('ir') &&
            !label.includes('infrared')
          );
        });

      const camera =
        physicalCamera ||
        this.availableCameras.find(camera =>
          camera.label.includes('HP Webcam')
        ) ||
        this.availableCameras[0];

      if (!camera) {
        throw new Error(
          'No se encontró ninguna cámara disponible'
        );
      }

      this.selectedCameraId =
        camera.deviceId;

      console.log(
        'CÁMARA SELECCIONADA:',
        camera.label
      );

    } catch (error) {

      console.error(
        'ERROR DETECTANDO CÁMARAS:',
        error
      );

      this.availableCameras = [];
      this.selectedCameraId = null;
    }
  }

  async openStoryCamera(): Promise<void> {

    try {

      this.closeStoryCamera();

      this.showStoryCamera = true;

      // Detectamos las cámaras y seleccionamos
      // la física, evitando EShare Virtual Camera
      await this.detectCameras();

      if (!this.selectedCameraId) {
        throw new Error(
          'No hay ninguna cámara seleccionada'
        );
      }

      this.storySelectedCameraId =
        this.selectedCameraId;

      this.storyCameraStream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: {
              exact: this.storySelectedCameraId
            }
          },
          audio: false
        });

      const track =
        this.storyCameraStream.getVideoTracks()[0];

      console.log(
        'CÁMARA HISTORIA UTILIZADA:',
        track?.label
      );

      setTimeout(async () => {

        const video =
          document.getElementById(
            'storyCameraPreview'
          ) as HTMLVideoElement;

        if (!video || !this.storyCameraStream) {
          return;
        }

        video.srcObject =
          this.storyCameraStream;

        try {

          await video.play();

          console.log(
            'CÁMARA HISTORIA FUNCIONANDO:',
            video.videoWidth,
            video.videoHeight
          );

        } catch (error) {

          console.error(
            'ERROR REPRODUCIENDO CÁMARA DE HISTORIA:',
            error
          );
        }

      }, 150);

    } catch (error) {

      console.error(
        'ERROR ABRIENDO CÁMARA DE HISTORIA:',
        error
      );

      this.showStoryCamera = false;
    }
  }

  captureStoryPhoto(): void {

    const video =
      document.getElementById(
        'storyCameraPreview'
      ) as HTMLVideoElement;

    if (!video) {
      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {

      console.error(
        'La cámara todavía no está preparada'
      );

      return;
    }

    const canvas =
      document.createElement('canvas');

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      blob => {

        if (!blob) {
          return;
        }

        const file =
          new File(
            [blob],
            `portergram-story-${Date.now()}.jpg`,
            {
              type: 'image/jpeg'
            }
          );

        this.storyFile = file;

        console.log(
          'FOTO PARA HISTORIA:',
          this.storyFile
        );

        this.closeStoryCamera();

      },
      'image/jpeg',
      0.92
    );
  }

  closeStoryCamera(): void {

    if (this.storyCameraStream) {

      this.storyCameraStream
        .getTracks()
        .forEach(track => track.stop());

      this.storyCameraStream = null;
    }

    this.showStoryCamera = false;
  }

}
