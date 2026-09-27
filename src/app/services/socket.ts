import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { isPrivatePreview } from './private-preview-api.interceptor';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;
  private currentUserId: string | null = null;

  constructor() {

    this.socket = io('http://localhost:3800', {
      reconnection: true,
      autoConnect: !isPrivatePreview()
    });

    this.socket.on('connect', () => {

      console.log(
        'SOCKET CONECTADO:',
        this.socket.id
      );

      if (this.currentUserId) {

        console.log(
          'REIDENTIFICANDO USUARIO SOCKET:',
          this.currentUserId
        );

        this.socket.emit(
          'user-online',
          this.currentUserId
        );
      }

    });

    this.socket.on('disconnect', reason => {

      console.log(
        'SOCKET DESCONECTADO:',
        reason
      );

    });

  }

  userOnline(userId: string) {

    this.currentUserId = userId;

    if (!this.socket.connected && !isPrivatePreview()) {
      this.socket.connect();
    }

    if (this.socket.connected) {

      this.socket.emit(
        'user-online',
        userId
      );

    }

  }

  disconnect() {
    this.currentUserId = null;
    this.socket.disconnect();
  }

  listenOnlineUsers(
    callback: (users: string[]) => void
  ) {

    this.socket.off('online-users');

    this.socket.on(
      'online-users',
      callback
    );

  }

  sendPrivateMessage(message: any) {

    this.socket.emit(
      'private-message',
      message
    );

  }

  listenNewMessage(
    callback: (message: any) => void
  ) {

    this.socket.off('new-message');

    this.socket.on(
      'new-message',
      callback
    );

  }

  sendBuzz(data: any) {

    this.socket.emit(
      'buzz',
      data
    );

  }

  listenBuzz(
    callback: (data: any) => void
  ) {

    this.socket.off('receive-buzz');

    this.socket.on(
      'receive-buzz',
      callback
    );

  }

}
