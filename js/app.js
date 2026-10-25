/* Zetahir Mission — site behaviour */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  root.classList.add('js');

  var header = doc.querySelector('.site-header');
  var btn = doc.getElementById('hamburger');
  var panel = doc.getElementById('navPanel');
  var mobile = window.matchMedia('(max-width:1024px)');
  var subs = [].slice.call(doc.querySelectorAll('.has-sub'));

  /* Header turns solid once the page scrolls */
  function onScroll() {
    if (header) header.classList.toggle('is-solid', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  function setMenu(open) {
    if (!btn || !panel) return;
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    body.classList.toggle('menu-open', open && mobile.matches);
  }
  function closeSubs(except) {
    subs.forEach(function (li) {
      if (li === except) return;
      li.classList.remove('open');
      var t = li.querySelector('.sub-toggle');
      if (t && !mobile.matches) t.setAttribute('aria-expanded', 'false');
    });
  }
  function syncToggles() {
    subs.forEach(function (li) {
      var t = li.querySelector('.sub-toggle');
      if (!t) return;
      t.disabled = mobile.matches;                 /* sub-links are always visible on phones */
      t.setAttribute('aria-expanded', mobile.matches ? 'true' : String(li.classList.contains('open')));
    });
  }
  if (btn && panel) {
    btn.addEventListener('click', function () { setMenu(!panel.classList.contains('open')); });
    panel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }
  subs.forEach(function (li) {
    var t = li.querySelector('.sub-toggle');
    if (!t) return;
    t.addEventListener('click', function () {
      if (mobile.matches) return;
      var open = !li.classList.contains('open');
      closeSubs(li);
      li.classList.toggle('open', open);
      t.setAttribute('aria-expanded', String(open));
    });
  });
  doc.addEventListener('click', function (e) {
    if (!e.target.closest('.has-sub')) closeSubs();
    if (panel && panel.classList.contains('open') && !e.target.closest('.nav')) setMenu(false);
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeSubs();
    if (panel && panel.classList.contains('open')) { setMenu(false); if (btn) btn.focus(); }
  });
  (mobile.addEventListener ? mobile.addEventListener.bind(mobile, 'change') : mobile.addListener.bind(mobile))(function () {
    setMenu(false); closeSubs(); syncToggles();
  });
  window.addEventListener('pageshow', function () { setMenu(false); });
  syncToggles();

  /* Image slots: if a photo is missing, the designed fallback behind it shows instead of a broken icon */
  doc.querySelectorAll('.media img').forEach(function (img) {
    function drop() { img.remove(); }
    img.addEventListener('error', drop);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') drop();
  });

  /* Gentle scroll reveal (content stays visible if JS or IntersectionObserver is unavailable) */
  var targets = [].slice.call(doc.querySelectorAll(
    '.section-head,.home-opening-grid>*,.two-col>*,.pillar,.purpose-heading,.purpose-card,.home-center,' +
    '.info-card,.cta-card,.story-row,.about-intro .container>*,.gallery-heading,.gallery-tile,' +
    '.weekly-event,.special-card,.events-section-head,.photo-band-grid>*,.contact-intro,.contact-block,' +
    '.secondary-phone a,.map-layout>*,.social-row>*,.article>*,.aside-card,.quote-section .container>*'
  ));
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.classList.add('in-view');
        setTimeout(function () {               /* hand control back to normal hover transitions */
          el.classList.remove('reveal', 'in-view');
          el.style.transitionDelay = '';
        }, 1400);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) {
      var i = [].indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* Reading progress on teaching pages */
  var article = doc.querySelector('.article');
  if (article) {
    var bar = doc.createElement('div');
    bar.className = 'read-progress';
    bar.setAttribute('aria-hidden', 'true');
    body.appendChild(bar);
    var tick = function () {
      var r = article.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var done = Math.min(1, Math.max(0, (-r.top + window.innerHeight * 0.2) / total));
      bar.style.width = (done * 100).toFixed(1) + '%';
    };
    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
  }

  /* Footer year */
  doc.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
