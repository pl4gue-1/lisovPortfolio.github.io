/* Логика страницы: ленты, кейсы, лайтбокс, язык, качание кадил. */

(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var contentCx = 0; // центр колонки контента, px (обновляется в fitRails)

  var lang = "ru";
  try {
    lang = localStorage.getItem("dsn-lang") || "ru";
  } catch (e) { /* приватный режим */ }

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  }
  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function t(key) {
    var d = window.I18N[lang] || window.I18N.ru;
    return d[key] || window.I18N.ru[key] || key;
  }

  function titleOf(item) {
    return lang === "en" ? (item.en || item.ru || "") : (item.ru || item.en || "");
  }

  /* ---------- статические тексты ---------- */

  function applyStatic() {
    root.lang = lang;
    $$("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    $$("[data-alt-ru]").forEach(function (el) {
      el.alt = lang === "en"
        ? el.getAttribute("data-alt-en")
        : el.getAttribute("data-alt-ru");
    });
    var btn = $("#langBtn");
    if (btn) {
      $$("[data-lang]", btn).forEach(function (span) {
        span.classList.toggle("is-active", span.getAttribute("data-lang") === lang);
      });
    }
    doc.title = lang === "en"
      ? "Konstantin Lisov — 3D · VFX · Motion"
      : "Константин Лисов — 3D · VFX · Motion";
  }

  /* ---------- ленты работ ---------- */

  function makeWorkCard(item, index) {
    if (!item.img) {
      var empty = doc.createElement("div");
      empty.className = "card card--empty";
      empty.innerHTML =
        '<span class="card__idx">' + pad(index + 1) + "</span>" +
        '<span class="card__note">' + t("works.soon") + "</span>";
      return empty;
    }

    var btn = doc.createElement("button");
    btn.type = "button";
    btn.className = "card";
    btn.dataset.caption = titleOf(item);

    var img = doc.createElement("img");
    img.src = item.img;
    img.alt = titleOf(item);
    img.loading = "lazy";
    img.decoding = "async";

    var cap = doc.createElement("span");
    cap.className = "card__cap";
    cap.textContent = titleOf(item);

    btn.appendChild(img);
    btn.appendChild(cap);
    return btn;
  }

  function buildRibbon(container, items) {
    container.innerHTML = "";

    var track = doc.createElement("div");
    track.className = "track";
    var group = doc.createElement("div");
    group.className = "group";

    items.forEach(function (item, i) {
      group.appendChild(makeWorkCard(item, i));
    });

    track.appendChild(group);
    container.appendChild(track);

    /* достраиваем набор, пока лента не станет шире контейнера */
    var guard = 0;
    while (group.scrollWidth < container.clientWidth + 320 && guard < 20) {
      items.forEach(function (item, i) {
        group.appendChild(makeWorkCard(item, i));
      });
      guard += 1;
    }

    var clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    Array.prototype.forEach.call(clone.querySelectorAll("button"), function (b) {
      b.tabIndex = -1;
    });
    track.appendChild(clone);

    var dur = Math.max(22, Math.round(group.scrollWidth / 55));
    track.style.setProperty("--dur", dur + "s");
  }

  function renderWorks() {
    $$("[data-ribbon]").forEach(function (el) {
      var key = el.getAttribute("data-ribbon");
      var items = (window.SITE.works && window.SITE.works[key]) || [];
      if (!items.length) {
        items = Array.from({ length: 8 }, function () { return {}; });
      }
      buildRibbon(el, items);
    });
  }

  /* ---------- кейсы ---------- */

  function renderCases() {
    var grid = $("[data-cases]");
    if (!grid) return;

    var items = window.SITE.cases || [];
    if (!items.length) {
      items = Array.from({ length: 4 }, function () { return {}; });
    }

    grid.innerHTML = "";

    items.forEach(function (item, i) {
      var art = doc.createElement("article");
      art.className = "case";

      var media = doc.createElement("div");
      media.className = "case__media" + (item.img ? "" : " is-empty");

      if (item.img) {
        var img = doc.createElement("img");
        img.src = item.img;
        img.alt = titleOf(item);
        img.loading = "lazy";
        media.appendChild(img);
      } else {
        var note = doc.createElement("span");
        note.className = "ph-note";
        note.textContent = t("cases.soon");
        media.appendChild(note);
      }

      var meta = doc.createElement("div");
      meta.className = "case__meta";

      var title = doc.createElement("span");
      title.className = "case__title";
      title.textContent = pad(i + 1) + " · " +
        (item.img ? titleOf(item) : t("cases.name"));

      var tag = doc.createElement("span");
      tag.className = "case__tag";
      tag.textContent = item.tag || "";

      meta.appendChild(title);
      meta.appendChild(tag);

      art.appendChild(media);
      art.appendChild(meta);
      grid.appendChild(art);
    });

    var count = $("#cases .sec-tag");
    if (count) count.textContent = pad(items.length);
  }

  /* ---------- ссылки из конфига ---------- */

  function applyLinks() {
    var contacts = window.SITE.contacts || {};

    $$("[data-contact]").forEach(function (a) {
      var href = contacts[a.getAttribute("data-contact")];
      if (!href) return;
      a.setAttribute("href", href);
      if (/^https?:/i.test(href)) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
    });

    $$("[data-link]").forEach(function (a) {
      var href = contacts[a.getAttribute("data-link")];
      if (!href) return;
      a.setAttribute("href", href);
      if (/^https?:/i.test(href)) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
    });
  }

  /* ---------- подгонка отступов под реальную ширину кадил ---------- */

  function fitRails() {
    var left = $(".rail--left");
    var right = $(".rail--right");
    if (!left || !right) return;

    var gap = 26;
    var l = left.getBoundingClientRect();
    var r = right.getBoundingClientRect();

    var padL = l.right + gap;
    var padR = window.innerWidth - r.left + gap;

    /* на широких экранах не даём строке растянуться до бесконечности */
    var content = window.innerWidth - padL - padR;
    if (content > 1320) {
      var extra = (content - 1320) / 2;
      padL += extra;
      padR += extra;
    }

    root.style.setProperty("--padL", Math.round(padL) + "px");
    root.style.setProperty("--padR", Math.round(padR) + "px");

    /* центр колонки контента — для врат, сигилов и кадил */
    var cx = padL + (window.innerWidth - padL - padR) / 2;
    contentCx = cx;
    root.style.setProperty("--cx", Math.round(cx) + "px");
  }

  /* ---------- качание кадил от скролла ---------- */

  var kads = [];

  function initSway() {
    kads = $$(".kadilo");
    if (reduceMotion) return;

    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || 0;
      
      // Раскачивание туда-обратно с помощью синуса.
      // 0.01 — это частота (влияет на то, как часто они будут отклоняться при скролле).
      // 3.5 — максимальный угол наклона в градусах.
      var angle = Math.sin(y * 0.001) * 3.5; 

      kads.forEach(function (el) {
        var dir = el.getAttribute("data-dir") === "-1" ? -1 : 1;
        el.style.transform = "rotate(" + (angle * dir).toFixed(2) + "deg)";
      });
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  /* ---------- лайтбокс ---------- */

  var lb, lbImg, lbCap, lbClose, lbReturnFocus = null, lbTimer = 0;

  function openLightbox(src, caption, alt) {
    if (!lb) return;
    clearTimeout(lbTimer);
    lbReturnFocus = doc.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || caption || "";
    lbCap.textContent = caption || "";
    lb.hidden = false;
    doc.body.classList.add("is-locked");
    root.classList.add("is-locked");
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbClose.focus();
  }

  function closeLightbox() {
    if (!lb || lb.hidden) return;
    lb.classList.remove("is-open");
    doc.body.classList.remove("is-locked");
    root.classList.remove("is-locked");
    lbTimer = setTimeout(function () {
      lb.hidden = true;
      lbImg.removeAttribute("src");
      lbImg.alt = "";
      lbCap.textContent = "";
    }, 240);
    if (lbReturnFocus && lbReturnFocus.focus) lbReturnFocus.focus();
  }

  function initLightbox() {
    lb = doc.getElementById("lightbox");
    if (!lb) return;

    lbImg = $(".lightbox__img", lb);
    lbCap = $(".lightbox__caption", lb);
    lbClose = $(".lightbox__close", lb);

    doc.addEventListener("click", function (e) {
      if (!(e.target instanceof Element)) return;
      var card = e.target.closest(".card[data-caption]");
      if (!card) return;
      var img = card.querySelector("img");
      if (!img) return;
      openLightbox(img.currentSrc || img.src, card.dataset.caption, img.alt);
    });

    lbClose.addEventListener("click", closeLightbox);

    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lb.hidden) closeLightbox();
    });
  }

  /* ---------- язык ---------- */

  function setLang(next) {
    lang = next === "en" ? "en" : "ru";
    try {
      localStorage.setItem("dsn-lang", lang);
    } catch (e) { /* ignore */ }

    applyStatic();
    renderWorks();
    renderCases();
    applyLinks();
    fitRails();
  }

  /* ---------- врата: дым на canvas, расходится при скролле ---------- */

  function initGates() {
    var gates = $$("[data-gate]");
    if (!gates.length) return;

    /* мягкий спрайт дыма: рисуем один раз, дальше только drawImage */
    var sprite = document.createElement("canvas");
    sprite.width = sprite.height = 128;
    var sctx = sprite.getContext("2d");
    var g = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(212,202,186,0.7)");
    g.addColorStop(0.35, "rgba(196,186,170,0.4)");
    g.addColorStop(0.7, "rgba(174,164,150,0.14)");
    g.addColorStop(1, "rgba(170,160,146,0)");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 128, 128);

    var items = gates.map(function (gate) {
      var canvas = document.createElement("canvas");
      canvas.className = "gate__canvas";
      canvas.setAttribute("aria-hidden", "true");
      gate.appendChild(canvas);
      return {
        gate: gate,
        canvas: canvas,
        ctx: canvas.getContext("2d"),
        puffs: [],
        p: 0,
        w: 0,
        h: 0
      };
    });

    function makePuff(s) {
      var r = 16 + Math.random() * 34;
      return {
        x: Math.random() * (s.w + 80) - 40,
        y: Math.random() * (s.h + 120) - 40,
        baseR: r,
        r: r,
        vx: (Math.random() - 0.5) * 6,
        vy: -(8 + Math.random() * 12),
        baseA: 0.1 + Math.random() * 0.18,
        ttl: 8 + Math.random() * 8,
        life: Math.random() * 16,
        phase: Math.random() * Math.PI * 2
      };
    }

    function seed(s) {
      var n = Math.round(s.w / 18);
      if (n > 110) n = 110;
      if (n < 45) n = 45;
      s.puffs = [];
      for (var i = 0; i < n; i++) s.puffs.push(makePuff(s));
    }

    function resize(s) {
      s.w = s.gate.clientWidth || window.innerWidth;
      s.h = s.gate.clientHeight || 230;
      s.canvas.width = s.w;
      s.canvas.height = s.h;
      seed(s);
    }

    function draw(s, dt) {
      var ctx = s.ctx;
      var w = s.w, h = s.h;
      ctx.clearRect(0, 0, w, h);

      var p = reduceMotion ? 1 : s.p;
      var gapHalf = p * w * 0.34;

      for (var i = 0; i < s.puffs.length; i++) {
        var pu = s.puffs[i];
        pu.life += dt;
        if (pu.life >= pu.ttl || pu.y < -pu.r - 30) {
          pu.life = 0;
          pu.x = Math.random() * (w + 80) - 40;
          pu.y = h + pu.r + Math.random() * 40;
          pu.baseR = 16 + Math.random() * 34;
          pu.vx = (Math.random() - 0.5) * 6;
          pu.vy = -(8 + Math.random() * 12);
          pu.ttl = 8 + Math.random() * 8;
          pu.phase = Math.random() * Math.PI * 2;
        }
        var t = Math.sin(pu.life * 0.5 + pu.phase);
        pu.x += (pu.vx + t * 4) * dt;
        pu.y += pu.vy * dt;
        pu.r = pu.baseR * (1 + 0.5 * (pu.life / pu.ttl));

        var k = Math.min(1, pu.life / pu.ttl);
        var a = pu.baseA * Math.sin(k * Math.PI);
        if (a <= 0.003) continue;

        /* центр уже в просвете — не рисуем */
        if (gapHalf > 1 && Math.abs(pu.x - contentCx) < gapHalf) continue;

        ctx.globalAlpha = a;
        var d = pu.r * 2;
        ctx.drawImage(sprite, pu.x - pu.r, pu.y - pu.r, d, d);
      }
      ctx.globalAlpha = 1;

      /* стираем просвет по центру с мягкими краями */
      if (gapHalf > 1) {
        var feather = Math.max(30, w * 0.07);
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        var gl = ctx.createLinearGradient(contentCx - gapHalf - feather, 0, contentCx - gapHalf, 0);
        gl.addColorStop(0, "rgba(0,0,0,0)");
        gl.addColorStop(1, "rgba(0,0,0,1)");
        ctx.fillStyle = gl;
        ctx.fillRect(contentCx - gapHalf - feather, 0, feather, h);
        var gr = ctx.createLinearGradient(contentCx + gapHalf, 0, contentCx + gapHalf + feather, 0);
        gr.addColorStop(0, "rgba(0,0,0,1)");
        gr.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gr;
        ctx.fillRect(contentCx + gapHalf, 0, feather, h);
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(contentCx - gapHalf, 0, gapHalf * 2, h);
        ctx.restore();
      }
    }

    function computeP() {
      var vh = window.innerHeight;
      items.forEach(function (s) {
        var gate = s.gate;
        var next = gate.nextElementSibling;
        var head = next && next.querySelector ? next.querySelector("h2") : null;
        var ref = head
          ? head.getBoundingClientRect().top
          : gate.getBoundingClientRect().top + 330;
        var p = (vh * 0.98 - ref) / (vh * 0.43);
        p = Math.max(0, Math.min(1, p));
        s.p = p;
        gate.style.setProperty("--p", p.toFixed(3));
      });
    }

    var ticking = false;
    var last = 0;

    function loop(now) {
      requestAnimationFrame(loop);
      if (doc.hidden) { last = now; return; }
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      for (var i = 0; i < items.length; i++) {
        var rect = items[i].gate.getBoundingClientRect();
        if (rect.bottom < -60 || rect.top > window.innerHeight + 60) continue;
        draw(items[i], dt);
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { ticking = false; computeP(); });
      }
    }

    window.addEventListener("resize", function () {
      items.forEach(resize);
      if (reduceMotion) items.forEach(function (s) { draw(s, 0); });
      else computeP();
    });

    items.forEach(resize);
    computeP();

    if (reduceMotion) {
      items.forEach(function (s) {
        s.p = 1;
        s.gate.style.setProperty("--p", "1");
        draw(s, 0);
      });
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
      requestAnimationFrame(loop);
    }
  }

  /* ---------- пыль, падающая с лент ---------- */

  function initAsh() {
    if (reduceMotion) return;

    var canvas = doc.getElementById("ash");
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = 1;
    var parts = [];
    var MAX = 90;
    var last = 0;
    var spawnTimer = 0;
    var ribbons = $$(".ribbon");

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      var visible = [];
      for (var i = 0; i < ribbons.length; i++) {
        var b = ribbons[i].getBoundingClientRect();
        if (b.width > 40 && b.bottom > 0 && b.top < H) visible.push(b);
      }
      if (!visible.length) return;

      var b = visible[(Math.random() * visible.length) | 0];
      parts.push({
        x: b.left + b.width * (0.05 + Math.random() * 0.9),
        y: b.bottom - 6 - Math.random() * 14,
        vx: (Math.random() - 0.5) * 9,
        vy: 16 + Math.random() * 34,
        r: 0.6 + Math.random() * 1.5,
        a: 0.1 + Math.random() * 0.28,
        life: 0,
        ttl: 5 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2
      });
    }

    function frame(now) {
      requestAnimationFrame(frame);
      if (doc.hidden) { last = now; return; }

      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;

      ctx.clearRect(0, 0, W, H);

      spawnTimer += dt;
      if (spawnTimer > 0.12) {
        spawnTimer = 0;
        if (parts.length < MAX) spawn();
      }

      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.life += dt;
        p.x += (p.vx + Math.sin(p.life * 1.2 + p.phase) * 7) * dt;
        p.y += p.vy * dt;

        var k = p.life / p.ttl;
        if (k >= 1 || p.y > H + 20) {
          parts.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.a * Math.sin(Math.min(1, k) * Math.PI);
        ctx.fillStyle = "#cbbfa8";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
  }

  /* ---------- запуск ---------- */

  function init() {
    applyStatic();
    applyLinks();
    fitRails();

    renderWorks();
    renderCases();

    initSway();
    initLightbox();
    initGates();
    initAsh();

    if (reduceMotion) {
      var video = $(".hero__video");
      if (video) {
        video.pause();
        video.removeAttribute("autoplay");
      }
    }

    var btn = $("#langBtn");
    if (btn) {
      btn.addEventListener("click", function () {
        setLang(lang === "ru" ? "en" : "ru");
      });
    }

    var resizeTimer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        fitRails();
        renderWorks();
      }, 130);
    });

    window.addEventListener("load", function () {
      fitRails();
      renderWorks();
    });
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
