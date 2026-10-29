(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var A = window.ADM || { base: '', csrf: '' };
  function post(url, fd, onProg) {
    return new Promise(function (res) {
      var x = new XMLHttpRequest(); x.open('POST', A.base + url); x.setRequestHeader('X-CSRF', A.csrf); x.setRequestHeader('Accept', 'application/json');
      if (onProg && x.upload) x.upload.onprogress = function (e) { if (e.lengthComputable) onProg(e.loaded / e.total); };
      x.onload = function () { try { res(JSON.parse(x.responseText)); } catch (e) { res({ ok: false, error: 'خطای سرور' }); } };
      x.onerror = function () { res({ ok: false, error: 'اتصال برقرار نشد' }); };
      if (!fd.has('_csrf')) fd.append('_csrf', A.csrf); x.send(fd);
    });
  }
  // sidebar
  var side = $('#as'), mask = $('.as-mask');
  $$('[data-side]').forEach(function (b) { b.addEventListener('click', function () { side.classList.toggle('open'); mask.classList.toggle('open'); }); });
  // responsive tables: label every cell from its header
  $$('table.tbl').forEach(function (t) { var hs = $$('thead th', t).map(function (h) { return h.textContent.trim(); }); $$('tbody tr', t).forEach(function (r) { $$('td', r).forEach(function (td, i) { if (hs[i]) td.setAttribute('data-label', hs[i]); }); }); });
  // alerts
  $$('[data-autohide]').forEach(function (a) { setTimeout(function () { a.style.opacity = 0; setTimeout(function () { a.remove(); }, 400); }, 5000); });
  // confirm
  $$('form[data-confirm]').forEach(function (f) { f.addEventListener('submit', function (e) { if (!confirm(f.getAttribute('data-confirm'))) e.preventDefault(); }); });
  document.addEventListener('click', function (e) { var b = e.target.closest('button[data-confirm]'); if (b && !confirm(b.getAttribute('data-confirm'))) e.preventDefault(); }, true);
  // tabs
  $$('[data-tabs]').forEach(function (t) {
    var scope = t.parentNode;
    function show(k) { $$('button', t).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === k); }); $$('[data-pane]', scope).forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== k; }); var tf = $('input[name=tab]', scope); if (tf) tf.value = k; history.replaceState(null, '', '#' + k); }
    t.addEventListener('click', function (e) { var b = e.target.closest('button[data-tab]'); if (b) show(b.getAttribute('data-tab')); });
    if (location.hash && $('button[data-tab="' + location.hash.slice(1) + '"]', t)) show(location.hash.slice(1));
  });
  // money inputs
  $$('[data-money]').forEach(function (i) { i.addEventListener('input', function () { var v = i.value.replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).replace(/\D/g, ''); i.value = v ? Number(v).toLocaleString('en-US') : ''; }); });
  // color sync
  $$('[data-sync]').forEach(function (c) { var t = document.getElementById(c.getAttribute('data-sync')); c.addEventListener('input', function () { t.value = c.value; }); t.addEventListener('input', function () { if (/^#[0-9a-f]{6}$/i.test(t.value)) c.value = t.value; }); });
  // emoji picker
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-emo]'); if (b) document.getElementById(b.getAttribute('data-for')).value = b.getAttribute('data-emo'); });
  // markdown toolbar
  $$('[data-md]').forEach(function (bar) {
    var ta = document.getElementById(bar.getAttribute('data-md'));
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var s = ta.selectionStart, en = ta.selectionEnd, v = ta.value;
      if (b.dataset.w) { ta.value = v.slice(0, s) + b.dataset.w + v.slice(s, en) + b.dataset.w + v.slice(en); }
      else { var ls = v.lastIndexOf('\n', s - 1) + 1; ta.value = v.slice(0, ls) + b.dataset.l + v.slice(ls); }
      ta.focus();
    });
  });
  // single upload (image / file)
  function pick(accept, multi, cb) { var f = document.createElement('input'); f.type = 'file'; f.accept = accept; f.multiple = !!multi; f.onchange = function () { cb(Array.prototype.slice.call(f.files)); }; f.click(); }
  $$('[data-up]').forEach(function (u) {
    var kind = u.getAttribute('data-up'), hid = $('input[type=hidden],input[type=text]', u), prev = $('.up-prev', u), clr = $('[data-clear]', u), prog = $('.prog', u);
    $('[data-pick]', u).addEventListener('click', function () {
      pick(kind === 'image' ? 'image/*' : '*/*', false, function (files) {
        if (!files[0]) return; var fd = new FormData(); fd.append('file', files[0]); fd.append('kind', kind);
        if (prog) { prog.hidden = false; }
        post('/admin/upload', fd, function (p) { if (prog) $('i', prog).style.width = Math.round(p * 100) + '%'; }).then(function (r) {
          if (prog) prog.hidden = true;
          if (!r.ok) { alert(r.error); return; }
          hid.value = r.url; if (prev) prev.innerHTML = '<img src="' + r.url + '" alt="">'; if (clr) clr.hidden = false;
        });
      });
    });
    if (clr) clr.addEventListener('click', function () { hid.value = ''; prev.innerHTML = '<span>🖼️</span>'; clr.hidden = true; });
  });
  // gallery upload
  $$('[data-gal]').forEach(function (g) {
    var hid = $('input[type=hidden]', g), list = $('.gal-list', g);
    function sync() { hid.value = $$('.gi', list).map(function (x) { return x.getAttribute('data-src'); }).join('\n'); }
    function add(u) { var d = document.createElement('div'); d.className = 'gi'; d.setAttribute('data-src', u); d.draggable = true; d.innerHTML = '<img src="' + u + '" alt=""><button type="button">✕</button>'; list.appendChild(d); }
    list.addEventListener('click', function (e) { if (e.target.tagName === 'BUTTON') { e.target.parentNode.remove(); sync(); } });
    $('[data-pick-multi]', g).addEventListener('click', function () {
      pick('image/*', true, function (files) {
        files.reduce(function (p, file) { return p.then(function () { var fd = new FormData(); fd.append('file', file); return post('/admin/upload', fd).then(function (r) { if (r.ok) { add(r.url); sync(); } else alert(r.error); }); }); }, Promise.resolve());
      });
    });
    var drag = null;
    list.addEventListener('dragstart', function (e) { drag = e.target.closest('.gi'); });
    list.addEventListener('dragover', function (e) { e.preventDefault(); var o = e.target.closest('.gi'); if (o && drag && o !== drag) list.insertBefore(drag, o); });
    list.addEventListener('drop', function (e) { e.preventDefault(); sync(); });
    $$('.gi', list).forEach(function (x) { x.draggable = true; });
  });
  // drag-sort table rows
  $$('table[data-sortable]').forEach(function (t) {
    var coll = t.getAttribute('data-sortable'), body = $('tbody', t), drag = null;
    $$('tr', body).forEach(function (r) {
      var h = $('.drag', r); if (!h) return; h.draggable = true;
      h.addEventListener('dragstart', function (e) { drag = r; r.classList.add('dragging'); e.dataTransfer.setData('text/plain', ''); });
      h.addEventListener('dragend', function () { r.classList.remove('dragging'); $$('.over', body).forEach(function (x) { x.classList.remove('over'); });
        var fd = new FormData(); fd.append('act', 'sort'); $$('tr', body).forEach(function (x) { fd.append('order[]', x.getAttribute('data-id')); }); post('/admin/c/' + coll, fd); });
      r.addEventListener('dragover', function (e) { e.preventDefault(); if (drag && drag !== r) { r.classList.add('over'); } });
      r.addEventListener('dragleave', function () { r.classList.remove('over'); });
      r.addEventListener('drop', function (e) { e.preventDefault(); r.classList.remove('over'); if (drag && drag !== r) body.insertBefore(drag, r); });
    });
  });
  // AI writer
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ai]'); if (!b) return;
    var ta = document.getElementById(b.getAttribute('data-ai')); var form = b.closest('form');
    var title = form && form.querySelector('[name="f[title]"],[name="h[hero_title]"]'); var lbl = b.closest('.fld').querySelector('label');
    var fd = new FormData(); fd.append('label', lbl ? lbl.textContent : ''); fd.append('title', title ? title.value : ''); fd.append('current', ta.value);
    var t = b.textContent; b.disabled = true; b.textContent = '⏳ در حال نوشتن…';
    post('/admin/ai', fd).then(function (r) { b.disabled = false; b.textContent = t; if (r.ok) ta.value = r.text; else alert(r.error); });
  });
})();
