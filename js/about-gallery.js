/* About page: filterable gallery with lightbox */
(function () {
  'use strict';
  var tiles = [].slice.call(document.querySelectorAll('.gallery-tile'));
  var filters = [].slice.call(document.querySelectorAll('.gallery-filter'));
  var box = document.getElementById('galleryLightbox');
  var count = document.querySelector('.gallery-count');
  if (!box || !tiles.length) return;

  var photo = box.querySelector('img');
  var caption = box.querySelector('figcaption');
  var closeBtn = box.querySelector('.lightbox-close');
  var prevBtn = box.querySelector('.lightbox-prev');
  var nextBtn = box.querySelector('.lightbox-next');
  var visible = tiles, index = 0, lastFocus = null, startX = null;

  function show(i) {
    index = (i + visible.length) % visible.length;
    var t = visible[index];
    photo.src = t.dataset.image;
    photo.alt = t.dataset.caption;
    caption.textContent = t.dataset.caption;
  }
  function open(tile) {
    lastFocus = document.activeElement;
    visible = tiles.filter(function (t) { return !t.hidden; });
    show(visible.indexOf(tile));
    var single = visible.length < 2;
    prevBtn.hidden = nextBtn.hidden = single;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function close() {
    box.hidden = true;
    document.body.style.overflow = '';
    photo.removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  filters.forEach(function (b) {
    b.addEventListener('click', function () {
      var shown = 0;
      filters.forEach(function (x) {
        var on = x === b;
        x.classList.toggle('active', on);
        x.setAttribute('aria-pressed', String(on));
      });
      tiles.forEach(function (t) {
        t.hidden = b.dataset.filter !== 'all' && t.dataset.category !== b.dataset.filter;
        if (!t.hidden) shown++;
      });
      if (count) count.textContent = shown + (shown === 1 ? ' PHOTOGRAPH' : ' PHOTOGRAPHS');
    });
  });
  tiles.forEach(function (t) { t.addEventListener('click', function () { open(t); }); });
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(index - 1); });
  nextBtn.addEventListener('click', function () { show(index + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'Tab') {                 /* keep focus inside the viewer */
      var f = [].slice.call(box.querySelectorAll('button')).filter(function (b) { return !b.hidden; });
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  box.addEventListener('touchstart', function (e) { startX = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });
})();
