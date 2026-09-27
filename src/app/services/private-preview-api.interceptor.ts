import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { of } from 'rxjs';

const STORAGE_KEY = 'portergram-private-preview-state-v1';

export const isPrivatePreview = (): boolean => {
  if (typeof window === 'undefined') return false;

  const host = window.location.hostname;
  const forced = new URLSearchParams(window.location.search).get('privatePreview') === '1';
  const previewSession = localStorage.getItem('token') === 'portergram-private-preview-token';

  return forced || previewSession || (host !== 'localhost' && host !== '127.0.0.1');
};

const owner = {
  _id: 'preview-owner',
  sub: 'preview-owner',
  name: 'Daniel',
  surname: 'Porteiro',
  nick: 'danniel7979',
  email: 'daniel@portergram.local',
  role: 'ROLE_ADMIN',
  bio: 'Desarrollador web centrado en crear experiencias útiles y con personalidad.',
  location: 'A Coruña',
  profession: 'Desarrollador web',
  website: 'portergram.dev',
  theme: 'neon',
  likeColor: '#00aaff',
  scrollColor: '#00f7ff',
  isPrivate: true
};

const previewUsers = [
  owner,
  { _id: 'preview-lucia', name: 'Lucía', surname: 'García Fernández', nick: 'lucia.dev' },
  { _id: 'preview-marcos', name: 'Marcos', surname: 'Rodríguez', nick: 'marcos.design' },
  { _id: 'preview-sara', name: 'Sara', surname: 'López', nick: 'sara.frontend' },
  { _id: 'preview-alex', name: 'Álex', surname: 'Martínez', nick: 'alex.backend' }
];

const createDefaultState = () => ({
  users: previewUsers,
  following: ['preview-lucia', 'preview-marcos', 'preview-sara'],
  followers: ['preview-marcos', 'preview-sara', 'preview-alex'],
  publications: [
    {
      _id: 'preview-publication-1',
      user: owner,
      text: 'Probando la nueva experiencia responsive de Portergram desde móvil y tablet.',
      created_at: '2026-09-13T19:00:00.000Z',
      files: [],
      likes: [previewUsers[1], previewUsers[2]],
      dislikes: [],
      comments: [
        {
          _id: 'preview-comment-1',
          user: previewUsers[1],
          text: 'El diseño neón se reconoce al instante.',
          created_at: '2026-09-13T19:05:00.000Z',
          likes: [owner],
          dislikes: [],
          replies: []
        }
      ]
    },
    {
      _id: 'preview-publication-2',
      user: previewUsers[2],
      text: 'Las publicaciones largas ya se ajustan sin provocar desplazamiento horizontal.',
      created_at: '2026-09-13T18:00:00.000Z',
      files: [],
      likes: [],
      dislikes: [previewUsers[3]],
      comments: []
    }
  ],
  messages: [
    {
      _id: 'preview-message-1',
      emitter: 'preview-lucia',
      receiver: 'preview-owner',
      text: 'Hola Daniel, ¿cómo va Portergram?',
      created_at: 1789320000
    },
    {
      _id: 'preview-message-2',
      emitter: 'preview-owner',
      receiver: 'preview-lucia',
      text: 'Muy bien, estoy validando la versión responsive.',
      created_at: 1789320060
    }
  ],
  stories: [],
  world: {
    worldType: 'garden',
    worldName: 'Jardín',
    icon: '🌵',
    level: 4,
    experience: 320,
    levelProgress: 64,
    unlockedCount: 1,
    totalElements: 8,
    completionPercentage: 12,
    visualElements: [],
    nextUnlock: null,
    newUnlocks: []
  }
});

const loadState = (): any => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const state = createDefaultState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
};

const persist = (state: any): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const response = (body: any) => of(new HttpResponse({ status: 200, body }));
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const userIdOf = (entry: any): string => String(typeof entry === 'object' ? entry?._id : entry);

const toggleUser = (items: any[], user: any): any[] => {
  const exists = items.some(item => userIdOf(item) === user._id);
  return exists ? items.filter(item => userIdOf(item) !== user._id) : [...items, user];
};

const findPublication = (state: any, publicationId: string) =>
  state.publications.find((publication: any) => publication._id === publicationId);

const findComment = (publication: any, commentId: string) =>
  publication?.comments?.find((comment: any) => comment._id === commentId);

const bodyValue = (body: any, key: string, fallback: any = ''): any => {
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return body.get(key) ?? fallback;
  }

  return body?.[key] ?? fallback;
};

export const privatePreviewApiInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  if (!isPrivatePreview() || !request.url.includes('/api/')) return next(request);

  const path = new URL(request.url, window.location.origin).pathname.replace(/^\/api/, '');
  const method = request.method.toUpperCase();
  const state = loadState();
  const currentUser = state.users.find((user: any) => user._id === 'preview-owner') || owner;

  if (path === '/login' && method === 'POST') {
    return response(bodyValue(request.body, 'gettoken', false)
      ? { token: 'portergram-private-preview-token' }
      : { user: currentUser });
  }

  if (path === '/register' && method === 'POST') {
    const newUser = { ...(request.body as object), _id: id('preview-user'), role: 'ROLE_USER' };
    state.users.push(newUser);
    persist(state);
    return response({ user: newUser });
  }

  if (path === '/forgot-password' && method === 'POST') {
    return response({ resetLink: `${window.location.origin}/reset-password/private-preview` });
  }

  if (path.startsWith('/reset-password/') && method === 'POST') {
    return response({ status: 'success' });
  }

  if (/^\/users\/\d+$/.test(path) && method === 'GET') {
    return response({ users: state.users });
  }

  if (path.startsWith('/user/') && method === 'GET') {
    const requestedId = path.split('/').pop();
    return response({ user: state.users.find((user: any) => user._id === requestedId) || currentUser });
  }

  if (path.startsWith('/counters/') && method === 'GET') {
    return response({
      following: state.following.length,
      followed: state.followers.length,
      publications: state.publications.length,
      likesReceived: state.publications.reduce((sum: number, pub: any) => sum + (pub.likes?.length || 0), 0)
    });
  }

  if (path === '/following' && method === 'GET') {
    return response({
      follows: state.following.map((followedId: string) => ({
        followed: state.users.find((user: any) => user._id === followedId)
      })).filter((follow: any) => follow.followed)
    });
  }

  if (path === '/followed' && method === 'GET') {
    return response({
      follows: state.followers.map((followerId: string) => ({
        user: state.users.find((user: any) => user._id === followerId)
      })).filter((follow: any) => follow.user)
    });
  }

  if (path === '/follow' && method === 'POST') {
    const followedId = bodyValue(request.body, 'followed');
    if (!state.following.includes(followedId)) state.following.push(followedId);
    persist(state);
    return response({ status: 'success' });
  }

  if (path.startsWith('/unfollow/') && method === 'DELETE') {
    const followedId = path.split('/').pop();
    state.following = state.following.filter((value: string) => value !== followedId);
    persist(state);
    return response({ status: 'success' });
  }

  if (path.startsWith('/get-my-follows/') && method === 'GET') {
    const requestedId = path.split('/').pop();
    return response({ following: state.following.includes(requestedId) });
  }

  if (path.startsWith('/is-followed/') && method === 'GET') {
    const requestedId = path.split('/').pop();
    return response({ followedBy: state.followers.includes(requestedId) });
  }

  if (path === '/publications/1' && method === 'GET') {
    return response({ publications: state.publications });
  }

  if (path.startsWith('/publications-user/') && method === 'GET') {
    const requestedId = path.split('/').pop();
    return response({
      publications: state.publications.filter((publication: any) => publication.user?._id === requestedId)
    });
  }

  if (path === '/publication' && method === 'POST') {
    const publication = {
      _id: id('preview-publication'),
      user: currentUser,
      text: bodyValue(request.body, 'text'),
      created_at: new Date().toISOString(),
      files: [],
      likes: [],
      dislikes: [],
      comments: []
    };
    state.publications.unshift(publication);
    persist(state);
    return response({ publication });
  }

  if (path.startsWith('/publication/upload-image/') && method === 'POST') {
    const publication = findPublication(state, path.split('/').pop() || '');
    return response({ publication });
  }

  if (/^\/publication\/[^/]+$/.test(path) && method === 'DELETE') {
    const publicationId = path.split('/').pop();
    state.publications = state.publications.filter((publication: any) => publication._id !== publicationId);
    persist(state);
    return response({ status: 'success' });
  }

  const publicationReaction = path.match(/^\/publication\/(like|dislike)\/([^/]+)$/);
  if (publicationReaction && method === 'POST') {
    const publication = findPublication(state, publicationReaction[2]);
    if (publicationReaction[1] === 'like') {
      publication.likes = toggleUser(publication.likes || [], currentUser);
      publication.dislikes = (publication.dislikes || []).filter((item: any) => userIdOf(item) !== currentUser._id);
    } else {
      publication.dislikes = toggleUser(publication.dislikes || [], currentUser);
      publication.likes = (publication.likes || []).filter((item: any) => userIdOf(item) !== currentUser._id);
    }
    persist(state);
    return response({ publication });
  }

  const commentCreate = path.match(/^\/publication\/comment\/([^/]+)$/);
  if (commentCreate && method === 'POST') {
    const publication = findPublication(state, commentCreate[1]);
    const comment = {
      _id: id('preview-comment'),
      user: currentUser,
      text: bodyValue(request.body, 'text'),
      created_at: new Date().toISOString(),
      likes: [],
      dislikes: [],
      replies: []
    };
    publication.comments = publication.comments || [];
    publication.comments.unshift(comment);
    persist(state);
    return response({ comment, publication });
  }

  const commentDelete = path.match(/^\/publication\/comment\/([^/]+)\/([^/]+)$/);
  if (commentDelete && method === 'DELETE') {
    const publication = findPublication(state, commentDelete[1]);
    publication.comments = (publication.comments || []).filter((comment: any) => comment._id !== commentDelete[2]);
    persist(state);
    return response({ publication });
  }

  const commentReaction = path.match(/^\/publication\/comment\/(like|dislike)\/([^/]+)\/([^/]+)$/);
  if (commentReaction && method === 'POST') {
    const publication = findPublication(state, commentReaction[2]);
    const comment = findComment(publication, commentReaction[3]);
    if (commentReaction[1] === 'like') {
      comment.likes = toggleUser(comment.likes || [], currentUser);
      comment.dislikes = (comment.dislikes || []).filter((item: any) => userIdOf(item) !== currentUser._id);
    } else {
      comment.dislikes = toggleUser(comment.dislikes || [], currentUser);
      comment.likes = (comment.likes || []).filter((item: any) => userIdOf(item) !== currentUser._id);
    }
    persist(state);
    return response({ publication });
  }

  const replyCreate = path.match(/^\/publication\/comment\/reply\/([^/]+)\/([^/]+)$/);
  if (replyCreate && method === 'POST') {
    const publication = findPublication(state, replyCreate[1]);
    const comment = findComment(publication, replyCreate[2]);
    const reply = {
      _id: id('preview-reply'),
      user: currentUser,
      text: bodyValue(request.body, 'text'),
      created_at: new Date().toISOString(),
      likes: [],
      dislikes: []
    };
    comment.replies = comment.replies || [];
    comment.replies.unshift(reply);
    persist(state);
    return response({ reply, publication });
  }

  if (path === '/message' && method === 'POST') {
    const message = {
      _id: id('preview-message'),
      emitter: currentUser._id,
      receiver: bodyValue(request.body, 'receiver'),
      text: bodyValue(request.body, 'text'),
      created_at: Math.floor(Date.now() / 1000)
    };
    state.messages.unshift(message);
    persist(state);
    return response({ message });
  }

  if (path.startsWith('/conversation/') && method === 'GET') {
    const otherId = path.split('/').pop();
    return response({
      messages: state.messages.filter((message: any) =>
        [message.emitter, message.receiver].includes(currentUser._id) &&
        [message.emitter, message.receiver].includes(otherId))
    });
  }

  if (path === '/unviewed-messages' && method === 'GET') {
    return response({ unviewed: 0, messages: [] });
  }

  if (path === '/stories' && method === 'GET') {
    return response({ stories: state.stories });
  }

  if (path === '/story' && method === 'POST') {
    const story = {
      _id: id('preview-story'),
      user: currentUser,
      icon: String(bodyValue(request.body, 'icon', '💥')),
      text: String(bodyValue(request.body, 'text')),
      media: '',
      created_at: new Date().toISOString()
    };
    state.stories.unshift(story);
    persist(state);
    return response({ story });
  }

  if (path.startsWith('/update-profile-settings/') && method === 'PUT') {
    const userIndex = state.users.findIndex((user: any) => user._id === currentUser._id);
    state.users[userIndex] = { ...state.users[userIndex], ...(request.body as object) };
    state.publications.forEach((publication: any) => {
      if (publication.user?._id === currentUser._id) publication.user = state.users[userIndex];
    });
    persist(state);
    return response({ user: state.users[userIndex] });
  }

  if (path.startsWith('/update-image-user/') && method === 'POST') {
    return response({ user: currentUser });
  }

  if (path.startsWith('/delete-image-user/') && method === 'DELETE') {
    return response({ user: { ...currentUser, image: null } });
  }

  if (path === '/my-world/catalog' && method === 'GET') {
    return response({ worlds: ['garden', 'stadium', 'space-base'] });
  }

  if (path === '/my-world/select' && method === 'POST') {
    const worldType = bodyValue(request.body, 'worldType', 'garden');
    state.world = { ...state.world, worldType };
    persist(state);
    return response({ world: state.world });
  }

  if (path === '/my-world/visibility' && method === 'PUT') {
    return response({ status: 'success', visible: bodyValue(request.body, 'visible', true) });
  }

  if (path === '/my-world' && method === 'GET') {
    return response({
      world: state.world,
      stats: { followers: state.followers.length, publications: state.publications.length },
      progression: { visualState: { full: state.world.visualElements || [] } }
    });
  }

  if ((path === '/my-world/aside' || path.includes('/my-world/user/')) && method === 'GET') {
    return response({ world: state.world });
  }

  return response({ status: 'success' });
};
