import { browserSupportsWebAuthn, startAuthentication, startRegistration } from '@simplewebauthn/browser';

const state = { sessionToken: '', registration: null, authentication: null };
const status = document.querySelector('#status');
const accountState = document.querySelector('#account-state');
const enrollmentCode = document.querySelector('#enrollment-code');
const prepareRegisterButton = document.querySelector('#prepare-register');
const registerButton = document.querySelector('#register');
const prepareLoginButton = document.querySelector('#prepare-login');
const loginButton = document.querySelector('#login');

function show(message) { status.textContent = message; }

async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (state.sessionToken) headers.authorization = `Bearer ${state.sessionToken}`;
  const response = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' });
  const result = await response.json().catch(() => ({ ok: false, error: 'invalid_server_response' }));
  if (!response.ok) throw new Error(result.error || `request_${response.status}`);
  return result;
}

async function refreshState() {
  try {
    const data = await api('/api/state');
    accountState.textContent = `Tài khoản: ${data.account}; passkey: ${data.enrolled ? 'đã đăng ký' : 'chưa đăng ký'}; khóa: ${data.locked ? 'đã khóa' : 'chưa khóa'}; phiên trong tab: ${data.sessionValid ? 'hợp lệ' : 'không hợp lệ'}.`;
  } catch {
    accountState.textContent = 'Chưa kết nối Worker cục bộ.';
  }
}

if (!browserSupportsWebAuthn()) {
  show('Trình duyệt hiện tại không hỗ trợ WebAuthn.');
  prepareRegisterButton.disabled = true;
  prepareLoginButton.disabled = true;
}

prepareRegisterButton.addEventListener('click', async () => {
  try {
    const result = await api('/api/webauthn/register/options', {
      method: 'POST',
      body: { enrollmentCode: enrollmentCode.value },
    });
    state.registration = result;
    registerButton.disabled = false;
    show('Đã chuẩn bị. Trong vòng 2 phút, bấm “Tạo passkey trên thiết bị”.');
  } catch (error) {
    state.registration = null;
    registerButton.disabled = true;
    show(`Không chuẩn bị được đăng ký: ${error.message}`);
  }
});

registerButton.addEventListener('click', async () => {
  const pending = state.registration;
  if (!pending) return;
  registerButton.disabled = true;
  try {
    const response = await startRegistration({ optionsJSON: pending.options });
    await api('/api/webauthn/register/verify', {
      method: 'POST',
      body: { enrollmentCode: enrollmentCode.value, challenge: pending.challenge, response },
    });
    state.registration = null;
    show('Passkey tổng hợp đã đăng ký.');
  } catch (error) {
    state.registration = null;
    show(`Đăng ký bị từ chối hoặc đã hủy: ${error.message}`);
  }
  await refreshState();
});

prepareLoginButton.addEventListener('click', async () => {
  try {
    const result = await api('/api/webauthn/authenticate/options', { method: 'POST', body: {} });
    state.authentication = result;
    loginButton.disabled = false;
    show('Đã chuẩn bị. Trong vòng 2 phút, bấm “Đăng nhập bằng passkey”.');
  } catch (error) {
    state.authentication = null;
    loginButton.disabled = true;
    show(`Không chuẩn bị được đăng nhập: ${error.message}`);
  }
});

loginButton.addEventListener('click', async () => {
  const pending = state.authentication;
  if (!pending) return;
  loginButton.disabled = true;
  try {
    const response = await startAuthentication({ optionsJSON: pending.options });
    const result = await api('/api/webauthn/authenticate/verify', {
      method: 'POST',
      body: { challenge: pending.challenge, response },
    });
    state.sessionToken = result.sessionToken;
    state.authentication = null;
    show('Đăng nhập passkey thành công. Phiên thử được giữ trong bộ nhớ tab.');
  } catch (error) {
    state.authentication = null;
    show(`Đăng nhập bị từ chối hoặc đã hủy: ${error.message}`);
  }
  await refreshState();
});

document.querySelector('#check-session').addEventListener('click', async () => {
  try {
    const result = await api('/api/session');
    show(`Phiên hợp lệ cho ${result.account}; company và role đều là dữ liệu giả.`);
  } catch (error) {
    show(`Phiên không hợp lệ: ${error.message}`);
  }
  await refreshState();
});

document.querySelector('#logout').addEventListener('click', async () => {
  try {
    await api('/api/session/logout', { method: 'POST', body: {} });
    state.sessionToken = '';
    show('Đã thu hồi phiên thử của tài khoản.');
  } catch (error) {
    show(`Không thu hồi được phiên: ${error.message}`);
  }
  await refreshState();
});

document.querySelector('#lock-account').addEventListener('click', async () => {
  try {
    await api('/api/synthetic-admin/lock', { method: 'POST', body: { adminCode: enrollmentCode.value } });
    show('Đã khóa tài khoản tổng hợp và thu hồi phiên. Khởi động lại Worker để đặt lại POC.');
  } catch (error) {
    show(`Không khóa được tài khoản thử: ${error.message}`);
  }
  await refreshState();
});

await refreshState();
