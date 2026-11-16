/* Поршень — автосервис. Ванильный JS + Motion (motion.dev, vanilla-режим). */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var M = window.Motion;
  var canAnimate = !!M && !!M.animate && !reduce;

  var header = document.getElementById('siteHeader');
  var burger = document.getElementById('burger');
  var panel = document.getElementById('mobilePanel');

  function trapFocus(e, root) {
    var items = Array.prototype.slice.call(
      root.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ---------- Шапка при скролле ---------- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var lastFocused = null;

  function openMenu() {
    lastFocused = document.activeElement;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
    panel.hidden = false;
    document.body.style.overflow = 'hidden';

    if (canAnimate) {
      M.animate(panel, { opacity: [0, 1] }, { duration: 0.25, easing: [0.22, 1, 0.36, 1] });
      M.animate(panel.querySelectorAll('.mobile-panel__link, .mobile-panel__foot'), {
        opacity: [0, 1],
        transform: ['translateY(18px)', 'translateY(0)']
      }, { duration: 0.45, delay: M.stagger ? M.stagger(0.05, { start: 0.06 }) : 0, easing: [0.22, 1, 0.36, 1] });
    }
    var first = panel.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu() {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    panel.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
  }

  burger.addEventListener('click', function () {
    if (burger.getAttribute('aria-expanded') === 'true') closeMenu();
    else openMenu();
  });

  panel.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) closeMenu();
    if (e.key === 'Tab' && !panel.hidden) trapFocus(e, panel);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 980 && !panel.hidden) closeMenu();
  });

  /* ---------- Лайтбокс ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxOpener = null;

  document.querySelectorAll('.photo').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lightboxOpener = btn;
      lightboxImg.src = btn.getAttribute('data-src');
      lightboxImg.alt = btn.querySelector('img') ? btn.querySelector('img').alt : 'Фото сервиса «Поршень»';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    });
  });

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (lightboxOpener) lightboxOpener.focus({ preventScroll: true });
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    if (e.key === 'Tab' && !lightbox.hidden) trapFocus(e, lightbox);
  });

  /* ---------- Motion ---------- */
  if (!canAnimate) {
    document.documentElement.classList.add('no-motion');
    return;
  }

  var ease = [0.22, 1, 0.36, 1];

  /* Интро героя */
  var heroParts = [
    '.hero__kicker',
    '.hero__title-top',
    '.hero__title-main',
    '.hero__side',
    '.info-bar'
  ].map(function (s) { return document.querySelector(s); }).filter(Boolean);

  M.animate(heroParts, {
    opacity: [0, 1],
    transform: ['translateY(30px)', 'translateY(0)']
  }, {
    duration: 0.9,
    delay: M.stagger ? M.stagger(0.08, { start: 0.1 }) : 0,
    easing: ease
  });

  /* Появление секций */
  var revealSelector = [
    '.section__label',
    '.section__title',
    '.section__lead',
    '.service-card',
    '.brands',
    '.photo',
    '.photos__foot',
    '.score',
    '.aspects',
    '.review',
    '.reviews__all',
    '.feature',
    '.cta__label',
    '.cta__title',
    '.cta__lead',
    '.cta__phone',
    '.cta__actions',
    '.cta__badge',
    '.facts'
  ].join(',');

  var items = Array.prototype.slice.call(document.querySelectorAll(revealSelector));
  items.forEach(function (el) { el.classList.add('reveal'); });

  items.forEach(function (el) {
    M.inView(el, function () {
      var siblings = el.parentElement
        ? Array.prototype.slice.call(el.parentElement.querySelectorAll(':scope > .reveal'))
        : [];
      var index = siblings.indexOf(el);
      M.animate(el, {
        opacity: [0, 1],
        transform: ['translateY(26px)', 'translateY(0)']
      }, {
        duration: 0.65,
        delay: Math.min(Math.max(index, 0) * 0.06, 0.3),
        easing: ease
      });
    }, { amount: 0.15 });
  });
})();
