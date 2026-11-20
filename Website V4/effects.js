const desktopEffects = matchMedia(
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
);
const wordmark = document.querySelector('.wordmark');
const signalSlice = document.querySelector('.signal-slice');
const cursor = document.querySelector('.cursor');
const cursorTip = document.querySelector('.crosshair--tip');
const cursorGhost = document.querySelector('.crosshair--ghost');

let flickerTimer;
let cursorFrame;
let previousFrameTime;
let pointerX = 0;
let pointerY = 0;
let ghostX = 0;
let ghostY = 0;

function scheduleFlicker(minDelay, maxDelay) {
  const delay = minDelay + Math.random() * (maxDelay - minDelay);
  flickerTimer = setTimeout(() => {
    const direction = Math.random() < 0.5 ? -1 : 1;
    const lineStart = Math.random() < 0.5 ? 12 : 60;
    wordmark.style.setProperty('--signal-top', `${lineStart + Math.random() * 24}%`);
    wordmark.style.setProperty('--signal-height', `${7 + Math.random() * 5}%`);
    wordmark.style.setProperty('--signal-shift', `${direction * (14 + Math.random() * 12)}px`);
    wordmark.classList.add('is-flickering');
    scheduleFlicker(1600, 3400);
  }, delay);
}

function drawCrosshair(element, x, y) {
  element.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}

function updateCursor(time) {
  const elapsed = previousFrameTime === undefined ? 1000 / 60 : time - previousFrameTime;
  const dx = ghostX - pointerX;
  const dy = ghostY - pointerY;
  const distance = Math.hypot(dx, dy);
  const lag = Math.min(distance * Math.exp(-elapsed / 36), 18);
  const trailing = lag > 0.65;
  const fraction = trailing ? lag / distance : 0;

  ghostX = pointerX + dx * fraction;
  ghostY = pointerY + dy * fraction;
  drawCrosshair(cursorTip, pointerX, pointerY);
  drawCrosshair(cursorGhost, ghostX, ghostY);
  cursor.classList.toggle('is-trailing', trailing);

  previousFrameTime = trailing ? time : undefined;
  cursorFrame = trailing ? requestAnimationFrame(updateCursor) : undefined;
}

function moveCursor(event) {
  if (!desktopEffects.matches || document.hidden || event.pointerType !== 'mouse') return;

  pointerX = event.clientX;
  pointerY = event.clientY;

  if (cursor.hidden) {
    ghostX = pointerX;
    ghostY = pointerY;
    drawCrosshair(cursorTip, pointerX, pointerY);
    cursor.hidden = false;
    document.documentElement.classList.add('has-custom-cursor');
  }

  cursorFrame ??= requestAnimationFrame(updateCursor);
}

function hideCursor() {
  cancelAnimationFrame(cursorFrame);
  cursorFrame = undefined;
  previousFrameTime = undefined;
  cursor.hidden = true;
  cursor.classList.remove('is-trailing');
  document.documentElement.classList.remove('has-custom-cursor');
}

function syncEffects() {
  clearTimeout(flickerTimer);
  wordmark.classList.remove('is-flickering');

  if (desktopEffects.matches && !document.hidden) {
    scheduleFlicker(800, 1500);
  } else {
    hideCursor();
  }
}

signalSlice.addEventListener('animationend', (event) => {
  if (event.target === signalSlice) wordmark.classList.remove('is-flickering');
});
document.addEventListener('visibilitychange', syncEffects);
document.documentElement.addEventListener('pointerleave', hideCursor);
window.addEventListener('pointermove', moveCursor, { passive: true });
window.addEventListener('blur', hideCursor);
desktopEffects.addEventListener('change', syncEffects);
syncEffects();
