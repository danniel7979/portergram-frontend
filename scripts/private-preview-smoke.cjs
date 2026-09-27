const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());

  await page.goto('http://127.0.0.1:4200/login?privatePreview=1', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Entrar en la versión privada' }).click();
  await page.waitForURL('**/home');
  await page.locator('.new-post textarea').fill('Publicación creada durante la prueba funcional privada.');
  await page.locator('.publish-btn').click();
  await page.getByText('Publicación creada durante la prueba funcional privada.').waitFor();

  await page.locator('.mobile-nav-toggle').click();
  await page.waitForTimeout(350);
  const drawerVisible = await page.locator('.sidebar').evaluate(element => {
    const rect = element.getBoundingClientRect();
    return rect.left >= -1 && rect.right <= window.innerWidth + 1;
  });
  await page.getByRole('link', { name: /Usuarios/ }).click();
  await page.waitForURL('**/users');
  await page.waitForTimeout(250);
  const userCards = await page.locator('.user-card').count();

  await page.locator('.message-btn').first().click();
  await page.locator('.chat-widget').waitFor();
  await page.locator('.chat-input input').fill('Mensaje de prueba responsive.');
  await page.locator('.chat-input button').filter({ hasText: 'Enviar' }).click();
  await page.getByText('Mensaje de prueba responsive.').waitFor();

  await page.goto('http://127.0.0.1:4200/messages?user=preview-lucia', { waitUntil: 'networkidle' });
  const messagesVisible = await page.locator('.chat-message').count();
  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

  console.log(JSON.stringify({
    route: new URL(page.url()).pathname,
    drawerVisible,
    userCards,
    messagesVisible,
    overflowX,
    pageErrors: errors
  }, null, 2));

  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
