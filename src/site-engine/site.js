(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var S = window.SITE || { base: '', csrf: '' };
  var fa = function (n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); };
  function toast(t) { var el = $('.toast') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'toast' })); el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('show'); }, 2600); }
  function post(url, data) {
    var fd = data instanceof FormData ? data : new FormData(); if (!(data instanceof FormData)) Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
    if (!fd.has('_csrf')) fd.append('_csrf', S.csrf);
    return fetch(url, { method: 'POST', body: fd, headers: { Accept: 'application/json', 'X-CSRF': S.csrf }, credentials: 'same-origin' }).then(function (r) { return r.json().catch(function () { return { ok: false, error: 'خطای سرور' }; }); });
  }
  // reveal
  if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .08 }); $$('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i % 6) * 60 + 'ms'; io.observe(el); }); }
  else $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  // mobile nav
  var b = $('[data-burger]'), nav = $('#nav');
  if (b && nav) { b.addEventListener('click', function () { nav.classList.toggle('open'); }); $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); }); }
  // tabs (menu groups / login-register)
  $$('[data-tabs]').forEach(function (t) {
    t.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-tab]'); if (!btn) return;
      $$('button', t).forEach(function (x) { x.classList.toggle('on', x === btn); });
      var scope = t.parentNode; $$('[data-pane]', scope).forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== btn.getAttribute('data-tab'); });
    });
  });
  // ajax forms
  $$('form[data-ajax]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var btn = $('button[type=submit]', f), m = $('.fmsg', f); btn.disabled = true;
      post(f.action, new FormData(f)).then(function (r) { m.textContent = r.ok ? r.msg : r.error; m.className = 'fmsg ' + (r.ok ? 'ok' : 'err'); if (r.ok) f.reset(); }).finally(function () { btn.disabled = false; });
    });
  });
  // cart
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-add]'); if (!a) return;
    var q = 1; var from = a.getAttribute('data-qty-from'); if (from && $(from)) q = parseInt($(from).value, 10) || 1;
    a.disabled = true;
    post(S.base + '/cart/add', { id: a.getAttribute('data-add'), qty: q }).then(function (r) {
      a.disabled = false; toast(r.ok ? r.msg + ' ✓' : r.error);
      if (r.ok) { var c = $('#cartCount'); if (c) { c.hidden = false; c.textContent = fa(r.count); } }
    });
  });
  $$('.qty button').forEach(function (bt) { bt.addEventListener('click', function () { var i = bt.parentNode.querySelector('input'); i.value = Math.max(1, (parseInt(i.value, 10) || 1) + parseInt(bt.getAttribute('data-q'), 10)); }); });
  // gallery thumbs + lightbox
  $$('[data-thumb]').forEach(function (t) { t.addEventListener('click', function () { var m = $('#dgMain'); if (m) { m.src = t.getAttribute('data-thumb'); m.parentNode.href = t.getAttribute('data-thumb'); } }); });
  document.addEventListener('click', function (e) {
    var l = e.target.closest('[data-lightbox]'); if (!l || !l.getAttribute('href')) return; e.preventDefault();
    var box = document.createElement('div'); box.className = 'lb'; box.innerHTML = '<img src="' + l.getAttribute('href') + '" alt="">'; box.onclick = function () { box.remove(); }; document.body.appendChild(box);
  });
  // Persian digits → latin in numeric inputs
  $$('input[inputmode=numeric],input[dir=ltr]').forEach(function (i) { i.addEventListener('input', function () { var v = i.value.replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }); if (v !== i.value) i.value = v; }); });
})();
