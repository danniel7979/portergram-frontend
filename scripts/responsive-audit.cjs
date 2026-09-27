const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outputDir = path.resolve(__dirname, '../artifacts/responsive-audit');
fs.mkdirSync(outputDir, { recursive: true });

const identity = {
  _id: 'u1',
  sub: 'u1',
  name: 'Daniel',
  surname: 'Porteiro',
  nick: 'danniel7979',
  role: 'ROLE_USER',
  bio: 'Desarrollador web centrado en crear experiencias útiles y con personalidad.',
  location: 'A Coruña',
  profession: 'Desarrollador web',
  website: 'portergram.dev',
  theme: 'neon',
  likeColor: '#00aaff',
  scrollColor: '#00f7ff'
};

const users = [
  identity,
  { _id: 'u2', name: 'Lucía', surname: 'García Fernández', nick: 'lucia.dev' },
  { _id: 'u3', name: 'Marcos', surname: 'Rodríguez', nick: 'marcos.design' },
  { _id: 'u4', name: 'Sara', surname: 'López', nick: 'sara.frontend' },
  { _id: 'u5', name: 'Álex', surname: 'Martínez', nick: 'alex.backend' }
];

const publications = [
  {
    _id: 'p1',
    user: identity,
    text: 'Probando la nueva experiencia responsive de Portergram desde móvil y tablet.',
    created_at: '2026-09-13T19:00:00.000Z',
    files: [],
    likes: [users[1], users[2]],
    dislikes: [],
    comments: [
      {
        _id: 'c1',
        user: users[1],
        text: 'El diseño neón se reconoce al instante.',
        created_at: '2026-09-13T19:05:00.000Z',
        likes: [identity],
        dislikes: [],
        replies: []
      }
    ]
  },
  {
    _id: 'p2',
    user: users[2],
    text: 'Las publicaciones largas deben ajustarse sin provocar scroll horizontal, incluso con palabras-extremadamente-largas-de-prueba.',
    created_at: '2026-09-13T18:00:00.000Z',
    files: [],
    likes: [],
    dislikes: [users[3]],
    comments: []
  }
];

const gardenElements = [
  { id: 'garden-ground', name: 'Terreno', x: 0, y: 66, width: 100, height: 34, scale: 1, layer: 1 },
  { id: 'garden-cactus', name: 'Cactus', variant: 'complete', stageId: 'complete', x: 46, y: 36, width: 10, height: 32, scale: 1, layer: 4, animation: 'cactus-idle' },
  { id: 'garden-branch-1', name: 'Rama derecha', variant: 'complete', stageId: 'complete', x: 58, y: 49, width: 12, height: 18, scale: 1, layer: 4, animation: 'branch-sway' },
  { id: 'garden-branch-2', name: 'Rama izquierda', variant: 'complete', stageId: 'complete', x: 31, y: 51, width: 12, height: 18, scale: 1, layer: 4, animation: 'branch-sway' },
  { id: 'garden-branch-3', name: 'Rama superior', variant: 'complete', stageId: 'complete', x: 49, y: 29, width: 12, height: 18, scale: 1, layer: 4, animation: 'branch-sway' },
  { id: 'garden-flower-1', name: 'Flor azul', variant: 'complete', stageId: 'complete', x: 70, y: 46, width: 7, height: 7, scale: 1, layer: 5, animation: 'flower-bloom' },
  { id: 'garden-flower-2', name: 'Flor violeta', variant: 'complete', stageId: 'complete', x: 24, y: 44, width: 7, height: 7, scale: 1, layer: 5, animation: 'flower-bloom' },
  { id: 'garden-flower-3', name: 'Flor roja', variant: 'complete', stageId: 'complete', x: 57, y: 25, width: 7, height: 7, scale: 1, layer: 5, animation: 'flower-bloom' },
  { id: 'garden-butterfly-1', name: 'Mariposa azul', variant: 'complete', stageId: 'complete', x: 18, y: 34, width: 7, height: 7, scale: 1, layer: 6, animation: 'butterfly-fly' },
  { id: 'garden-butterfly-2', name: 'Mariposa violeta', variant: 'complete', stageId: 'complete', x: 78, y: 34, width: 7, height: 7, scale: 1, layer: 6, animation: 'butterfly-fly' },
  { id: 'garden-butterfly-3', name: 'Mariposa roja', variant: 'complete', stageId: 'complete', x: 35, y: 17, width: 6, height: 6, scale: 1, layer: 6, animation: 'butterfly-fly' },
  { id: 'garden-butterfly-4', name: 'Mariposa naranja', variant: 'complete', stageId: 'complete', x: 67, y: 13, width: 6, height: 6, scale: 1, layer: 6, animation: 'butterfly-fly' },
  { id: 'garden-gnome-house', name: 'Casa de los gnomos', variant: 'complete', stageId: 'complete', x: 4, y: 66, width: 26, height: 24, scale: 1, layer: 2 },
  { id: 'garden-gnome-path', name: 'Camino de los gnomos', variant: 'complete', stageId: 'complete', x: 4, y: 73, width: 92, height: 22, scale: 1, layer: 2 },
  { id: 'garden-gnome-1', name: 'Gnomo uno', variant: 'complete', stageId: 'complete', x: 10, y: 68, width: 14, height: 18, scale: 1, layer: 5 },
  { id: 'garden-gnome-2', name: 'Gnomo dos', variant: 'complete', stageId: 'complete', x: 31, y: 74, width: 13, height: 17, scale: 1, layer: 5 },
  { id: 'garden-lake', name: 'Lago', variant: 'complete', stageId: 'complete', x: 55, y: 72, width: 42, height: 22, scale: 1, layer: 2, animation: 'water-idle' },
  { id: 'garden-ducks', name: 'Patos', variant: 'complete', stageId: 'complete', x: 59, y: 74, width: 36, height: 17, scale: 1, layer: 5 },
  { id: 'garden-frog', name: 'Rana', variant: 'lilypad', stageId: 'lilypad', x: 57, y: 79, width: 13, height: 11, scale: 1, layer: 6 }
];

function jsonFor(url) {
  const pathname = new URL(url).pathname;
  if (pathname.endsWith('/publications/1')) return { publications };
  if (pathname.includes('/publications-user/')) return { publications };
  if (pathname.includes('/counters/')) return { following: 3, followed: 12, publications: 2, likesReceived: 14 };
  if (pathname.endsWith('/stories')) return { stories: [] };
  if (pathname.endsWith('/my-world/aside')) return { world: null };
  if (pathname.endsWith('/my-world')) return {
    world: { worldType: 'garden', visualElements: gardenElements },
    progression: { visualState: { full: gardenElements } },
    stats: { followers: 12, publications: 2 }
  };
  if (pathname.includes('/my-world/user/')) return { world: null };
  if (pathname.endsWith('/users/1')) return { users };
  if (/\/api\/user\//.test(pathname)) return { user: identity };
  if (pathname.endsWith('/following')) return { follows: users.slice(1, 4).map(followed => ({ followed })) };
  if (pathname.endsWith('/followed')) return { follows: users.slice(2, 5).map(user => ({ user })) };
  if (pathname.includes('/conversation/')) return {
    messages: [
      { _id: 'm1', emitter: 'u2', receiver: 'u1', text: 'Hola Daniel, ¿cómo va Portergram?', created_at: 1789320000 },
      { _id: 'm2', emitter: 'u1', receiver: 'u2', text: 'Muy bien, estoy validando la versión responsive.', created_at: 1789320060 }
    ]
  };
  if (pathname.endsWith('/unviewed-messages')) return { unviewed: 0, messages: [] };
  if (pathname.includes('/is-followed/')) return { following: true, followedBy: true };
  return {};
}

const targets = [
  { name: 'login', path: '/login', auth: false },
  { name: 'home', path: '/home', auth: true },
  { name: 'users', path: '/users', auth: true },
  { name: 'profile', path: '/profile/u1', auth: true },
  { name: 'messages', path: '/messages?user=u2', auth: true },
  { name: 'settings', path: '/settings', auth: true },
  { name: 'my-world', path: '/my-world', auth: true }
];

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'user-capture', width: 527, height: 670 },
  { name: 'mobile-wide', width: 540, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 1000 }
];

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const results = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    await context.route('http://localhost:3800/api/**', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(jsonFor(route.request().url())) });
    });
    await context.route('https://images.unsplash.com/**', route => route.abort());

    for (const target of targets) {
      const page = await context.newPage();
      if (target.auth) {
        await page.addInitScript(({ identity }) => {
          localStorage.setItem('token', 'responsive-audit-token');
          localStorage.setItem('identity', JSON.stringify(identity));
          localStorage.setItem('theme', 'neon');
          localStorage.setItem('hasWorld', 'true');
        }, { identity });
      }
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:4200${target.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(350);
      const metrics = await page.evaluate(() => {
        const root = document.documentElement;
        const body = document.body;
        const overflowing = [...document.querySelectorAll('*')]
          .filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.right > window.innerWidth + 1 || rect.left < -1;
          })
          .slice(0, 12)
          .map(el => ({
            tag: el.tagName.toLowerCase(),
            className: typeof el.className === 'string' ? el.className : '',
            left: Math.round(el.getBoundingClientRect().left),
            right: Math.round(el.getBoundingClientRect().right)
          }));
        const selected = {};
        for (const selector of ['.home', '.content', '.sidebar', '.messages-users', '.chat-panel', '.my-world-page']) {
          const el = document.querySelector(selector);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          selected[selector] = {
            top: Math.round(rect.top),
            left: Math.round(rect.left),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            position: style.position,
            display: style.display,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            overflowY: style.overflowY
          };
        }
        return {
          viewport: { width: window.innerWidth, height: window.innerHeight },
          scrollWidth: Math.max(root.scrollWidth, body.scrollWidth),
          clientWidth: root.clientWidth,
          overflowX: Math.max(root.scrollWidth, body.scrollWidth) > root.clientWidth + 1,
          scrollHeight: Math.max(root.scrollHeight, body.scrollHeight),
          clientHeight: root.clientHeight,
          overflowY: Math.max(root.scrollHeight, body.scrollHeight) > root.clientHeight + 1,
          overflowing,
          selected
        };
      });
      if (target.name === 'my-world') {
        await page.evaluate(() => {
          const scroller = document.querySelector('.my-world-page');
          if (scroller) scroller.scrollTop = 0;
        });
      }
      await page.screenshot({ path: path.join(outputDir, `${target.name}-${viewport.name}.png`), fullPage: true });
      if (target.name === 'my-world') {
        await page.evaluate(() => {
          const scroller = document.querySelector('.my-world-page');
          if (scroller) scroller.scrollTop = scroller.scrollHeight;
        });
        await page.waitForTimeout(100);
        await page.screenshot({ path: path.join(outputDir, `${target.name}-${viewport.name}-bottom.png`), fullPage: true });
      }
      results.push({ page: target.name, viewport: viewport.name, ...metrics, errors });
      await page.close();
    }
    await context.close();
  }

  fs.writeFileSync(path.join(outputDir, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
