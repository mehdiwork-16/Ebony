/* ═══════════════════════════════════════════
   EBONY LOUNGE — Main Script
   ═══════════════════════════════════════════ */

// ── NAVBAR SCROLL ──────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

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
  // Re-trigger animations
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

// ── HERO BG ZOOM ───────────────────────────
(function heroZoom() {
  const bg = document.querySelector('.hero-bg');
  if (!bg) return;
  setTimeout(() => bg.classList.add('loaded'), 100);
})();

// ── HERO PARALLAX ──────────────────────────
(function heroParallax() {
  const bg = document.querySelector('.hero-bg');
  if (!bg) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    bg.style.transform = `translateY(${y * 0.35}px) scale(1)`;
  }, { passive: true });
})();

// ── FILTER TABS ────────────────────────────
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

// Init on respective pages
if (document.querySelector('[data-page="events"]'))  initFilters('.filter-btn', '.event-card', 'category');
if (document.querySelector('[data-page="menu"]'))    initFilters('.filter-btn', '.menu-card',  'category');

// ══════════════════════════════════════════
// RESERVATION — Multi-step form
// ══════════════════════════════════════════
(function initReservation() {
  if (!document.querySelector('[data-page="reservation"]')) return;

  let currentStep = 1;
  const formData = {};

  // ── Step navigation
  function showStep(n) {
    document.querySelectorAll('.step-panel').forEach(p => p.classList.add('hidden'));
    const panel = document.getElementById(`step${n}`);
    if (panel) { panel.classList.remove('hidden'); panel.style.animation = 'fadeUp 0.4s ease'; }

    document.querySelectorAll('.step-dot').forEach((dot, i) => {
      dot.classList.remove('active', 'done');
      if (i + 1 === n)    dot.classList.add('active');
      if (i + 1 < n)      dot.classList.add('done');
    });
    document.querySelectorAll('.step-label').forEach((lbl, i) => {
      lbl.classList.toggle('active', i + 1 === n);
    });
    document.querySelectorAll('.step-connector').forEach((line, i) => {
      line.classList.toggle('done', i + 1 < n);
    });
    currentStep = n;
  }

  // ── Validation helpers
  function val(id, check, errId) {
    const el = document.getElementById(id);
    const err = document.getElementById(errId);
    const ok = check(el ? el.value.trim() : '');
    el && el.classList.toggle('error', !ok);
    if (err) { err.classList.toggle('show', !ok); }
    return ok;
  }
  function validateStep1() {
    let ok = true;
    ok = val('firstName', v => v.length > 0, 'err-firstName') && ok;
    ok = val('lastName',  v => v.length > 0, 'err-lastName')  && ok;
    ok = val('email',     v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'err-email') && ok;
    ok = val('phone',     v => v.length > 0, 'err-phone')     && ok;
    return ok;
  }
  function validateStep2() {
    let ok = true;
    ok = val('date',   v => v.length > 0, 'err-date')   && ok;
    ok = val('guests', v => v.length > 0, 'err-guests') && ok;
    // Time & table validated differently (buttons)
    const timeErr = document.getElementById('err-time');
    const tableErr = document.getElementById('err-table');
    if (!formData.time)  { if (timeErr)  { timeErr.classList.add('show'); }  ok = false; }
    else                 { if (timeErr)  { timeErr.classList.remove('show'); } }
    if (!formData.table) { if (tableErr) { tableErr.classList.add('show'); } ok = false; }
    else                 { if (tableErr) { tableErr.classList.remove('show'); } }
    return ok;
  }

  // ── Time slots
  document.querySelectorAll('.time-slot').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      formData.time = btn.dataset.time;
      const err = document.getElementById('err-time');
      if (err) err.classList.remove('show');
    });
  });

  // ── Table type cards
  document.querySelectorAll('.table-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.table-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      formData.table = card.dataset.table;
      const err = document.getElementById('err-table');
      if (err) err.classList.remove('show');
    });
  });

  // ── Next / Back buttons
  const nextBtn1 = document.getElementById('nextBtn1');
  const nextBtn2 = document.getElementById('nextBtn2');
  const backBtn2 = document.getElementById('backBtn2');
  const backBtn3 = document.getElementById('backBtn3');
  const submitBtn = document.getElementById('submitBtn');

  nextBtn1 && nextBtn1.addEventListener('click', () => {
    if (!validateStep1()) return;
    formData.firstName = document.getElementById('firstName').value.trim();
    formData.lastName  = document.getElementById('lastName').value.trim();
    formData.email     = document.getElementById('email').value.trim();
    formData.phone     = document.getElementById('phone').value.trim();
    showStep(2);
  });

  nextBtn2 && nextBtn2.addEventListener('click', () => {
    if (!validateStep2()) return;
    formData.date   = document.getElementById('date').value;
    formData.guests = document.getElementById('guests').value;
    formData.notes  = document.getElementById('notes') ? document.getElementById('notes').value : '';
    // Populate review
    populateReview();
    showStep(3);
  });

  backBtn2 && backBtn2.addEventListener('click', () => showStep(1));
  backBtn3 && backBtn3.addEventListener('click', () => showStep(2));

  function populateReview() {
    const tableNames = { standard: 'Standard Table', premium: 'Premium Table', vip: 'VIP Suite' };
    const fields = {
      'rv-name': `${formData.firstName} ${formData.lastName}`,
      'rv-email': formData.email,
      'rv-phone': formData.phone,
      'rv-date': formData.date,
      'rv-time': formData.time,
      'rv-guests': `${formData.guests} guests`,
      'rv-table': tableNames[formData.table] || formData.table,
    };
    Object.entries(fields).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });
    if (formData.notes) {
      const rn = document.getElementById('rv-notes-row');
      const rv = document.getElementById('rv-notes');
      if (rn) rn.classList.remove('hidden');
      if (rv) rv.textContent = formData.notes;
    }
  }

  submitBtn && submitBtn.addEventListener('click', () => {
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('success').classList.remove('hidden');
    // Fill success summary
    const el = document.getElementById('success-name');
    if (el) el.textContent = formData.firstName;
    const em = document.getElementById('success-email');
    if (em) em.textContent = formData.email;
  });

  // init
  showStep(1);

  // Set min date for date input
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
})();

// ── CONTACT FORM ───────────────────────────
(function initContact() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;

    ['cName','cEmail','cMessage'].forEach(id => {
      const el = document.getElementById(id);
      const errEl = document.getElementById('err-' + id);
      let valid = el && el.value.trim().length > 0;
      if (id === 'cEmail') valid = el && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      if (el) el.classList.toggle('error', !valid);
      if (errEl) errEl.classList.toggle('show', !valid);
      if (!valid) ok = false;
    });

    if (ok) {
      form.classList.add('hidden');
      document.getElementById('contactSuccess').classList.remove('hidden');
    }
  });
})();
