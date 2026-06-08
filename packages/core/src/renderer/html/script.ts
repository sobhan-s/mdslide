export const script = `

<script>

(function () {
  const slides = document.querySelectorAll('.slide');
  const progressBar = document.getElementById('progressBar');
  const hudCounter = document.getElementById('dokCounter');
  const btnPrev = document.getElementById('dokPrev');
  const btnNext = document.getElementById('dokNext');
  const btnFullscreen = document.getElementById('dokFullscreen');

  let current = 0;

  function show(index) {
    slides.forEach(function (s, i) {
      const isCurrent = i === index;
      if (isCurrent) {
        s.classList.add('active');
        s.classList.remove('past');
      }

      // Render time visual scaling calculation
      const content = s.querySelector('.slide-content');
      if (content) {
        content.style.transform = 'none';
        content.style.width = '100%';
        content.style.transformOrigin = 'top left';

        const slideHeight = s.clientHeight;
        const contentHeight = content.scrollHeight;
        const title = s.querySelector('.slide-title');
        const titleHeight = title ? title.clientHeight : 0;
        const availableHeight = slideHeight - titleHeight - 160;

        if (contentHeight > availableHeight && availableHeight > 0) {
          const scale = availableHeight / contentHeight;
          if (scale >= 0.7) {
            content.style.transform = 'scale(' + scale + ')';
            content.style.width = 100 / scale + '%';
          }
        }
      } else {
        s.classList.remove('active');
        if (i < index) {
          s.classList.add('past');
        } else {
          s.classList.remove('past');
        }
      }
    });

    // Update progress bar width
    if (progressBar && slides.length > 0) {
      const progress = ((index + 1) / slides.length) * 100;
      progressBar.style.width = progress + '%';
    }

    // Update DOK text counter
    if (hudCounter) {
      hudCounter.textContent = index + 1 + ' / ' + slides.length;
    }
  }

  // Hndler of next slide
  function nextSlide() {
    current = Math.min(current + 1, slides.length - 1);
    show(current);
  }

  // Hndler of previous slide
  function prevSlide() {
    current = Math.max(current - 1, 0);
    show(current);
  }

  // Hndler of the full screen toggle
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(function (err) {
        console.error('Error enabling fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  // Navigation of keyBoard
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'f') {
      toggleFullscreen();
    }
  });

  // Floating DOK Display Vislibility on Mouse Move
  if (btnPrev) btnPrev.addEventListener('click', prevSlide);
  if (btnNext) btnNext.addEventListener('click', nextSlide);
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);

  // Floating DOK Display Visibility on Mouse Move
  let hudTimeout;
  document.body.classList.add('showDok');
  document.addEventListener('mousemove', function () {
    document.body.classList.add('showDok');
    clearTimeout(hudTimeout);
    hudTimeout = setTimeout(function () {
      document.body.classList.remove('show-hud');
    }, 2500);
  });

  show(0);
})();

</script>

`;
