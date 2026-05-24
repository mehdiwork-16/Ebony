/* ═══════════════════════════════════════════
   EBONY LOUNGE — Base Script (all pages)
   ═══════════════════════════════════════════ */

// ── PAGE PRELOADER ─────────────────────────
// Shows only on: (1) first visit via direct link, (2) page refresh.
// Skipped on in-session navigation (Events → Menu, etc.)
(function initPreloader() {
  // Detect navigation type: 'reload' | 'navigate' | 'back_forward'
  const navEntry = performance.getEntriesByType('navigation')[0];
  const navType  = navEntry ? navEntry.type
                 : (performance.navigation && performance.navigation.type === 1 ? 'reload' : 'navigate');

  const isReload     = navType === 'reload';
  const isFirstVisit = !sessionStorage.getItem('ebony_seen');

  // Skip preloader for in-session page-to-page navigation
  if (!isReload && !isFirstVisit) return;

  // Mark session so subsequent navigations skip the preloader
  sessionStorage.setItem('ebony_seen', '1');

  // Build and inject overlay
  const overlay = document.createElement('div');
  overlay.id = 'preloader';
  overlay.innerHTML = `
    <div class="preloader-inner">
      <img src="img/logo-white.svg" alt="EBONY Lounge" class="preloader-logo" />
      <div class="preloader-bar"></div>
      <div class="preloader-label">Lounge</div>
    </div>
    <div class="preloader-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  document.documentElement.style.overflow = 'hidden';
  document.body.appendChild(overlay);

  function hidePreloader() {
    overlay.classList.add('hide');
    document.documentElement.style.overflow = '';
    setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 950);
  }

  const minDisplay = 2200;
  const startTime  = Date.now();

  window.addEventListener('load', () => {
    const elapsed   = Date.now() - startTime;
    const remaining = Math.max(0, minDisplay - elapsed);
    setTimeout(hidePreloader, remaining);
  });

  // Hard fallback — never block the user more than 5s
  setTimeout(hidePreloader, 5000);
})();

// ── BACK TO TOP VISIBILITY ─────────────────
(function initFloatTop() {
  const btn = document.getElementById('floatTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
})();

// ── NAVBAR SCROLL ──────────────────────────
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

// ── ACTIVE NAV LINK ────────────────────────
(function highlightNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ── MOBILE MENU ────────────────────────────
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const toggle = document.querySelector('.nav-toggle');
  if (!menu) return;
  const open = menu.classList.toggle('open');
  toggle && toggle.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) {
    menu.querySelectorAll('a').forEach(a => {
      a.style.animation = 'none';
      a.offsetHeight; // reflow
      a.style.animation = '';
    });
  }
}
function closeMenu() {
  const menu = document.getElementById('mobileMenu');
  const toggle = document.querySelector('.nav-toggle');
  if (!menu) return;
  menu.classList.remove('open');
  toggle && toggle.classList.remove('open');
  document.body.style.overflow = '';
}

// ── SCROLL REVEAL ──────────────────────────
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => io.observe(el));
})();

// ── HERO BG ZOOM (disabled) ──────────────
// ── HERO PARALLAX (disabled) ──────────────

// ── FILTER TABS (used by events + menu pages) ──
function initFilters(filterSelector, cardSelector, dataAttr) {
  const btns = document.querySelectorAll(filterSelector);
  const cards = document.querySelectorAll(cardSelector);
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.filter;

      cards.forEach(card => {
        const match = val === 'All' || card.dataset[dataAttr] === val;
        card.style.display = match ? '' : 'none';
        if (match) {
          card.style.animation = 'fadeUp 0.4s ease both';
          card.offsetHeight;
        }
      });
    });
  });
}

// ── SECTION HEADING WORD-SPLIT ──────────────
(function initWordSplit() {
  const headings = document.querySelectorAll('.section h2, .section-dark h2, .cta-banner h2');
  if (!headings.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.querySelectorAll('.word-inner').forEach((wi, i) => {
        setTimeout(() => wi.classList.add('reveal-word'), i * 80);
      });
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  headings.forEach(h2 => {
    function wrapWords(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        words.forEach(w => {
          if (/^\s+$/.test(w) || w === '') {
            frag.appendChild(document.createTextNode(w));
            return;
          }
          const outer = document.createElement('span');
          outer.className = 'word';
          const inner = document.createElement('span');
          inner.className = 'word-inner';
          inner.textContent = w;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        return frag;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        node.childNodes.forEach(child => clone.appendChild(wrapWords(child)));
        return clone;
      }
      return node.cloneNode(true);
    }

    const frag = document.createDocumentFragment();
    h2.childNodes.forEach(child => frag.appendChild(wrapWords(child)));
    h2.innerHTML = '';
    h2.appendChild(frag);
    h2.classList.add('split-words');

    io.observe(h2);
  });
})();
