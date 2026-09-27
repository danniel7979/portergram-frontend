import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket';
import { isPrivatePreview } from '../../services/private-preview-api.interceptor';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {

  public identity: any;
  public readonly isDemo = isPrivatePreview();
  public confirmingAccountDeletion = false;
  public accountDeletionConfirmation = '';
  public deletingAccount = false;
  public deleteAccountError = '';
  public token: any;

  public fileToUpload: File | null = null;
  public url = 'http://localhost:3800/api/';

  public theme = 'neon';
  public globalBackground = '';
  public navBackground = '';
  public feedBackground = '';
  public soundCategories = [
    {
      id: 'classic',
      name: 'Classic',
      sounds: [
        { name: 'Ring Ring', path: '/sounds/classic/ring.mp3' }
      ]
    },
    {
      id: 'animales',
      name: 'Animales',
      sounds: [
        { name: 'Perro', path: '/sounds/animales/perro.mp3' },
        { name: 'Gato', path: '/sounds/animales/gato.mp3' },
        { name: 'Búho', path: '/sounds/animales/buho.mp3' },
        { name: 'Caballo', path: '/sounds/animales/caballo.mp3' }
      ]
    },
    {
      id: 'transportes',
      name: 'Transportes',
      sounds: [
        { name: 'Coche', path: '/sounds/transportes/coche.mp3' },
        { name: 'Moto', path: '/sounds/transportes/moto.mp3' },
        { name: 'Fórmula 1', path: '/sounds/transportes/f1.mp3' },
        { name: 'Tren', path: '/sounds/transportes/tren.mp3' },
        { name: 'Barco', path: '/sounds/transportes/barco.mp3' },
        { name: 'Camión', path: '/sounds/transportes/camion.mp3' }
      ]
    },
    {
      id: 'otros',
      name: 'Otros',
      sounds: [
        { name: 'Crash', path: '/sounds/otros/crash.mp3' },
        { name: 'Bling', path: '/sounds/otros/bling.mp3' },
        { name: 'Cristal', path: '/sounds/otros/cristal.mp3' },
        { name: 'Pedo', path: '/sounds/otros/pedo.mp3' },
        { name: 'Story', path: '/sounds/otros/story.mp3' }
      ]
    }
  ];

  public soundTypes = [
    { id: 'comment', name: 'Comentarios', icon: '💬' },
    { id: 'message', name: 'Mensajes', icon: '✉️' },
    { id: 'like', name: 'Likes', icon: '❤️' },
    { id: 'dislike', name: 'Dislikes', icon: '💀' },
    { id: 'story', name: 'Historias', icon: '📖' }
  ];

  public selectedSoundCategories: Record<string, string> = {};

  public selectedSounds: Record<string, string> = {};

  saveSound(type: string, path: string) {
    this.selectedSounds[type] = path;
    localStorage.setItem('notificationSounds', JSON.stringify(this.selectedSounds));
  }

  public profile: any = {
    name: '',
    nick: '',
    bio: '',
    location: '',
    profession: '',
    website: '',
    theme: 'neon',
    globalBackground: '',
    likeColor: '#00aaff',
    scrollColor: '#00f7ff',
    deleteReplyBackgroundColor: '#ff4444',
    deleteReplyTextColor: '#ffffff',
    deleteCommentBackgroundColor: '#ff4444',
    deleteCommentTextColor: '#ffffff',
    isPrivate: false,

  };

  constructor(
    private userService: UserService,
    private socketService: SocketService,
    private router: Router
  ) {
    if (typeof window === 'undefined') return;

    const identity = localStorage.getItem('identity');
    this.token = localStorage.getItem('token');

    if (identity) {
      this.identity = JSON.parse(identity);

      this.theme =
        localStorage.getItem('theme') ||
        this.identity.theme ||
        'neon';

      this.globalBackground =
        localStorage.getItem('globalBackground') ||
        this.identity.globalBackground ||
        '';

      this.navBackground =
        localStorage.getItem('navBackground') || '';

      this.feedBackground =
        localStorage.getItem('feedBackground') || '';

      this.profile = {
        name: this.identity.name || '',
        surname: this.identity.surname || '',
        nick: this.identity.nick || '',
        bio: this.identity.bio || '',
        location: this.identity.location || '',
        profession: this.identity.profession || '',
        website: this.identity.website || '',
        likeColor: this.identity.likeColor || '#00aaff',
        scrollColor: this.identity.scrollColor || '#00f7ff',

        deleteCommentBackgroundColor:
          this.identity.deleteCommentBackgroundColor || '#ff4444',

        deleteCommentTextColor:
          this.identity.deleteCommentTextColor || '#ffffff',

        deleteReplyBackgroundColor:
          this.identity.deleteReplyBackgroundColor || '#ff4444',

        deleteReplyTextColor:
          this.identity.deleteReplyTextColor || '#ffffff',

        theme: this.identity.theme || 'glass',

        globalBackground:
          localStorage.getItem('globalBackground') ||
          this.identity.globalBackground ||
          '',

        isPrivate: this.identity.isPrivate === true
      };

      document.documentElement.style.setProperty(
        '--scroll-color',
        this.identity.scrollColor || '#00f7ff'
      );
    }

    this.loadSoundSettings();
  }

  save() {
    if (!this.token || !this.identity) return;
    console.log('FONDO QUE ENVÍO:', this.profile.globalBackground);
    this.userService.updateProfileSettings(
      this.identity._id,
      this.profile,
      this.token
    ).subscribe({
      next: (res: any) => {
        this.identity = res.user;

        this.profile = {
          ...this.profile,
          ...res.user,
          isPrivate: res.user.isPrivate === true
        };

        localStorage.setItem('identity', JSON.stringify(this.identity));

        localStorage.setItem(
          'theme',
          this.identity.theme || 'neon'
        );

        localStorage.setItem(
          'globalBackground',
          this.identity.globalBackground || ''
        );

        if (this.profile.globalBackground) {

          document.body.style.backgroundImage =
            `url(${this.profile.globalBackground})`;

          document.body.style.backgroundSize = 'cover';

          document.body.style.backgroundPosition = 'center';

          document.body.style.backgroundAttachment = 'fixed';
        }

        document.documentElement.style.setProperty(
          '--scroll-color',
          this.identity.scrollColor || '#00f7ff'
        );

        alert('Perfil actualizado');
      },
      error: err => {

        console.log(err);

        if (err.status === 409) {
          alert('Ese nombre de usuario ya está en uso');
          return;
        }

        if (err.status === 400) {
          alert(err.error?.message || 'Nombre de usuario no válido');
          return;
        }

        alert('Error al actualizar el perfil');
      }
    });
  }

  fileChangeEvent(event: any) {
    this.fileToUpload = event.target.files[0];
  }

  uploadImage() {
    if (!this.fileToUpload || !this.identity || !this.token) return;

    this.userService.uploadImage(
      this.identity._id,
      this.fileToUpload,
      this.token
    ).subscribe({
      next: (response: any) => {
        this.identity.image = response.user.image;

        localStorage.setItem(
          'identity',
          JSON.stringify(this.identity)
        );

        alert('Avatar actualizado');
      },
      error: err => console.log(err)
    });
  }

  changeTheme(theme: string) {
    this.theme = theme;
    this.profile.theme = theme;

    localStorage.setItem('theme', theme);
  }

  changeGlobalBackground(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const background = reader.result as string;

      this.profile.globalBackground = background;
      this.globalBackground = background;

      console.log('FONDO CARGADO:', this.profile.globalBackground);
    };

    reader.readAsDataURL(file);
  }

  removeGlobalBackground() {
    this.globalBackground = '';
    this.profile.globalBackground = '';

    localStorage.removeItem('globalBackground');
  }

  changeNavBackground(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.navBackground = reader.result as string;
      localStorage.setItem('navBackground', this.navBackground);
    };

    reader.readAsDataURL(file);
  }

  changeFeedBackground(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.feedBackground = reader.result as string;
      localStorage.setItem('feedBackground', this.feedBackground);
    };

    reader.readAsDataURL(file);
  }

  ngOnInit(): void {

    this.applyGlobalBackground();

    const bg = localStorage.getItem('globalBackground');

    if (bg) {

      document.body.style.backgroundImage =
        `url(${bg})`;

      document.body.style.backgroundSize = 'cover';

      document.body.style.backgroundPosition = 'center';

      document.body.style.backgroundAttachment = 'fixed';
    }
  }

  applyGlobalBackground() {
    const bg =
      localStorage.getItem('globalBackground') ||
      this.profile.globalBackground ||
      '';

    this.globalBackground = bg;
  }

  goHome() {
    this.router.navigate(['/home']).then(() => {

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      }, 100);

    });
  }

  loadSoundSettings() {
    if (typeof window === 'undefined') return;

    const savedSounds: Record<string, string> = JSON.parse(
      localStorage.getItem('notificationSounds') || '{}'
    );

    this.soundTypes.forEach((type) => {
      const savedPath = savedSounds[type.id];

      if (savedPath) {
        const category = this.soundCategories.find((item) =>
          item.sounds.some((sound) => sound.path === savedPath)
        );

        this.selectedSoundCategories[type.id] =
          category?.id || 'classic';

        this.selectedSounds[type.id] = savedPath;

        return;
      }

      this.selectedSoundCategories[type.id] = 'classic';
      this.selectedSounds[type.id] = '';
    });
  }

  getSoundsForType(typeId: string) {
    const categoryId =
      this.selectedSoundCategories[typeId] || 'classic';

    return this.soundCategories.find(
      (category) => category.id === categoryId
    )?.sounds || [];
  }

  changeSoundCategory(typeId: string) {
    const sounds = this.getSoundsForType(typeId);

    this.selectedSounds[typeId] =
      sounds[0]?.path || '';

    this.saveSoundSettings();
  }

  changeSelectedSound() {
    this.saveSoundSettings();
  }

  saveSoundSettings() {
    if (typeof window === 'undefined') return;

    localStorage.setItem(
      'notificationSounds',
      JSON.stringify(this.selectedSounds)
    );
  }

  previewSelectedSound(typeId: string) {
    const path = this.selectedSounds[typeId];

    if (!path) return;

    const audio = new Audio(path);
    audio.volume = 0.8;

    audio.play().catch((error) => {
      console.log('Error probando sonido:', error);
    });
  }

  removeSound(typeId: string) {
    this.selectedSounds[typeId] = '';

    this.saveSoundSettings();
  }

  deleteAvatar(): void {
    if (!this.identity?.image) {
      return;
    }

    const confirmed = confirm(
      '¿Seguro que quieres eliminar tu foto de perfil?'
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    this.userService
      .deleteAvatar(token, this.identity._id)
      .subscribe({
        next: () => {
          this.identity.image = null;

          localStorage.setItem(
            'identity',
            JSON.stringify(this.identity)
          );

          console.log('Avatar eliminado correctamente');
        },

        error: error => {
          console.error('Error al eliminar el avatar:', error);
        }
      });
  }

  openDeleteAccountConfirmation() {
    if (this.isDemo || !this.token) return;

    this.accountDeletionConfirmation = '';
    this.deleteAccountError = '';
    this.confirmingAccountDeletion = true;
  }

  cancelDeleteAccount() {
    if (this.deletingAccount) return;

    this.confirmingAccountDeletion = false;
    this.accountDeletionConfirmation = '';
    this.deleteAccountError = '';
  }

  deleteAccount() {
    if (
      this.isDemo ||
      this.deletingAccount ||
      !this.confirmingAccountDeletion ||
      this.accountDeletionConfirmation.trim() !== 'ELIMINAR'
    ) return;

    const token = localStorage.getItem('token');

    if (!token) {
      this.deleteAccountError =
        'Tu sesión ha caducado. Inicia sesión de nuevo.';
      return;
    }

    this.deletingAccount = true;
    this.deleteAccountError = '';

    this.userService.deleteAccount(token).subscribe({
      next: () => {
        this.socketService.disconnect();

        [
          'token',
          'identity',
          'theme',
          'globalBackground',
          'navBackground',
          'feedBackground',
          'notificationSounds',
          'openChatUser'
        ].forEach(key => localStorage.removeItem(key));

        document.body.style.backgroundImage = '';
        document.documentElement.style.removeProperty('--scroll-color');

        void this.router.navigateByUrl('/login');
      },

      error: (error) => {
        this.deletingAccount = false;

        this.deleteAccountError = error.status === 404
          ? 'La eliminación de cuenta aún no está disponible en el servidor.'
          : error.status === 401 || error.status === 403
            ? 'Tu sesión ha caducado. Inicia sesión de nuevo.'
            : 'No se ha podido confirmar la eliminación. Comprueba tu conexión e inténtalo de nuevo.';
      }
    });
  }

}
