(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CSRF = ($('meta[name=csrf]') || {}).content || '';
  var faNum = function (n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); };
  var money = function (n) { return faNum(Number(n || 0).toLocaleString('en-US')) + ' تومان'; };
  function post(url, data) {
    var fd = data instanceof FormData ? data : new FormData();
    if (!(data instanceof FormData)) Object.keys(data || {}).forEach(function (k) { fd.append(k, data[k]); });
    if (!fd.has('_csrf')) fd.append('_csrf', CSRF);
    return fetch(url, { method: 'POST', body: fd, headers: { 'Accept': 'application/json', 'X-CSRF': CSRF }, credentials: 'same-origin' })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'خطای سرور' }; }); });
  }
  function msg(el, text, ok) { if (!el) return; el.textContent = text || ''; el.className = 'form-msg ' + (ok ? 'ok' : 'err'); }

  /* reveal on scroll */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    $$('.fade-up').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  } else $$('.fade-up').forEach(function (el) { el.classList.add('visible'); });

  /* header + back to top */
  var nav = $('#navbar'), btt = $('#backToTop'), tick = false;
  window.addEventListener('scroll', function () {
    if (tick) return; tick = true;
    requestAnimationFrame(function () { var y = window.pageYOffset; if (nav) nav.classList.toggle('scrolled', y > 50); if (btt) btt.classList.toggle('show', y > 600); tick = false; });
  }, { passive: true });
  if (btt) btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* mobile menu */
  var ham = $('[data-menu]'), mm = $('#mobileMenu');
  function closeMenu() { if (!mm) return; mm.classList.remove('open'); ham && ham.classList.remove('active'); document.body.style.overflow = ''; }
  if (ham && mm) {
    ham.addEventListener('click', function () { var o = !mm.classList.contains('open'); mm.classList.toggle('open', o); ham.classList.toggle('active', o); document.body.style.overflow = o ? 'hidden' : ''; });
    $$('a', mm).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* smooth anchors */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var h = a.getAttribute('href'); if (h.length < 2 || a.hasAttribute('data-cms-tab')) return;
      var t = document.getElementById(h.slice(1)); if (!t) return;
      e.preventDefault(); var off = nav ? nav.offsetHeight + 16 : 16;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - off, behavior: 'smooth' });
    });
  });
  /* active nav link */
  var secs = $$('main section[id]'), links = $$('.nav-links a');
  if (secs.length && links.length) window.addEventListener('scroll', function () {
    var y = window.pageYOffset + 140;
    secs.forEach(function (s) { if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + s.id); }); });
  }, { passive: true });

  /* spotlight cards */
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.spot'); if (!c) return;
    var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* typing placeholder */
  $$('[data-typing]').forEach(function (inp) {
    var list; try { list = JSON.parse(inp.getAttribute('data-typing')); } catch (e) { list = []; }
    if (!list.length) return;
    var base = inp.placeholder, i = 0, j = 0, del = false;
    (function step() {
      if (document.activeElement === inp || inp.value) { inp.placeholder = base; return setTimeout(step, 1200); }
      var w = list[i]; j += del ? -1 : 1; inp.placeholder = w.slice(0, j) + '│';
      if (!del && j >= w.length) { del = true; return setTimeout(step, 1800); }
      if (del && j <= 0) { del = false; i = (i + 1) % list.length; }
      setTimeout(step, del ? 28 : 60);
    })();
  });
  var demo = $('[data-typed-demo]');
  if (demo) {
    var lines = ['یک سایت مدرن برای کافه‌ام می‌خواهم ☕', 'در حال انتخاب پالت رنگی…', 'ساخت بخش منو و رزرو آنلاین…', 'سایت شما آماده است ✨'], li = 0;
    setInterval(function () { li = (li + 1) % lines.length; demo.textContent = lines[li]; }, 2250); demo.textContent = lines[0];
  }

  /* home plans period toggle */
  $$('[data-period-toggle]').forEach(function (t) {
    t.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', t).forEach(function (x) { x.classList.toggle('on', x === b); });
      var p = b.getAttribute('data-p'), scope = t.parentNode;
      $$('[data-show]', scope).forEach(function (s) { s.hidden = s.getAttribute('data-show') !== p; });
      $$('[data-plan-link]', scope).forEach(function (a) { a.href = a.href.replace(/&period=\w+/, '') + '&period=' + p; });
    });
  });

  /* portfolio filter */
  $$('[data-filter]').forEach(function (f) {
    f.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', f).forEach(function (x) { x.classList.toggle('on', x === b); });
      var v = b.getAttribute('data-f');
      $$('.apps-grid .app-card').forEach(function (c) { c.hidden = v !== '*' && c.getAttribute('data-cat') !== v; });
    });
  });

  /* ajax forms (contact) */
  $$('form[data-ajax]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var b = $('button[type=submit]', f), m = $('.form-msg', f);
      b.disabled = true;
      post(f.action, new FormData(f)).then(function (r) { msg(m, r.ok ? r.msg : r.error, r.ok); if (r.ok) f.reset(); }).finally(function () { b.disabled = false; });
    });
  });

  /* alerts autohide */
  $$('[data-autohide]').forEach(function (a) { setTimeout(function () { a.style.opacity = '0'; setTimeout(function () { a.remove(); }, 450); }, 6500); });

  /* confirm + loading */
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-confirm]');
    if (c && c.tagName !== 'FORM' && !confirm(c.getAttribute('data-confirm'))) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  $$('form[data-confirm]').forEach(function (f) { f.addEventListener('submit', function (e) { if (!confirm(f.getAttribute('data-confirm'))) e.preventDefault(); }); });
  $$('[data-loading]').forEach(function (b) { b.addEventListener('click', function () { var t = b.getAttribute('data-loading'); setTimeout(function () { b.textContent = t; b.disabled = true; }, 10); }); });

  /* dashboard sidebar */
  var st = $('[data-side]'), side = $('#side'), smask = $('[data-side-mask]');
  if (st && side) {
    var setSide = function (o) { side.classList.toggle('open', o); if (smask) smask.classList.toggle('open', o); };
    st.addEventListener('click', function (e) { e.stopPropagation(); setSide(!side.classList.contains('open')); });
    if (smask) smask.addEventListener('click', function () { setSide(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setSide(false); });
  }
  /* responsive tables: copy header text into each cell for the mobile card layout */
  $$('table.tbl').forEach(function (t) { var hs = $$('thead th', t).map(function (h) { return h.textContent.trim(); }); $$('tbody tr', t).forEach(function (r) { $$('td', r).forEach(function (td, i) { if (hs[i] && !td.hasAttribute('data-label')) td.setAttribute('data-label', hs[i]); }); }); });

  /* generic tab groups */
  function tabs(groupSel, attr, paneAttr, useHash) {
    $$(groupSel).forEach(function (g) {
      var scope = g.parentNode;
      function show(k) {
        $$('button', g).forEach(function (b) { b.classList.toggle('on', b.getAttribute(attr) === k); });
        $$('[' + paneAttr + ']', scope).forEach(function (p) { p.hidden = p.getAttribute(paneAttr) !== k; });
        var tf = $('input[name=tab]', scope); if (tf) tf.value = k;
        if (useHash) history.replaceState(null, '', '#' + k);
      }
      g.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(b.getAttribute(attr)); });
      if (useHash && location.hash && $('button[' + attr + '="' + location.hash.slice(1) + '"]', g)) show(location.hash.slice(1));
    });
  }
  tabs('[data-auth-tabs]', 'data-t', 'data-tab');
  tabs('[data-page-tabs]', 'data-t', 'data-tab', true);

  /* copy / reveal / genpass */
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-copy]');
    if (c && navigator.clipboard) { navigator.clipboard.writeText(c.getAttribute('data-copy')); var o = c.style.outline; c.style.outline = '1px solid #10b981'; setTimeout(function () { c.style.outline = o; }, 700); }
    var r = e.target.closest('[data-reveal]');
    if (r) { var s = r.parentNode.querySelector('[data-secret]'); var shown = s.textContent !== '••••••••'; s.textContent = shown ? '••••••••' : s.getAttribute('data-secret'); r.textContent = shown ? 'نمایش' : 'پنهان'; }
    var g = e.target.closest('[data-genpass]');
    if (g) { var inp = g.closest('.field').querySelector('input'); var ch = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789@#%'; var p = ''; var a = new Uint32Array(14); crypto.getRandomValues(a); a.forEach(function (x) { p += ch[x % ch.length]; }); inp.value = p; }
  });

  /* ---------- OTP ---------- */
  $$('[data-otp]').forEach(function (box) {
    var purpose = box.getAttribute('data-purpose'), m = $('.form-msg', box);
    var mob = $('[name=otp_mobile]', box), code = $('[name=otp_code]', box), nameI = $('[name=otp_name]', box);
    var sendB = $('[data-otp-send]', box), verB = $('[data-otp-verify]', box), cb = $('[data-otp-codebox]', box), timer;
    sendB.addEventListener('click', function () {
      if (nameI && !nameI.value.trim()) { msg(m, 'لطفاً نام خود را وارد کنید.'); nameI.focus(); return; }
      sendB.disabled = true; msg(m, 'در حال ارسال…', true);
      post('/otp/send', { mobile: mob.value, purpose: purpose }).then(function (r) {
        msg(m, r.ok ? r.msg : r.error, r.ok);
        if (r.ok) {
          cb.hidden = false; code.focus(); var s = 60;
          clearInterval(timer); timer = setInterval(function () { s--; sendB.textContent = s > 0 ? faNum(s) + ' ثانیه' : 'ارسال مجدد'; if (s <= 0) { clearInterval(timer); sendB.disabled = false; } }, 1000);
        } else sendB.disabled = false;
      });
    });
    function verify() {
      verB.disabled = true;
      post('/otp/verify', { mobile: mob.value, code: code.value, purpose: purpose, name: nameI ? nameI.value : '' }).then(function (r) {
        if (!r.ok) { msg(m, r.error); verB.disabled = false; return; }
        if (r.redirect) { location.href = r.redirect; return; }
        if (r.csrf) { CSRF = r.csrf; $$('input[name=_csrf]').forEach(function (i) { i.value = r.csrf; }); }
        box.innerHTML = '<div class="alert alert-ok">✓ با موفقیت وارد شدید' + (r.name ? ' — ' + r.name : '') + '</div><input type="hidden" id="authed" value="1">';
        document.dispatchEvent(new CustomEvent('s369:authed'));
      });
    }
    verB.addEventListener('click', verify);
    code.addEventListener('input', function () { code.value = code.value.replace(/[^\d۰-۹]/g, ''); if (code.value.length >= 5) verify(); });
  });

  /* ---------- Order wizard ---------- */
  var wz = $('#wizard');
  if (wz) (function () {
    var step = 1, total = 5, prices = JSON.parse(wz.getAttribute('data-prices') || '{}'), subBase = wz.getAttribute('data-sub');
    var f = function (n) { return wz.elements[n]; };
    var steps = $$('.wz-step', wz), stepper = $$('[data-stepper] li'), prev = $('[data-prev]', wz), next = $('[data-next]', wz), wmsg = $('#wzMsg');
    var domainState = { ok: false, price: 0 };
    function plan() { return $('.plan-card[data-plan="' + f('plan_id').value + '"]', wz); }
    function hostPrice() { var p = plan(); if (!p) return 0; return Number(f('period').value === 'monthly' ? p.getAttribute('data-pm') : p.getAttribute('data-py')); }
    function summary() {
      var p = plan(), dp = f('domain_action').value === 'register' ? domainState.price : 0;
      $('#wzSum').innerHTML = p ? ('<b>' + p.getAttribute('data-title') + '</b> · ' + (f('domain').value ? '<span dir="ltr">' + f('domain').value + '</span> · ' : '') + 'جمع: <b>' + money(hostPrice() + dp) + '</b>') : '';
    }
    function pick(sel, attr, field) {
      $$(sel, wz).forEach(function (c) {
        if (c.getAttribute(attr) === f(field).value) c.classList.add('picked');
        c.addEventListener('click', function () { $$(sel, wz).forEach(function (x) { x.classList.remove('picked'); }); c.classList.add('picked'); f(field).value = c.getAttribute(attr); summary(); });
      });
    }
    pick('.plan-card[data-plan]', 'data-plan', 'plan_id');
    pick('.type-card[data-tpl]', 'data-tpl', 'template_id');
    var ib = $('[data-improve]', wz);
    if (ib) ib.addEventListener('click', function () {
      var im = $('[data-improve-msg]', wz); ib.disabled = true; im.textContent = '⏳ در حال بهبود…';
      post('/api/improve-prompt', { template_id: f('template_id').value, business_name: f('business_name').value, prompt: f('prompt').value }).then(function (r) { ib.disabled = false; if (r.ok) { f('prompt').value = r.text; im.textContent = '✓ بهبود یافت؛ در صورت نیاز ویرایش کنید.'; } else im.textContent = r.error; });
    });
    if (!$('.plan-card.picked', wz)) { var fp = $('.plan-card[data-plan]', wz); if (fp) fp.click(); }
    var qp = new URLSearchParams(location.search).get('period');
    $$('[data-wz-period] button', wz).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-wz-period] button', wz).forEach(function (x) { x.classList.toggle('on', x === b); });
        f('period').value = b.getAttribute('data-p');
        $$('[data-show]', wz).forEach(function (s) { s.hidden = s.getAttribute('data-show') !== f('period').value; });
        summary();
      });
      if (qp && b.getAttribute('data-p') === qp) b.click();
    });
    /* domain */
    var dres = $('#domResult');
    function setDomain(d, ok, price) { f('domain').value = d; domainState.ok = ok; domainState.price = price || 0; summary(); }
    $$('[data-domain-tabs] button', wz).forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-act'); f('domain_action').value = a;
        $$('[data-domain-tabs] button', wz).forEach(function (x) { x.classList.toggle('on', x === b); });
        $$('[data-pane]', wz).forEach(function (p) { if (p.closest('[data-step="2"]')) p.hidden = p.getAttribute('data-pane') !== a; });
        $$('[data-pane-hint]', wz).forEach(function (p) { p.hidden = p.getAttribute('data-pane-hint') !== a; });
        dres.innerHTML = ''; setDomain('', false, 0);
        if (a === 'own') ownIn();
        if (a === 'sub') subIn();
      });
    });
    var dn = $('#dom_name'), dt = $('#dom_tld'), dOwn = $('#dom_own'), dSub = $('#dom_sub');
    function clean(v) { return v.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''); }
    function check() {
      var name = clean(dn.value).replace(/\..*$/, '').replace(/[^a-z0-9-]/g, '');
      if (name.length < 2) { dres.innerHTML = '<span class="err">نام دامنه را به حروف لاتین وارد کنید.</span>'; return; }
      var d = name + '.' + dt.value; dn.value = name;
      dres.innerHTML = '<span class="warn">در حال بررسی ' + d + ' …</span>';
      fetch('/api/domain-check?domain=' + encodeURIComponent(d)).then(function (r) { return r.json(); }).then(function (r) {
        var pr = r.price != null ? r.price : (prices[dt.value] || 0);
        if (!r.ok) { dres.innerHTML = '<span class="err">' + r.error + '</span>'; setDomain('', false, 0); }
        else if (r.available === false) { dres.innerHTML = '<span class="err">✗ <b dir="ltr">' + d + '</b> ' + (r.on_server ? 'قبلاً روی سرور ثبت شده است.' : 'قبلاً ثبت شده است. اگر مالک آن هستید از تب «دامنه دارم» استفاده کنید.') + '</span>'; setDomain('', false, 0); }
        else { dres.innerHTML = '<span class="' + (r.available ? 'ok' : 'warn') + '">' + (r.available ? '✓ <b dir="ltr">' + d + '</b> آزاد است!' : 'وضعیت <b dir="ltr">' + d + '</b> قطعی نیست؛ پس از ثبت سفارش بررسی می‌شود.') + ' هزینه ثبت: ' + money(pr) + '</span>'; setDomain(d, true, pr); }
      }).catch(function () { setDomain(d, true, prices[dt.value] || 0); dres.innerHTML = '<span class="warn">بررسی آنلاین ممکن نشد؛ پس از سفارش بررسی می‌شود. هزینه: ' + money(prices[dt.value] || 0) + '</span>'; });
    }
    $('[data-check]', wz).addEventListener('click', check);
    dn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    dn.addEventListener('input', function () { setDomain('', false, 0); dres.innerHTML = ''; });
    dt.addEventListener('change', function () { if (dn.value) check(); });
    function ownIn() { var d = clean(dOwn.value); var ok = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,12}$/.test(d); setDomain(ok ? d : '', ok, 0); dres.innerHTML = dOwn.value && !ok ? '<span class="err">دامنه معتبر نیست (مثال: example.com)</span>' : (ok ? '<span class="ok">✓ ' + d + '</span>' : ''); }
    dOwn.addEventListener('input', ownIn);
    function subIn() { if (!dSub) return; var n = clean(dSub.value).replace(/[^a-z0-9-]/g, ''); var ok = n.length >= 3; setDomain(ok ? n + '.' + subBase : '', ok, 0); }
    if (dSub) dSub.addEventListener('input', subIn);
    /* prompt suggestions */
    $$('[data-suggest] button', wz).forEach(function (b) { b.addEventListener('click', function () { var t = f('prompt'); t.value = (t.value.trim() ? t.value.trim() + '، ' : '') + b.textContent; t.focus(); }); });
    /* review */
    function review() {
      var p = plan(), tp = $('.type-card.picked h3', wz), dp = f('domain_action').value === 'register' ? domainState.price : 0;
      var rows = [['پلن', p ? p.getAttribute('data-title') + ' (' + (f('period').value === 'monthly' ? 'ماهانه' : 'سالانه') + ')' : '—'], ['هزینه هاست', money(hostPrice())],
        ['دامنه', '<span dir="ltr">' + f('domain').value + '</span>'], ['هزینه دامنه', dp ? money(dp) : 'رایگان'], ['نوع سایت', tp ? tp.textContent : '—'], ['نام کسب‌وکار', f('business_name').value || '—']];
      $('#reviewList').innerHTML = rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('');
      $('#reviewTotal').textContent = money(hostPrice() + dp);
    }
    function validate(s) {
      if (s === 1 && !f('plan_id').value) return 'یک پلن انتخاب کنید.';
      if (s === 2 && (!f('domain').value || !domainState.ok)) return f('domain_action').value === 'register' ? 'نام دامنه را وارد و «بررسی» را بزنید.' : 'دامنه معتبر وارد کنید.';
      if (s === 3 && !f('template_id').value) return 'یکی از نوع‌های سایت را انتخاب کنید.';
      if (s === 3 && f('prompt').value.trim().length < 15) return 'کسب‌وکارتان را کمی بیشتر توصیف کنید (حداقل ۱۵ حرف).';
      if (s === 4 && !$('#authed')) return 'ابتدا با شماره موبایل وارد شوید.';
      return '';
    }
    function go(n) {
      step = Math.max(1, Math.min(total, n));
      steps.forEach(function (s) { s.classList.toggle('on', Number(s.getAttribute('data-step')) === step); });
      stepper.forEach(function (li, i) { li.classList.toggle('on', i + 1 === step); li.classList.toggle('done', i + 1 < step); });
      prev.hidden = step === 1; next.hidden = step === total;
      if (step === total) review();
      msg(wmsg, '');
      window.scrollTo({ top: wz.getBoundingClientRect().top + window.pageYOffset - 160, behavior: 'smooth' });
    }
    next.addEventListener('click', function () { var er = validate(step); if (er) { msg(wmsg, er); return; } go(step + 1); });
    prev.addEventListener('click', function () { go(step - 1); });
    document.addEventListener('s369:authed', function () { setTimeout(function () { go(5); }, 600); });
    wz.addEventListener('submit', function (e) {
      for (var s = 1; s < 5; s++) { var er = validate(s); if (er) { e.preventDefault(); go(s); msg(wmsg, er); return; } }
      var b = $('button[type=submit]', wz); b.disabled = true; b.textContent = 'در حال انتقال به درگاه…';
    });
    summary();
  })();

  /* ---------- order status polling ---------- */
  var ov = $('.order-view[data-busy="1"]');
  if (ov) (function () {
    var code = ov.getAttribute('data-order'), txt = $('#liveText'), first = true;
    var labels = { paid: 'پرداخت تأیید شد؛ در حال ساخت اکانت هاست…', provisioning: 'در حال ساخت اکانت cPanel روی سرور…', queued: 'در صف نصب سایت…', generating: 'در حال نصب سایت و شخصی‌سازی محتوا با هوش مصنوعی… (۱ تا ۳ دقیقه)' };
    (function poll() {
      fetch('/api/order-status/' + code + '?kick=1', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (r) {
        if (!r.ok) return;
        txt.textContent = labels[r.site] || labels[r.status] || 'در حال پردازش…';
        if (!r.busy || r.status === 'failed' || r.site === 'failed') { if (!first || !r.busy) location.reload(); return; }
        first = false; setTimeout(poll, 4000);
      }).catch(function () { setTimeout(poll, 8000); });
    })();
  })();

  /* ---------- admin helpers ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-upload]'); if (!b) return;
    var inp = b.parentNode.querySelector('input[type=text]');
    var fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/*';
    fi.onchange = function () {
      var fd = new FormData(); fd.append('file', fi.files[0]); b.disabled = true; b.textContent = '…';
      post('/admin/upload', fd).then(function (r) {
        b.disabled = false; b.textContent = 'آپلود';
        if (!r.ok) { alert(r.error); return; }
        inp.value = r.url; var img = b.parentNode.querySelector('img');
        if (!img && b.parentNode.classList.contains('img-field')) { img = document.createElement('img'); b.parentNode.prepend(img); }
        if (img) img.src = r.url;
      });
    };
    fi.click();
  });
  $$('[data-color-for]').forEach(function (c) {
    var t = document.querySelector('input[name="' + c.getAttribute('data-color-for') + '"]'); if (!t) return;
    c.addEventListener('input', function () { t.value = c.value; }); t.addEventListener('input', function () { if (/^#[0-9a-f]{6}$/i.test(t.value)) c.value = t.value; });
  });
  $$('[data-filter-list]').forEach(function (s) {
    var list = $(s.getAttribute('data-filter-list'));
    s.addEventListener('input', function () { var v = s.value.toLowerCase(); $$('.check', list).forEach(function (c) { c.hidden = v && c.textContent.toLowerCase().indexOf(v) < 0; }); });
  });

  /* repeater */
  function reindex(rep) {
    var base = rep.getAttribute('data-base');
    $$(':scope > .rep-row', rep).forEach(function (row, i) {
      $$('[name]', row).forEach(function (el) { el.name = el.name.replace(new RegExp('^' + base.replace(/[\[\]]/g, '\\$&') + '\\[[^\\]]*\\]'), base + '[' + i + ']'); });
      $$('[data-color-for]', row).forEach(function (el) { el.setAttribute('data-color-for', el.getAttribute('data-color-for').replace(/\[(\d+|__i__)\]/, '[' + i + ']')); });
    });
  }
  $$('[data-repeater]').forEach(function (rep) {
    var tpl = $(':scope > template', rep);
    rep.addEventListener('click', function (e) {
      var row = e.target.closest('.rep-row');
      if (e.target.closest('[data-rep-add]')) { var div = document.createElement('div'); div.innerHTML = tpl.innerHTML; rep.insertBefore(div.firstElementChild, e.target.closest('[data-rep-add]')); reindex(rep); }
      else if (e.target.closest('[data-rep-del]') && row) { row.remove(); reindex(rep); }
      else if (e.target.closest('[data-rep-up]') && row && row.previousElementSibling && row.previousElementSibling.classList.contains('rep-row')) { rep.insertBefore(row, row.previousElementSibling); reindex(rep); }
      else if (e.target.closest('[data-rep-down]') && row && row.nextElementSibling && row.nextElementSibling.classList.contains('rep-row')) { rep.insertBefore(row.nextElementSibling, row); reindex(rep); }
    });
  });

  /* CMS tabs + sort */
  var cms = $('#cmsForm');
  if (cms) (function () {
    function show(k) {
      $$('[data-cms-tab]', cms).forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-cms-tab') === k); });
      $$('.cms-pane', cms).forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== k; });
      cms.elements.tab.value = k; history.replaceState(null, '', '#' + k);
    }
    $$('[data-cms-tab]', cms).forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); show(a.getAttribute('data-cms-tab')); }); });
    if (location.hash && $('[data-pane="' + location.hash.slice(1) + '"]', cms)) show(location.hash.slice(1));
    var box = $('[data-cms-sort]', cms), drag = null;
    function saveOrder() { cms.elements.order.value = $$('.cms-tab-row', box).map(function (r) { return r.getAttribute('data-key'); }).join(','); }
    $$('.cms-tab-row', box).forEach(function (r) {
      var h = $('.rep-handle', r);
      h.addEventListener('dragstart', function (e) { drag = r; r.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); });
      h.addEventListener('dragend', function () { r.classList.remove('dragging'); $$('.drag-over', box).forEach(function (x) { x.classList.remove('drag-over'); }); saveOrder(); });
      r.addEventListener('dragover', function (e) { e.preventDefault(); if (drag && drag !== r) r.classList.add('drag-over'); });
      r.addEventListener('dragleave', function () { r.classList.remove('drag-over'); });
      r.addEventListener('drop', function (e) { e.preventDefault(); r.classList.remove('drag-over'); if (drag && drag !== r) box.insertBefore(drag, r); saveOrder(); });
    });
  })();

  /* Jalali quick dates */
  function j2g(jy, jm, jd) { jy += 1595; var days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186); var gy = 400 * Math.floor(days / 146097); days %= 146097; if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++; } gy += 4 * Math.floor(days / 1461); days %= 1461; if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365; } var gd = days + 1; var sal = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], gm; for (gm = 0; gm < 13 && gd > sal[gm]; gm++) gd -= sal[gm]; return new Date(gy, gm - 1, gd); }
  function g2j(d) { var gy = d.getFullYear(), gm = d.getMonth() + 1, gd = d.getDate(), gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], gy2 = gm > 2 ? gy + 1 : gy; var days = 355666 + 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + gdm[gm - 1]; var jy = -1595 + 33 * Math.floor(days / 12053); days %= 12053; jy += 4 * Math.floor(days / 1461); days %= 1461; if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; } var jm, jd; if (days < 186) { jm = 1 + Math.floor(days / 31); jd = 1 + days % 31; } else { jm = 7 + Math.floor((days - 186) / 30); jd = 1 + (days - 186) % 30; } return jy + '/' + String(jm).padStart(2, '0') + '/' + String(jd).padStart(2, '0'); }
  $$('[data-quick-dates]').forEach(function (q) {
    var form = q.closest('form'), exp = form.elements.expire_date;
    q.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var m = (exp.value || '').replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).match(/^(\d{4})\D(\d{1,2})\D(\d{1,2})$/);
      var base = m ? j2g(+m[1], +m[2], +m[3]) : new Date();
      if (base < new Date()) base = new Date();
      var add = b.getAttribute('data-add'), n = parseInt(add, 10);
      if (add.slice(-1) === 'y') base.setFullYear(base.getFullYear() + n); else base.setMonth(base.getMonth() + n);
      exp.value = g2j(base);
      if (!form.elements.start_date.value) form.elements.start_date.value = g2j(new Date());
    });
  });

  /* ---------- content studio ---------- */
  function studioGen(formSel, onOk) {
    var g = $(formSel); if (!g) return;
    g.addEventListener('submit', function (e) {
      e.preventDefault(); var b = $('button', g), m = $('.form-msg', g), fd = new FormData(g);
      fd.append('act', formSel === '#ytGen' ? 'package' : 'generate'); b.disabled = true; m.className = 'form-msg ok'; m.textContent = '⏳ هوش مصنوعی در حال تولید محتوا… (تا یک دقیقه)';
      post(location.pathname, fd).then(function (r) { b.disabled = false; if (!r.ok) { m.className = 'form-msg err'; m.textContent = r.error; return; } m.textContent = '✓ آماده شد؛ ویرایش و منتشر کنید.'; onOk(r, g); });
    });
  }
  function setImg(box, hid, url) { var bx = $(box), h = $(hid); if (!bx || !h) return; h.value = url || ''; bx.innerHTML = url ? '<img src="' + url + '" alt="">' : '<span>بدون تصویر</span>'; }
  studioGen('#studioGen', function (r, g) {
    var sv = $('#studioSave'); if (!sv) return;
    sv.elements.t_telegram.value = r.telegram || ''; sv.elements.t_instagram.value = r.instagram || ''; sv.elements.topic.value = g.elements.topic.value;
    setImg('#sImgBox', '#sImage', r.image);
  });
  studioGen('#ytGen', function (r) {
    var y = r.youtube || {}; var up = document.querySelector('form[enctype]'); if (!up) return;
    up.elements.title.value = y.title || ''; up.elements.description.value = y.description || ''; up.elements.tags.value = (y.tags || []).join(', ');
    var sc = $('#ytScript'); if (sc) sc.value = y.script || ''; setImg('#ytCoverBox', '#ytCover', r.image);
  });
  var su = $('[data-s-upload]'); if (su) su.addEventListener('click', function () {
    var fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/jpeg,image/png';
    fi.onchange = function () { var fd = new FormData(); fd.append('act', 'upload'); fd.append('file', fi.files[0]); post('/studio', fd).then(function (r) { if (r.ok) setImg('#sImgBox', '#sImage', r.url); else alert(r.error); }); };
    fi.click();
  });
  var sc2 = $('[data-s-clear]'); if (sc2) sc2.addEventListener('click', function () { setImg('#sImgBox', '#sImage', ''); });
  var md = $('[data-mode]'); if (md) { var syncMode = function () { var s = $('[data-sched]'); if (s) s.hidden = md.value !== 'schedule'; }; md.addEventListener('change', syncMode); syncMode(); }
  var igb = $('[data-ig-fetch]'); if (igb) igb.addEventListener('click', function () {
    var fm = $('#igForm'), m = $('.form-msg', fm); igb.disabled = true; m.textContent = '…';
    post('/studio/channels', { act: 'ig_accounts', key: fm.elements.key.value }).then(function (r) {
      igb.disabled = false; if (!r.ok) { m.className = 'form-msg err'; m.textContent = r.error; return; }
      var s = fm.elements.ig_id; s.innerHTML = '';
      (r.accounts || []).forEach(function (a) { var o = document.createElement('option'); o.value = a.id; o.textContent = (a.instagramHandle || a.id) + (a.status && a.status !== 'connected' ? ' (' + a.status + ')' : ''); s.appendChild(o); });
      m.className = 'form-msg ok'; m.textContent = (r.accounts || []).length ? '✓ پیج‌ها دریافت شد' : 'پیجی به این کلید متصل نیست';
    });
  });
})();
