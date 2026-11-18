export function createIntro({ intro, app, status, retry, now = () => performance.now(), schedule = setTimeout, reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches }) {
  const started = now();
  let sceneReady = false;
  let assetsReady = false;
  let failed = false;
  let opening = false;
  const slowTimer = schedule(() => {
    if (!opening && !failed) status.textContent = 'Đang tải lâu hơn dự kiến, thí chủ vui lòng chờ...';
  }, 15000);

  function openWhenReady() {
    if (!sceneReady || !assetsReady || failed || opening) return;
    opening = true;
    clearTimeout(slowTimer);
    schedule(() => {
      intro.classList.add('is-opening');
      schedule(() => { app.inert = false; intro.remove(); }, reducedMotion() ? 0 : 1700);
    }, Math.max(0, 650 - (now() - started)));
  }
  return {
    sceneReady() { sceneReady = true; openWhenReady(); },
    assetsReady() { assetsReady = true; openWhenReady(); },
    fail() {
      if (opening || failed) return;
      failed = true;
      clearTimeout(slowTimer);
      status.textContent = 'Không thể tải không gian chùa. Thí chủ hãy thử tải lại.';
      retry.hidden = false;
    },
  };
}
