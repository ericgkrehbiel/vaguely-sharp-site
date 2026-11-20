const motionEffects = matchMedia('(prefers-reduced-motion: no-preference)');
const desktopCursor = matchMedia(
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
);
const wordmark = document.querySelector('.wordmark');
const signalSlice = document.querySelector('.signal-slice');
const cursor = document.querySelector('.cursor');
const cursorTip = document.querySelector('.crosshair--tip');
const cursorGhost = document.querySelector('.crosshair--ghost');
const favicon = document.querySelector('link[rel="icon"]');
const stillFavicon = favicon.href;
const faviconStrip = new Image();
const faviconCanvas = document.createElement('canvas');
const faviconContext = faviconCanvas.getContext('2d');
const faviconFrames = [];

let flickerTimer;
let faviconTimer;
let faviconFrame = 0;
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
  if (!desktopCursor.matches || document.hidden || event.pointerType !== 'mouse') return;

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

function advanceFavicon() {
  const size = faviconCanvas.width;
  faviconFrame = (faviconFrame + 1) % (faviconStrip.naturalWidth / size);

  // Updating the link lets the globe rotate in browsers with static GIF favicons.
  if (!faviconFrames[faviconFrame]) {
    faviconContext.clearRect(0, 0, size, size);
    faviconContext.drawImage(faviconStrip, faviconFrame * size, 0, size, size, 0, 0, size, size);
    faviconFrames[faviconFrame] = faviconCanvas.toDataURL();
  }
  favicon.href = faviconFrames[faviconFrame];
}

function syncFavicon() {
  if (!motionEffects.matches || document.hidden) {
    clearInterval(faviconTimer);
    faviconTimer = undefined;
    faviconFrame = 0;
    if (favicon.href !== stillFavicon) favicon.href = stillFavicon;
    return;
  }

  if (!faviconContext) return;
  if (!faviconStrip.hasAttribute('src')) {
    faviconStrip.src = new URL('globe-favicon-frames.webp', stillFavicon).href;
  }
  if (faviconFrames.length && faviconTimer === undefined) {
    faviconTimer = setInterval(advanceFavicon, 120);
  }
}

function syncEffects() {
  clearTimeout(flickerTimer);
  wordmark.classList.remove('is-flickering');

  if (motionEffects.matches && !document.hidden) {
    scheduleFlicker(800, 1500);
  }

  if (!desktopCursor.matches || document.hidden) {
    hideCursor();
  }

  syncFavicon();
}

faviconStrip.addEventListener('load', () => {
  faviconCanvas.width = faviconCanvas.height = faviconStrip.naturalHeight;
  faviconFrames[0] = stillFavicon;
  syncFavicon();
});
signalSlice.addEventListener('animationend', (event) => {
  if (event.target === signalSlice) wordmark.classList.remove('is-flickering');
});
document.addEventListener('visibilitychange', syncEffects);
document.documentElement.addEventListener('pointerleave', hideCursor);
window.addEventListener('pointermove', moveCursor, { passive: true });
window.addEventListener('blur', hideCursor);
motionEffects.addEventListener('change', syncEffects);
desktopCursor.addEventListener('change', hideCursor);
syncEffects();
