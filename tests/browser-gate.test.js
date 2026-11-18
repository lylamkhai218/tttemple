import test from 'node:test';
import assert from 'node:assert/strict';
import { detectEmbeddedBrowser, browserLink, androidBrowserIntent } from '../src/browser-gate.js';

test('recognizes common in-app browser markers without blocking normal browsers', () => {
  assert.deepEqual(detectEmbeddedBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Zalo'), { app: 'Zalo', platform: 'ios' });
  assert.deepEqual(detectEmbeddedBrowser('Mozilla/5.0 (Linux; Android 13; Pixel 7) [FBAN/FB4A;FBAV/400]'), { app: 'Facebook hoặc Messenger', platform: 'android' });
  assert.deepEqual(detectEmbeddedBrowser('Mozilla/5.0 (Linux; Android 13; Pixel) AppleWebKit/537.36 Version/4.0 Chrome/120.0 Mobile Safari/537.36; wv)'), { app: 'ứng dụng', platform: 'android' });
  assert.equal(detectEmbeddedBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'), null);
  assert.equal(detectEmbeddedBrowser('Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36'), null);
  assert.equal(detectEmbeddedBrowser('Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 CriOS/120.0 Mobile/15E148 Safari/604.1'), null);
});

test('copy and Android intent exclude query strings and fragments', () => {
  const link = 'https://example.com/game?token=secret#fragment';
  assert.equal(browserLink(link), 'https://example.com/game');
  assert.equal(androidBrowserIntent(link), 'intent://example.com/game#Intent;action=android.intent.action.VIEW;scheme=https;end');
  assert.equal(androidBrowserIntent('http://localhost/game'), null);
});
