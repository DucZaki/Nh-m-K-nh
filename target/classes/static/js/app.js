(function () {
  "use strict";

  var PRICING = [
    { id: "xingfa-window", name: "Cửa sổ nhôm Xingfa", price: 2200000, unit: "m²" },
    { id: "xingfa-door", name: "Cửa đi nhôm Xingfa", price: 2500000, unit: "m²" },
    { id: "tempered-glass", name: "Kính cường lực (10mm)", price: 1100000, unit: "m²" },
    { id: "glass-railing", name: "Lan can kính", price: 1500000, unit: "md" },
  ];

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function scrollToHash(hash) {
    if (!hash || hash === "#") return;
    var el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  /* Header */
  var header = qs(".header");
  var mobileToggle = qs("[data-mobile-toggle]");
  var mobilePanel = qs("[data-mobile-panel]");
  var mobileOpen = false;

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 20) header.classList.add("header--scrolled");
    else header.classList.remove("header--scrolled");
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function syncMobileMenuIcons(open) {
    if (!mobileToggle) return;
    var iconMenu = qs("[data-icon-menu]", mobileToggle);
    var iconClose = qs("[data-icon-close]", mobileToggle);
    if (iconMenu) iconMenu.style.display = open ? "none" : "block";
    if (iconClose) iconClose.style.display = open ? "block" : "none";
  }

  function setMobileMenuOpen(open) {
    mobileOpen = open;
    if (mobilePanel) mobilePanel.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("is-mobile-nav-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    syncMobileMenuIcons(open);
  }

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function () {
      setMobileMenuOpen(!mobileOpen);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileOpen) setMobileMenuOpen(false);
    });
  }

  qsa('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute("href");
    if (href && href.length > 1 && document.querySelector(href)) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        scrollToHash(href);
        if (mobilePanel && mobileOpen) setMobileMenuOpen(false);
      });
    }
  });

  qsa("[data-scroll-to]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      scrollToHash(btn.getAttribute("data-scroll-to"));
      if (mobilePanel && mobileOpen) setMobileMenuOpen(false);
    });
  });

  /* Hero carousel */
  var heroSlides = qsa("[data-hero-slide]");
  var heroDots = qsa("[data-hero-dot]");
  var heroIdx = 0;
  var heroTimer;

  function showHero(i) {
    heroIdx = (i + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (el, j) {
      el.classList.toggle("is-active", j === heroIdx);
    });
    heroDots.forEach(function (el, j) {
      el.classList.toggle("is-active", j === heroIdx);
    });
  }

  function nextHero() {
    showHero(heroIdx + 1);
  }

  if (heroSlides.length) {
    showHero(0);
    heroTimer = setInterval(nextHero, 5000);
    heroDots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        clearInterval(heroTimer);
        showHero(i);
        heroTimer = setInterval(nextHero, 5000);
      });
    });
  }

  /* Cost estimator */
  var estRoot = qs("[data-estimator]");
  if (estRoot) {
    var estAmount = qs("[data-est-amount]");
    var estUnitLabel = qs("[data-est-unit-label]");
    var estArea = qs("[data-est-area]");

    function selectedPricing() {
      var sel = qs("[data-est-opt].is-selected", estRoot);
      var id = sel ? sel.getAttribute("data-est-opt") : PRICING[0].id;
      for (var i = 0; i < PRICING.length; i++) {
        if (PRICING[i].id === id) return PRICING[i];
      }
      return PRICING[0];
    }

    function formatVnd(n) {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
    }

    function updateEst() {
      var p = selectedPricing();
      var area = parseFloat(estArea.value, 10);
      if (isNaN(area) || area < 0) area = 0;
      if (estAmount) estAmount.textContent = formatVnd(p.price * area);
      if (estUnitLabel) estUnitLabel.textContent = p.unit;
      var estUnitSuf = qs("[data-est-unit-suffix]");
      if (estUnitSuf) estUnitSuf.textContent = p.unit;
    }

    qsa("[data-est-opt]", estRoot).forEach(function (btn) {
      btn.addEventListener("click", function () {
        qsa("[data-est-opt]", estRoot).forEach(function (b) {
          b.classList.remove("is-selected");
        });
        btn.classList.add("is-selected");
        updateEst();
      });
    });

    if (estArea) estArea.addEventListener("input", updateEst);
    updateEst();
  }

  /* Quote form */
  var form = qs("[data-quote-form]");
  var modal = qs("[data-success-modal]");
  var modalName = qs("[data-modal-name]");

  function phoneValid(phone) {
    var p = phone.replace(/\s/g, "");
    return /^(0|\+84)[0-9]{9}$/.test(p);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fullName = qs("[name=fullName]", form).value.trim();
      var phone = qs("[name=phone]", form).value.trim();
      var constructionType = qs("[name=constructionType]", form).value;

      var errs = {};
      if (!fullName) errs.fullName = true;
      if (!phone) errs.phoneReq = true;
      else if (!phoneValid(phone)) errs.phoneBad = true;
      if (!constructionType) errs.constructionType = true;

      qsa("[data-field-error]", form).forEach(function (el) {
        el.style.display = "none";
      });
      qsa(".quote__input", form).forEach(function (inp) {
        inp.classList.remove("quote__input--error");
      });

      if (errs.fullName) {
        qs("[data-field-error=fullName]", form).style.display = "block";
        qs("[name=fullName]", form).classList.add("quote__input--error");
      }
      if (errs.phoneReq) {
        qs("[data-field-error=phoneReq]", form).style.display = "block";
        qs("[name=phone]", form).classList.add("quote__input--error");
      }
      if (errs.phoneBad) {
        qs("[data-field-error=phoneBad]", form).style.display = "block";
        qs("[name=phone]", form).classList.add("quote__input--error");
      }
      if (errs.constructionType) {
        qs("[data-field-error=constructionType]", form).style.display = "block";
        qs("[name=constructionType]", form).classList.add("quote__input--error");
      }

      if (Object.keys(errs).length) return;

      var submitBtn = qs("[type=submit]", form);
      submitBtn.disabled = true;
      qs("[data-submit-idle]", submitBtn).style.display = "none";
      qs("[data-submit-load]", submitBtn).style.display = "flex";

      setTimeout(function () {
        submitBtn.disabled = false;
        qs("[data-submit-idle]", submitBtn).style.display = "flex";
        qs("[data-submit-load]", submitBtn).style.display = "none";
        if (modalName) modalName.textContent = fullName;
        if (modal) {
          modal.classList.add("is-open");
          modal.setAttribute("aria-hidden", "false");
        }
      }, 1800);
    });
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (form) form.reset();
  }

  qsa("[data-modal-close]").forEach(function (btn) {
    btn.addEventListener("click", closeModal);
  });

  /* About ↔ Experts toggle — giữ chiều cao khung section trên desktop */
  var aboutMain = qs('[data-about-view="main"]');
  var aboutExperts = qs('[data-about-view="experts"]');
  var aboutStage = qs(".about__stage");
  var aboutShowExpertsBtn = qs("[data-about-show-experts]");
  var aboutShowMainBtn = qs("[data-about-show-main]");

  function syncAboutStageMinHeight() {
    if (!aboutStage || !aboutMain) return;
    if (window.innerWidth <= 1024) {
      aboutStage.style.removeProperty("--about-stage-min-h");
      return;
    }
    if (aboutMain.classList.contains("is-hidden")) return;
    var h = aboutMain.offsetHeight;
    if (h > 0) aboutStage.style.setProperty("--about-stage-min-h", h + "px");
  }

  function showAboutExperts(show) {
    if (!aboutMain || !aboutExperts) return;
    if (show) {
      syncAboutStageMinHeight();
      aboutMain.classList.add("is-hidden");
      aboutExperts.classList.remove("is-hidden");
      var aboutSec = qs("#about");
      if (aboutSec) {
        var headerH = header ? header.offsetHeight : 72;
        var y = aboutSec.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    } else {
      aboutExperts.classList.add("is-hidden");
      aboutMain.classList.remove("is-hidden");
      syncAboutStageMinHeight();
    }
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  if (aboutShowExpertsBtn) {
    aboutShowExpertsBtn.addEventListener("click", function () {
      showAboutExperts(true);
    });
  }
  if (aboutShowMainBtn) {
    aboutShowMainBtn.addEventListener("click", function () {
      showAboutExperts(false);
    });
  }

  if (aboutStage && aboutMain) {
    window.addEventListener("resize", syncAboutStageMinHeight);
    window.addEventListener("load", syncAboutStageMinHeight);
    syncAboutStageMinHeight();
  }

  /* Chuyên gia — ≤1024px (tablet): chạm thẻ / ảnh (không chạm overlay) để mở/đóng chi tiết */
  function isExpertTapLayout() {
    return window.innerWidth <= 1024;
  }

  function syncExpertCardAria(card, open) {
    card.setAttribute("aria-expanded", open ? "true" : "false");
    var ov = qs(".expert-card__overlay", card);
    if (ov) ov.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function resetExpertCardsForDesktop() {
    qsa(".expert-card").forEach(function (card) {
      card.classList.remove("expert-card--open");
      card.removeAttribute("aria-expanded");
      var ov = qs(".expert-card__overlay", card);
      if (ov) ov.setAttribute("aria-hidden", "true");
    });
  }

  function bindExpertMobileToggle(card) {
    if (!qs(".expert-card__media", card)) return;

    var touchTapY = null;
    var suppressClickFromTouch = false;

    function toggleFromInteraction() {
      if (!isExpertTapLayout()) return;
      var nextOpen = !card.classList.contains("expert-card--open");
      if (nextOpen) {
        qsa(".expert-card.expert-card--open").forEach(function (other) {
          if (other !== card) {
            other.classList.remove("expert-card--open");
            syncExpertCardAria(other, false);
          }
        });
      }
      card.classList.toggle("expert-card--open", nextOpen);
      syncExpertCardAria(card, nextOpen);
      if (nextOpen) {
        var ov = qs(".expert-card__overlay", card);
        if (ov) {
          requestAnimationFrame(function () {
            ov.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
          });
        }
      }
    }

    function targetIgnoresToggle(t) {
      return !t || typeof t.closest !== "function" || t.closest(".expert-card__overlay");
    }

    card.addEventListener(
      "touchstart",
      function (e) {
        if (!isExpertTapLayout()) return;
        if (!e.touches || !e.touches.length) return;
        touchTapY = e.touches[0].clientY;
      },
      { passive: true }
    );

    card.addEventListener(
      "touchend",
      function (e) {
        if (!isExpertTapLayout()) return;
        if (targetIgnoresToggle(e.target)) return;
        if (touchTapY === null) return;
        var endY = e.changedTouches && e.changedTouches.length ? e.changedTouches[0].clientY : touchTapY;
        if (Math.abs(endY - touchTapY) > 14) {
          touchTapY = null;
          return;
        }
        touchTapY = null;
        suppressClickFromTouch = true;
        setTimeout(function () {
          suppressClickFromTouch = false;
        }, 480);
        e.preventDefault();
        toggleFromInteraction();
      },
      { passive: false }
    );

    card.addEventListener("touchcancel", function () {
      touchTapY = null;
    });

    card.addEventListener("click", function (e) {
      if (!isExpertTapLayout()) return;
      if (suppressClickFromTouch) return;
      if (targetIgnoresToggle(e.target)) return;
      toggleFromInteraction();
    });

    card.addEventListener("keydown", function (e) {
      if (!isExpertTapLayout()) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      var overlay = qs(".expert-card__overlay", card);
      if (overlay && overlay.contains(document.activeElement)) return;
      if (e.target !== card) return;
      e.preventDefault();
      toggleFromInteraction();
    });
  }

  qsa(".expert-card").forEach(function (card) {
    bindExpertMobileToggle(card);
  });

  function onExpertBpChange() {
    if (!isExpertTapLayout()) {
      resetExpertCardsForDesktop();
      return;
    }
    qsa(".expert-card").forEach(function (card) {
      syncExpertCardAria(card, card.classList.contains("expert-card--open"));
    });
  }
  onExpertBpChange();
  window.addEventListener("resize", onExpertBpChange);

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
})();
