/* Поршень — автосервис в Тольятти.
   Анимации — Motion (vanilla). Без JS страница остаётся полностью видимой. */

(function () {
  "use strict";

  var M = window.Motion;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canAnimate = Boolean(M) && !reduceMotion;
  var body = document.body;
  var EASE = [0.22, 1, 0.36, 1];

  /* ---------- Шапка ---------- */

  var header = document.getElementById("header");

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 18);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Появление блоков ---------- */

  var revealItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  if (canAnimate) {
    try {
      revealItems.forEach(function (el) {
        el.style.opacity = "0";
      });

      revealItems.forEach(function (el) {
      var parent = el.parentElement;
      var siblings = parent
        ? Array.prototype.slice
            .call(parent.children)
            .filter(function (node) {
              return node.hasAttribute("data-reveal");
            })
        : [];
      var index = Math.max(0, siblings.indexOf(el));
      var delay = Math.min(index * 0.055, 0.26);

      M.inView(
        el,
        function () {
          M.animate(
            el,
            { opacity: [0, 1], y: [22, 0] },
            { duration: 0.7, delay: delay, ease: EASE }
          );
        },
        { amount: 0.14, margin: "0px 0px -6% 0px" }
      );
    });

    // Страховка: если наблюдатель не сработал, первый экран не должен остаться пустым.
    window.setTimeout(function () {
      revealItems.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && getComputedStyle(el).opacity === "0") {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
    }, 3200);
    } catch (error) {
      revealItems.forEach(function (el) {
        el.style.opacity = "";
        el.style.transform = "";
      });
    }
  }

  /* ---------- Бегущая строка ---------- */

  var tickerTrack = document.getElementById("tickerTrack");
  var tickerAnimation = null;
  var tickerGroup = null;

  function buildTicker() {
    if (!tickerTrack || !canAnimate) return;
    tickerGroup = tickerTrack.querySelector(".ticker__group");
    if (!tickerGroup) return;

    if (!tickerTrack.dataset.cloned) {
      var clone = tickerGroup.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      tickerTrack.appendChild(clone);
      tickerTrack.dataset.cloned = "1";
    }

    var width = tickerGroup.getBoundingClientRect().width;
    if (width < 20) return;

    if (tickerAnimation) {
      tickerAnimation.stop();
    }

    tickerAnimation = M.animate(
      tickerTrack,
      { x: [0, -width] },
      {
        duration: Math.max(24, width / 34),
        ease: "linear",
        repeat: Infinity
      }
    );
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(buildTicker).catch(buildTicker);
  } else {
    window.addEventListener("load", buildTicker);
  }

  var tickerResize;
  window.addEventListener("resize", function () {
    if (!canAnimate) return;
    window.clearTimeout(tickerResize);
    tickerResize = window.setTimeout(function () {
      if (tickerAnimation) tickerAnimation.stop();
      buildTicker();
    }, 220);
  });

  /* ---------- Мобильное меню ---------- */

  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  var menuOpen = false;
  var menuCloseTimer = null;
  var menuLastFocus = null;

  function menuFocusables() {
    if (!menu) return [];
    return [
      burger,
      menu.querySelector(".mobile-menu__phone")
    ]
      .concat(
        Array.prototype.slice.call(
          menu.querySelectorAll(".mobile-menu__nav a")
        )
      )
      .filter(Boolean);
  }

  function openMenu() {
    if (!menu || !burger || menuOpen) return;
    menuOpen = true;
    menuLastFocus = document.activeElement;
    window.clearTimeout(menuCloseTimer);
    menu.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Закрыть меню");
    body.classList.add("is-locked");

    if (canAnimate) {
      menu.style.opacity = "0";
      M.animate(menu, { opacity: [0, 1] }, { duration: 0.24, ease: "easeOut" });

      Array.prototype.slice
        .call(menu.querySelectorAll(".mobile-menu__nav a"))
        .forEach(function (link, i) {
          link.style.opacity = "0";
          M.animate(
            link,
            { opacity: [0, 1], y: [18, 0] },
            { duration: 0.42, delay: 0.06 + i * 0.045, ease: EASE }
          );
        });
    }

    window.setTimeout(function () {
      if (!menuOpen) return;
      var first = menu.querySelector(".mobile-menu__nav a");
      if (first) first.focus();
    }, canAnimate ? 90 : 0);
  }

  function closeMenu(restoreFocus) {
    if (!menu || !burger || !menuOpen) return;
    menuOpen = false;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
    body.classList.remove("is-locked");

    function finish() {
      menu.hidden = true;
      menu.style.opacity = "";
      if (restoreFocus !== false) {
        if (menuLastFocus && menuLastFocus.focus) {
          menuLastFocus.focus();
        } else {
          burger.focus();
        }
      }
    }

    if (canAnimate) {
      M.animate(menu, { opacity: [1, 0] }, { duration: 0.16, ease: "easeIn" });
      menuCloseTimer = window.setTimeout(finish, 175);
    } else {
      finish();
    }
  }

  if (burger && menu) {
    var headerBrand = document.querySelector(".header .brand");
    if (headerBrand) {
      headerBrand.addEventListener("click", function () {
        if (menuOpen) closeMenu(false);
      });
    }

    burger.addEventListener("click", function () {
      if (menuOpen) closeMenu();
      else openMenu();
    });

    Array.prototype.slice
      .call(menu.querySelectorAll("a"))
      .forEach(function (link) {
        link.addEventListener("click", function () {
          closeMenu(false);
        });
      });

    document.addEventListener("keydown", function (event) {
      if (!menuOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;

      var focusables = menuFocusables();
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 980 && menuOpen) closeMenu(false);
    });
  }

  /* ---------- Лайтбокс ---------- */

  var galleryItems = Array.prototype.slice.call(
    document.querySelectorAll(".gallery__item")
  );
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxCounter = document.getElementById("lightboxCounter");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");
  var lightboxIndex = 0;
  var lightboxOpen = false;
  var lightboxLastFocus = null;

  var slides = galleryItems.map(function (button) {
    var img = button.querySelector("img");
    var cap = button.querySelector(".gallery__cap");
    return {
      src: img ? img.currentSrc || img.src : "",
      alt: img ? img.alt : "",
      caption: cap ? cap.textContent : ""
    };
  });

  function setSlide(index) {
    if (!slides.length) return;
    lightboxIndex = (index + slides.length) % slides.length;
    var slide = slides[lightboxIndex];
    lightboxImg.src = slide.src;
    lightboxImg.alt = slide.alt;
    lightboxCaption.textContent = slide.caption;
    lightboxCounter.textContent =
      String(lightboxIndex + 1).padStart(2, "0") +
      " / " +
      String(slides.length).padStart(2, "0");

    var next = slides[(lightboxIndex + 1) % slides.length];
    if (next) {
      var preload = new Image();
      preload.src = next.src;
    }
  }

  function openLightbox(index, trigger) {
    if (!lightbox || !slides.length) return;
    lightboxOpen = true;
    lightboxLastFocus = trigger || document.activeElement;
    setSlide(index);
    lightbox.hidden = false;
    body.classList.add("is-locked");

    if (canAnimate) {
      lightbox.style.opacity = "0";
      M.animate(lightbox, { opacity: [0, 1] }, { duration: 0.22, ease: "easeOut" });
      M.animate(
        lightboxImg,
        { opacity: [0, 1], scale: [0.985, 1] },
        { duration: 0.28, delay: 0.04, ease: EASE }
      );
    }

    window.setTimeout(function () {
      if (lightboxOpen && lightboxClose) lightboxClose.focus();
    }, canAnimate ? 40 : 0);
  }

  function closeLightbox() {
    if (!lightbox || !lightboxOpen) return;
    lightboxOpen = false;
    body.classList.remove("is-locked");

    function finish() {
      lightbox.hidden = true;
      lightbox.style.opacity = "";
      lightboxImg.removeAttribute("src");
      if (lightboxLastFocus && lightboxLastFocus.focus) {
        lightboxLastFocus.focus();
      }
    }

    if (canAnimate) {
      M.animate(lightbox, { opacity: [1, 0] }, { duration: 0.16, ease: "easeIn" });
      window.setTimeout(finish, 175);
    } else {
      finish();
    }
  }

  if (lightbox && lightboxImg) {
    galleryItems.forEach(function (button, index) {
      button.addEventListener("click", function () {
        openLightbox(index, button);
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", function () {
      setSlide(lightboxIndex - 1);
    });
    lightboxNext.addEventListener("click", function () {
      setSlide(lightboxIndex + 1);
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
      if (!lightboxOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSlide(lightboxIndex - 1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setSlide(lightboxIndex + 1);
        return;
      }
      if (event.key === "Tab") {
        var focusables = [lightboxClose, lightboxPrev, lightboxNext];
        var first = focusables[0];
        var last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }
})();
