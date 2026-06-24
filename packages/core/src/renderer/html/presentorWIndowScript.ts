export const presentorWindowScript = `
function scalePreviews() {
  const currContainer = document
    .getElementById('current-panel')
    .querySelector('.preview-container');
  const nextContainer = document.getElementById('next-panel').querySelector('.preview-container');
  const currPreview = document.getElementById('current-preview');
  const nextPreview = document.getElementById('next-preview');
  if (currContainer && currPreview) {
    const w = currContainer.clientWidth;
    const h = currContainer.clientHeight;
    const scale = Math.min(w / 1920, h / 1080);
    const left = (w - 1920 * scale) / 2;
    const top = (h - 1080 * scale) / 2;
    currPreview.style.transformOrigin = 'top left';
    currPreview.style.transform = 'scale(' + scale + ')';
    currPreview.style.left = left + 'px';
    currPreview.style.top = top + 'px';
  }
  if (nextContainer && nextPreview) {
    const w = nextContainer.clientWidth;
    const h = nextContainer.clientHeight;
    const scale = Math.min(w / 1920, h / 1080);
    const left = (w - 1920 * scale) / 2;
    const top = (h - 1080 * scale) / 2;
    nextPreview.style.transformOrigin = 'top left';
    nextPreview.style.transform = 'scale(' + scale + ')';
    nextPreview.style.left = left + 'px';
    nextPreview.style.top = top + 'px';
  }
}
window.scalePreviews = scalePreviews;
window.addEventListener('resize', scalePreviews);
// Forward keyboard navigation to main window
window.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    window.opener.postMessage('next', '*');
  } else if (e.key === 'ArrowLeft') {
    window.opener.postMessage('prev', '*');
  } else if (e.key === 'p' || e.key === 'P') {
    window.opener.postMessage('togglePresenter', '*');
  }
});
// Run initial scaling
setTimeout(scalePreviews, 100);
`;
