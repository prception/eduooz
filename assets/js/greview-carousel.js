/* Standalone Google Reviews carousel init — used on pages that don't load course-landing.js */
(function () {
  'use strict';

  function initReviewCounters() {
    var bar = document.getElementById('greview-stats-bar');
    if (!bar) return;

    var counters = bar.querySelectorAll('.greview-count[data-target]');
    if (!counters.length) return;

    var triggered = false;
    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || triggered) return;
      triggered = true;

      counters.forEach(function (el) {
        var target = parseFloat(el.dataset.target);
        var suffix = el.dataset.suffix || '';
        var isDecimal = target % 1 !== 0;
        var duration = 1600;
        var start = performance.now();

        (function tick(now) {
          var p = Math.min((now - start) / duration, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          var val = target * ease;
          el.textContent = (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });

      observer.disconnect();
    }, { threshold: 0.4 });

    observer.observe(bar);
  }

  function initReviewCarousel() {
    if (typeof window._greviewAutoTimer !== 'undefined') {
      clearInterval(window._greviewAutoTimer);
      window._greviewAutoTimer = undefined;
    }

    var viewport = document.getElementById('greview-carousel-viewport');
    var track = document.getElementById('greview-track');
    var prevBtn = document.getElementById('greview-prev');
    var nextBtn = document.getElementById('greview-next');
    var dotsEl = document.getElementById('greview-dots');

    if (!track || !viewport) return;

    var cards = Array.from(track.querySelectorAll('.greview-card'));
    var GAP = 18;
    var current = 0;
    var autoTimer = null;

    function getVisible() {
      var w = window.innerWidth;
      if (w <= 480) return 1;
      if (w <= 768) return 2;
      return 3;
    }

    function getMax() {
      return Math.max(0, cards.length - getVisible());
    }

    function setWidths() {
      var visible = getVisible();
      var vpW = viewport.offsetWidth;
      var cardW = (vpW - GAP * (visible - 1)) / visible;
      cards.forEach(function (c) {
        c.style.width = cardW + 'px';
        c.style.flexShrink = '0';
      });
    }

    function buildDots() {
      var max = getMax();
      dotsEl.innerHTML = '';
      for (var i = 0; i <= max; i++) {
        (function (idx) {
          var btn = document.createElement('button');
          btn.className = 'greview-dot' + (idx === current ? ' greview-dot-active' : '');
          btn.setAttribute('aria-label', 'Go to review ' + (idx + 1));
          btn.addEventListener('click', function () { goTo(idx); resetAuto(); });
          dotsEl.appendChild(btn);
        })(i);
      }
    }

    function updateDots() {
      Array.from(dotsEl.querySelectorAll('.greview-dot')).forEach(function (d, i) {
        d.classList.toggle('greview-dot-active', i === current);
      });
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, getMax()));
      var visible = getVisible();
      var vpW = viewport.offsetWidth;
      var cardW = (vpW - GAP * (visible - 1)) / visible;
      track.style.transform = 'translateX(-' + current * (cardW + GAP) + 'px)';
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= getMax();
      updateDots();
    }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function () {
        goTo(current >= getMax() ? 0 : current + 1);
      }, 5000);
      window._greviewAutoTimer = autoTimer;
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); resetAuto(); });

    var wrap = document.getElementById('greview-carousel-wrap');
    if (wrap) {
      wrap.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
      wrap.addEventListener('mouseleave', resetAuto);
      wrap.addEventListener('focusin', function () { clearInterval(autoTimer); });
      wrap.addEventListener('focusout', resetAuto);
    }

    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 44) { goTo(current + (diff > 0 ? 1 : -1)); resetAuto(); }
    }, { passive: true });

    [prevBtn, nextBtn].forEach(function (btn) {
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { goTo(current - 1); resetAuto(); }
        if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
      });
    });

    window.addEventListener('resize', function () {
      setWidths();
      buildDots();
      goTo(Math.min(current, getMax()));
    }, { passive: true });

    setWidths();
    buildDots();
    goTo(0);
    resetAuto();
  }

  /* Expose globally so google-reviews.js can call them after rendering */
  window.initReviewCarousel = initReviewCarousel;
  window.initReviewCounters = initReviewCounters;

  /* Auto-init if cards are already in DOM (non-API fallback path) */
  function tryInit() {
    if (document.getElementById('greview-track')) {
      initReviewCounters();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
