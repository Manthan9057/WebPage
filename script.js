/**
 * script.js — Mangalam HDPE Pipes
 *
 * BUGS FIXED vs previous version:
 *  1. Auto-scroll-to-top: removed scrollIntoView() from goToSlide()
 *     — that was scrolling the whole page, not just the thumbnail row
 *  2. Duplicate headers: main-header is now position:fixed (not sticky)
 *     — JS adds/removes .pushed class to shift it below sticky-bar
 *     — only one header is ever visible at a time
 *  3. Hamburger: creates mobile-nav once, never duplicates it
 */

(function () {
  'use strict';

  /* ============================================================
     CACHED DOM REFS
  ============================================================ */
  const stickyBar    = document.getElementById('stickyBar');
  const mainHeader   = document.getElementById('mainHeader');
  const backTopBtn   = document.getElementById('backTop');
  const carPrev      = document.getElementById('carPrev');
  const carNext      = document.getElementById('carNext');
  const carStage     = document.getElementById('carouselStage');
  const thumbRow     = document.getElementById('thumbRow');
  const faqList      = document.getElementById('faqList');
  const processTabsEl= document.getElementById('processTabs');
  const appRail      = document.getElementById('appRail');
  const appPrevBtn   = document.getElementById('appPrev');
  const appNextBtn   = document.getElementById('appNext');
  const mainHamburger= document.getElementById('mainHamburger');
  const stickyHam    = document.getElementById('stickyHamburger');
  const mobileNav    = document.getElementById('mobileNav');

/* ============================================================
   1. STICKY BAR + MAIN HEADER MANAGEMENT
   - Show sticky header after first fold
   - Hide when scrolling upward
   - Smooth transitions
============================================================ */
let lastScrollY = window.scrollY;
let heroBottom = 0;
let ticking = false;

function measureHero() {
  const hero = document.getElementById('hero');

  if (hero) {
    heroBottom = hero.offsetTop + hero.offsetHeight - 120;
  }
}

measureHero();

function updateStickyHeader() {
  const currentY = window.scrollY;

  /* Show only after hero section */
  if (currentY > heroBottom) {

    /* Scrolling down → show sticky */
    if (currentY > lastScrollY + 5) {
      stickyBar.classList.add('visible');
      mainHeader.classList.add('pushed');
    }

    /* Scrolling up → hide sticky */
    else if (currentY < lastScrollY - 5) {
      stickyBar.classList.remove('visible');
      mainHeader.classList.remove('pushed');
    }

  } else {
    stickyBar.classList.remove('visible');
    mainHeader.classList.remove('pushed');
  }

  lastScrollY = currentY;
  ticking = false;
}

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(updateStickyHeader);
    ticking = true;
  }

  /* Back-to-top button */
  if (backTopBtn) {
    backTopBtn.classList.toggle('visible', window.scrollY > 400);
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', measureHero);

  /* ============================================================
     2. BACK TO TOP
        — smooth scroll to top, does NOT trigger on page load
  ============================================================ */
  if (backTopBtn) {
    backTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     3. HAMBURGER / MOBILE NAV
        — works for both main-header and sticky-bar hamburgers
        — toggles mobileNav once (no duplicate injection)
  ============================================================ */
  function toggleMobileNav(open) {
    if (!mobileNav) return;
    mobileNav.classList.toggle('open', open);
    if (mainHamburger) {
      mainHamburger.classList.toggle('open', open);
      mainHamburger.setAttribute('aria-expanded', open);
    }
    if (stickyHam) {
      stickyHam.classList.toggle('open', open);
      stickyHam.setAttribute('aria-expanded', open);
    }
  }

  if (mainHamburger) {
    mainHamburger.addEventListener('click', function () {
      const isOpen = mobileNav && mobileNav.classList.contains('open');
      toggleMobileNav(!isOpen);
    });
  }
  if (stickyHam) {
    stickyHam.addEventListener('click', function () {
      const isOpen = mobileNav && mobileNav.classList.contains('open');
      toggleMobileNav(!isOpen);
    });
  }

  /* Close mobile nav when any link clicked */
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { toggleMobileNav(false); });
    });
  }

  /* Close on Esc */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') toggleMobileNav(false);
  });

  /* ============================================================
     4. IMAGE CAROUSEL
        — goToSlide() does NOT call scrollIntoView (that was
          the cause of the auto-scroll-to-top bug)
        — thumbnail strip is scrolled by adjusting scrollLeft
          directly on the thumb-row container
  ============================================================ */
  const slides = carStage ? Array.from(carStage.querySelectorAll('.slide')) : [];
  const thumbs = thumbRow ? Array.from(thumbRow.querySelectorAll('.thumb')) : [];
  let activeIdx = 0;
  let autoTimer  = null;

  function goToSlide(idx) {
    /* Wrap around */
    if (idx < 0) idx = slides.length - 1;
    if (idx >= slides.length) idx = 0;

    /* Deactivate current */
    if (slides[activeIdx]) slides[activeIdx].classList.remove('active');
    if (thumbs[activeIdx]) thumbs[activeIdx].classList.remove('active');

    activeIdx = idx;

    /* Activate new */
    if (slides[activeIdx]) slides[activeIdx].classList.add('active');
    if (thumbs[activeIdx]) thumbs[activeIdx].classList.add('active');

    /*
      Scroll thumbnail strip so active thumb is visible.
      We use scrollLeft on the container — NOT scrollIntoView()
      which scrolls the entire page.
    */
    if (thumbRow && thumbs[activeIdx]) {
      const thumb    = thumbs[activeIdx];
      const rowRect  = thumbRow.getBoundingClientRect();
      const tRect    = thumb.getBoundingClientRect();
      const offset   = tRect.left - rowRect.left + thumbRow.scrollLeft - rowRect.width / 2 + tRect.width / 2;
      thumbRow.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(function () { goToSlide(activeIdx + 1); }, 4000);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  if (carPrev) carPrev.addEventListener('click', function () { goToSlide(activeIdx - 1); stopAuto(); startAuto(); });
  if (carNext) carNext.addEventListener('click', function () { goToSlide(activeIdx + 1); stopAuto(); startAuto(); });

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      goToSlide(parseInt(thumb.dataset.index, 10));
      stopAuto(); startAuto();
    });
  });

  /* Pause auto-play while user hovers over carousel */
  if (carStage) {
    carStage.addEventListener('mouseenter', stopAuto);
    carStage.addEventListener('mouseleave', startAuto);
  }

  startAuto();

  /* ============================================================
     5. IMAGE ZOOM (lens + floating result on carousel images)
  ============================================================ */
  const ZOOM = 2.8;

  slides.forEach(function (slide) {
    const img    = slide.querySelector('img');
    const lens   = slide.querySelector('.zoom-lens');
    const result = slide.querySelector('.zoom-result');
    const rImg   = result ? result.querySelector('img') : null;

    if (!img || !lens || !result || !rImg) return;

    slide.addEventListener('mousemove', function (e) {
      if (!slide.classList.contains('active')) return;

      const rect  = img.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      const lw = lens.offsetWidth  / 2;
      const lh = lens.offsetHeight / 2;

      x = Math.max(lw, Math.min(x, rect.width  - lw));
      y = Math.max(lh, Math.min(y, rect.height - lh));

      lens.style.left = (x - lw) + 'px';
      lens.style.top  = (y - lh) + 'px';

      const px = (x / rect.width)  * 100;
      const py = (y / rect.height) * 100;

      rImg.style.transformOrigin = px + '% ' + py + '%';
      rImg.style.transform = 'scale(' + ZOOM + ')';
    });

    slide.addEventListener('mouseleave', function () {
      rImg.style.transform = 'scale(1)';
    });
  });

  /* ============================================================
     6. FAQ ACCORDION
  ============================================================ */
  if (faqList) {
    faqList.addEventListener('click', function (e) {
      const btn  = e.target.closest('.faq-btn');
      if (!btn) return;

      const item   = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      const ico    = btn.querySelector('.faq-ico');

      /* Close all */
      faqList.querySelectorAll('.faq-item.open').forEach(function (el) {
        el.classList.remove('open');
        el.querySelector('.faq-btn').setAttribute('aria-expanded', 'false');
        var i = el.querySelector('.faq-ico');
        if (i) i.textContent = '+';
      });

      /* Toggle clicked */
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (ico) ico.textContent = '−';
      }
    });
  }

  /* ============================================================
     7. PROCESS TABS
  ============================================================ */
  if (processTabsEl) {
    processTabsEl.addEventListener('click', function (e) {
      const tab = e.target.closest('.tab');
      if (!tab) return;

      processTabsEl.querySelectorAll('.tab').forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(function (p) {
        p.classList.remove('active');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('tab-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  }

  /* ============================================================
     8. APPLICATIONS CAROUSEL (arrow scroll)
  ============================================================ */
  if (appRail && appPrevBtn && appNextBtn) {
    function getScrollAmt() {
      var card = appRail.querySelector('.app-card');
      return card ? card.offsetWidth + 16 : 276;
    }

    appNextBtn.addEventListener('click', function () {
      appRail.scrollBy({ left: getScrollAmt(), behavior: 'smooth' });
    });
    appPrevBtn.addEventListener('click', function () {
      appRail.scrollBy({ left: -getScrollAmt(), behavior: 'smooth' });
    });

    function updateCtrlOpacity() {
      var max = appRail.scrollWidth - appRail.clientWidth;
      appPrevBtn.style.opacity = appRail.scrollLeft <= 4      ? '0.35' : '1';
      appNextBtn.style.opacity = appRail.scrollLeft >= max - 4 ? '0.35' : '1';
    }
    appRail.addEventListener('scroll', updateCtrlOpacity, { passive: true });
    updateCtrlOpacity();
  }

}());