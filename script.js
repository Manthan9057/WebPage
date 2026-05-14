/**
 * script.js — Mascot Pipes Pro
 * Handles:
 *  1. Sticky header (appears on scroll down, hides on scroll up)
 *  2. Hero image carousel (prev/next + thumbnail click)
 *  3. Image zoom on hover (lens + result preview)
 *  4. FAQ accordion
 *  5. Manufacturing process tabs
 *  6. Applications carousel (arrow controls)
 *  7. Hamburger mobile menu
 *  8. Back-to-top button
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. STICKY HEADER
     - Appears when user scrolls PAST the hero fold (first viewport)
     - Disappears when user scrolls BACK UP above that point
     - Smooth CSS transition handles animation
  ============================================================ */
  const stickyHeader = document.getElementById('stickyHeader');
  const mainHeader   = document.getElementById('mainHeader');
  let lastScrollY = 0;
  let heroHeight  = 0;

  function getSectionHeight() {
    const hero = document.getElementById('hero');
    heroHeight = hero ? hero.offsetHeight : window.innerHeight;
  }
  getSectionHeight();
  window.addEventListener('resize', getSectionHeight);

  function handleScroll() {
    const currentY = window.scrollY;

    if (currentY > heroHeight && currentY > lastScrollY) {
      // Scrolling DOWN past hero → show sticky
      stickyHeader.classList.add('visible');
      stickyHeader.setAttribute('aria-hidden', 'false');
    } else if (currentY < lastScrollY || currentY <= heroHeight) {
      // Scrolling UP or back near top → hide sticky
      stickyHeader.classList.remove('visible');
      stickyHeader.setAttribute('aria-hidden', 'true');
    }

    lastScrollY = currentY;

    // Back to top button
    const backTop = document.getElementById('backTop');
    if (backTop) {
      backTop.classList.toggle('visible', currentY > 400);
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });


  /* ============================================================
     2. HERO CAROUSEL — Slide switching
  ============================================================ */
  const slides   = document.querySelectorAll('.carousel-slide');
  const thumbs   = document.querySelectorAll('.thumb');
  const prevBtn  = document.getElementById('carPrev');
  const nextBtn  = document.getElementById('carNext');
  let currentSlide = 0;

  function goToSlide(index) {
    // Bounds wrapping
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    // Deactivate old
    slides[currentSlide].classList.remove('active');
    thumbs[currentSlide].classList.remove('active');

    // Activate new
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    thumbs[currentSlide].classList.add('active');

    // Scroll thumb into view on mobile
    thumbs[currentSlide].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.dataset.index, 10);
      goToSlide(idx);
    });
  });

  // Auto-advance every 4s
  let autoPlay = setInterval(() => goToSlide(currentSlide + 1), 4000);
  const carouselMain = document.getElementById('carouselMain');
  if (carouselMain) {
    carouselMain.addEventListener('mouseenter', () => clearInterval(autoPlay));
    carouselMain.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => goToSlide(currentSlide + 1), 4000);
    });
  }


  /* ============================================================
     3. IMAGE ZOOM — Lens + Floating result panel on hover
     Each .carousel-slide has a .zoom-lens and .zoom-result
     The zoom result shows the area under the cursor magnified
  ============================================================ */
  const ZOOM_FACTOR = 2.5; // magnification level

  slides.forEach(slide => {
    const img    = slide.querySelector('img');
    const lens   = slide.querySelector('.zoom-lens');
    const result = slide.querySelector('.zoom-result');
    const resImg = result ? result.querySelector('img') : null;

    if (!img || !lens || !result || !resImg) return;

    function moveLens(e) {
      // Only active on the currently visible slide
      if (!slide.classList.contains('active')) return;

      e.preventDefault();
      const rect = img.getBoundingClientRect();

      // Mouse position relative to image
      let x = (e.clientX || e.touches[0].clientX) - rect.left;
      let y = (e.clientY || e.touches[0].clientY) - rect.top;

      const lensW = lens.offsetWidth  / 2;
      const lensH = lens.offsetHeight / 2;

      // Clamp within image bounds
      x = Math.max(lensW, Math.min(x, rect.width  - lensW));
      y = Math.max(lensH, Math.min(y, rect.height - lensH));

      // Position lens (centred on cursor)
      lens.style.left = `${x - lensW}px`;
      lens.style.top  = `${y - lensH}px`;

      // The result image is zoomed — adjust background-position
      // (We use object-fit cover + transform on result img instead)
      const pctX = (x / rect.width)  * 100;
      const pctY = (y / rect.height) * 100;

      resImg.style.transformOrigin = `${pctX}% ${pctY}%`;
      resImg.style.transform = `scale(${ZOOM_FACTOR})`;
    }

    slide.addEventListener('mousemove', moveLens);
    slide.addEventListener('mouseleave', () => {
      resImg.style.transform = 'scale(1)';
    });
  });


  /* ============================================================
     4. FAQ ACCORDION
  ============================================================ */
  const faqList = document.getElementById('faqList');
  if (faqList) {
    faqList.addEventListener('click', e => {
      const btn = e.target.closest('.faq-q');
      if (!btn) return;

      const item    = btn.closest('.faq-item');
      const isOpen  = item.classList.contains('open');
      const ico     = btn.querySelector('.faq-ico');

      // Close all
      faqList.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        const i = el.querySelector('.faq-ico');
        if (i) i.textContent = '+';
      });

      // Open clicked (if wasn't already open)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (ico) ico.textContent = '−';
      }
    });
  }


  /* ============================================================
     5. MANUFACTURING PROCESS TABS
  ============================================================ */
  const processTabs = document.getElementById('processTabs');
  if (processTabs) {
    processTabs.addEventListener('click', e => {
      const tab = e.target.closest('.ptab');
      if (!tab) return;

      // Deactivate all tabs and panels
      processTabs.querySelectorAll('.ptab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.ppanel').forEach(p => p.classList.remove('active'));

      // Activate clicked tab and its panel
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(`tab-${tab.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  }


  /* ============================================================
     6. APPLICATIONS CAROUSEL (horizontal scroll with arrows)
  ============================================================ */
  const appCarousel = document.getElementById('appCarousel');
  const appPrev     = document.getElementById('appPrev');
  const appNext     = document.getElementById('appNext');

  if (appCarousel && appPrev && appNext) {
    // Width of one card + gap
    const scrollAmount = () => {
      const card = appCarousel.querySelector('.app-card');
      return card ? card.offsetWidth + 16 : 276;
    };

    appNext.addEventListener('click', () => {
      appCarousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });
    appPrev.addEventListener('click', () => {
      appCarousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });

    // Update button states
    function updateAppBtns() {
      appPrev.style.opacity = appCarousel.scrollLeft <= 0 ? '0.4' : '1';
      const maxScroll = appCarousel.scrollWidth - appCarousel.clientWidth;
      appNext.style.opacity = appCarousel.scrollLeft >= maxScroll - 4 ? '0.4' : '1';
    }
    appCarousel.addEventListener('scroll', updateAppBtns, { passive: true });
    updateAppBtns();
  }


  /* ============================================================
     7. HAMBURGER MOBILE MENU
  ============================================================ */
  const hamburger  = document.getElementById('hamburger');
  const mainHeaderEl = document.getElementById('mainHeader');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      // Inject mobile menu below nav
      let mobileMenu = mainHeaderEl.querySelector('.mobile-menu');
      if (!mobileMenu) {
        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = `
          <a href="#about">About Us</a>
          <a href="#products">Products</a>
          <a href="#contact" class="btn btn-primary">Contact Us</a>
        `;
        mainHeaderEl.appendChild(mobileMenu);
      }
      mobileMenu.classList.toggle('open', isOpen);

      // Close menu when link clicked
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          mobileMenu.classList.remove('open');
        });
      });
    });
  }


  /* ============================================================
     8. BACK TO TOP
  ============================================================ */
  const backTop = document.getElementById('backTop');
  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ============================================================
     9. KEYBOARD / ACCESSIBILITY — close mobile menu on Esc
  ============================================================ */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const mobileMenu = document.querySelector('.mobile-menu.open');
      if (mobileMenu) {
        mobileMenu.classList.remove('open');
        hamburger && hamburger.classList.remove('open');
        hamburger && hamburger.setAttribute('aria-expanded', 'false');
      }
    }
  });

}); // end DOMContentLoaded