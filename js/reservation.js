/* ═══════════════════════════════════════════
   EBONY LOUNGE — Reservation Page Script
   ═══════════════════════════════════════════ */

(function initReservation() {
  let currentStep = 1;
  const formData = {};

  // ── Step navigation ──────────────────────
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

  // ── Validation helpers ───────────────────
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
    const timeErr = document.getElementById('err-time');
    const tableErr = document.getElementById('err-table');
    if (!formData.time)  { if (timeErr)  timeErr.classList.add('show');    ok = false; }
    else                 { if (timeErr)  timeErr.classList.remove('show'); }
    if (!formData.table) { if (tableErr) tableErr.classList.add('show');   ok = false; }
    else                 { if (tableErr) tableErr.classList.remove('show'); }
    return ok;
  }

  // ── Time slots ───────────────────────────
  document.querySelectorAll('.time-slot').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      formData.time = btn.dataset.time;
      const err = document.getElementById('err-time');
      if (err) err.classList.remove('show');
    });
  });

  // ── Table type cards ─────────────────────
  document.querySelectorAll('.table-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.table-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      formData.table = card.dataset.table;
      const err = document.getElementById('err-table');
      if (err) err.classList.remove('show');
    });
  });

  // ── Next / Back buttons ──────────────────
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
    populateReview();
    showStep(3);
  });

  backBtn2 && backBtn2.addEventListener('click', () => showStep(1));
  backBtn3 && backBtn3.addEventListener('click', () => showStep(2));

  // ── Review summary ───────────────────────
  function populateReview() {
    const tableNames = { standard: 'Standard Table', premium: 'Premium Table', vip: 'VIP Suite' };
    const fields = {
      'rv-name':   `${formData.firstName} ${formData.lastName}`,
      'rv-email':  formData.email,
      'rv-phone':  formData.phone,
      'rv-date':   formData.date,
      'rv-time':   formData.time,
      'rv-guests': `${formData.guests} guests`,
      'rv-table':  tableNames[formData.table] || formData.table,
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

  // ── Submit ───────────────────────────────
  submitBtn && submitBtn.addEventListener('click', () => {
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('success').classList.remove('hidden');
    const el = document.getElementById('success-name');
    if (el) el.textContent = formData.firstName;
    const em = document.getElementById('success-email');
    if (em) em.textContent = formData.email;
  });

  // ── Init ─────────────────────────────────
  showStep(1);

  // Set min date to today
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
})();
