import { detectEmbeddedBrowser, showBrowserGate } from './browser-gate.js';
import './browser-gate.css';

const embedded = detectEmbeddedBrowser(navigator.userAgent);
if (embedded) {
  showBrowserGate(embedded, { document, navigator, location });
} else {
  import('./main.js').catch(() => {
    document.querySelector('#intro-status').textContent = 'Không thể tải game. Thí chủ hãy thử tải lại.';
    document.querySelector('#intro-retry').hidden = false;
  });
}
