export const NAV_SCRIPT = `
<script>
(function () {
  const slides = document.querySelectorAll('.slide');
  const counter = document.getElementById('slide-counter');
  let current = 0;

  function show(index) {
    slides.forEach(function (s, i) {
      s.style.display = i === index ? 'flex' : 'none';
    });
    if (counter) counter.textContent = (index + 1) + ' / ' + slides.length;
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      current = Math.min(current + 1, slides.length - 1);
    } else if (e.key === 'ArrowLeft') {
      current = Math.max(current - 1, 0);
    } else if (e.key === 'f') {
      document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen?.();
    }
    show(current);
  });

  show(0);
}());
</script>`;

export const DEFAULT_THEME = 'light';
export const DEFAULT_TITLE = 'Presentation';
