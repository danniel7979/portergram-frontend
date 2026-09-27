import { Injectable } from '@angular/core';

type SoundType = 'comment' | 'message' | 'like' | 'dislike' | 'story';

@Injectable({
  providedIn: 'root'
})
export class NotificationSoundService {

  private defaultPack = 'classic';

  play(type: SoundType) {
    if (typeof window === 'undefined') return;

    const config: Record<string, string> = JSON.parse(
      localStorage.getItem('notificationSounds') || '{}'
    );

    const sound = config[type];

    if (!sound) return;

    const audio = new Audio(sound);
    audio.volume = 0.8;

    audio.play().catch(err => {
      console.log('ERROR SONIDO:', err);
    });
  }
  preview(pack: string, type: SoundType) {
    const sound = `/sounds/${pack}/${type}.mp3`;

    const audio = new Audio(sound);
    audio.volume = 0.8;

    audio.play().catch(err => {
      console.log('ERROR PREVIEW:', err);
    });
  }
}