// User-agent detection is deliberately limited to known app markers. It cannot
// identify every embedded browser or guarantee an external browser will open.
export function detectEmbeddedBrowser(userAgent) {
  if (typeof userAgent !== 'string') return null;
  const app = /Zalo/i.test(userAgent) ? 'Zalo'
    : /Instagram/i.test(userAgent) ? 'Instagram'
    : /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Messenger/i.test(userAgent) ? 'Facebook hoặc Messenger'
    : /\bLine\//i.test(userAgent) ? 'LINE'
    : /TikTok|BytedanceWebview|musical_ly/i.test(userAgent) ? 'TikTok'
    : /\bTwitter\b|\bGSA\//i.test(userAgent) ? 'ứng dụng'
    : /Android.*;\s*wv\)/i.test(userAgent) ? 'ứng dụng' : null;
  if (!app) return null;
  const platform = /iPhone|iPad|iPod/i.test(userAgent) ? 'ios'
    : /Android/i.test(userAgent) ? 'android' : 'other';
  return { app, platform };
}

export function browserLink(href) {
  const url = new URL(href);
  // Never copy query strings or fragments that could later contain credentials.
  return `${url.origin}${url.pathname}`;
}

export function androidBrowserIntent(href) {
  const url = new URL(href);
  if (url.protocol !== 'https:') return null;
  return `intent://${url.host}${url.pathname}#Intent;action=android.intent.action.VIEW;scheme=https;end`;
}

export function showBrowserGate(info, { document, navigator, location }) {
  const intro = document.querySelector('#intro');
  intro.remove();
  const url = browserLink(location.href);
  const page = document.createElement('main');
  page.className = 'browser-gate';
  page.innerHTML = `<section class="browser-gate-card" aria-labelledby="browser-gate-title"><img class="browser-gate-logo" src="/logo-tttemple.webp" width="800" height="452" alt="TT Temple"><p class="browser-gate-eyebrow">MỘT KHOẢNG LẶNG CHUNG</p><h1 id="browser-gate-title">Mở bằng trình duyệt của máy</h1><p class="browser-gate-description"></p><ol class="browser-gate-steps"></ol><a class="browser-gate-open" hidden>Mở bằng trình duyệt</a><label for="browser-gate-link">Liên kết game</label><div class="browser-gate-copy"><input id="browser-gate-link" type="text" readonly><button type="button">Sao chép</button></div><p class="browser-gate-feedback" role="status" aria-live="polite"></p></section>`;
  const browser = info.platform === 'ios' ? 'Safari' : info.platform === 'android' ? 'trình duyệt của máy' : 'trình duyệt của máy';
  page.querySelector('.browser-gate-description').textContent = `Thí chủ đang mở game trong ${info.app}. Để chơi ổn định, vui lòng mở liên kết bằng ${browser}.`;
  const steps = page.querySelector('.browser-gate-steps');
  for (const text of [
    `Chọn menu của ${info.app} và tìm “Mở bằng trình duyệt”${info.platform === 'ios' ? ' hoặc “Mở trong Safari”' : ''}.`,
    `Nếu không thấy tùy chọn này, sao chép liên kết bên dưới rồi dán vào ${browser}.`,
  ]) { const item = document.createElement('li'); item.textContent = text; steps.append(item); }
  const input = page.querySelector('input'), feedback = page.querySelector('.browser-gate-feedback');
  input.value = url;
  input.addEventListener('focus', () => input.select());
  page.querySelector('button').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      feedback.textContent = `Đã sao chép. Mở ${browser} và dán liên kết vào thanh địa chỉ.`;
    } catch {
      input.focus(); input.select();
      feedback.textContent = 'Hãy nhấn giữ liên kết đã chọn và chọn Sao chép.';
    }
  });
  const open = page.querySelector('.browser-gate-open');
  const intent = info.platform === 'android' ? androidBrowserIntent(url) : null;
  if (intent) { open.href = intent; open.hidden = false; }
  document.body.append(page);
}
