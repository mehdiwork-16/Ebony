/* ═══════════════════════════════════════════
   EBONY LOUNGE — Contact Page Script
   ═══════════════════════════════════════════ */

(function initContact() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;

    ['cName', 'cEmail', 'cMessage'].forEach(id => {
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
