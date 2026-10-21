/* =========================================================
   main.js — site interactions
   1. Sticky header shadow
   2. Mobile menu + dropdowns
   3. Home hero (video or photo slider)
   4. News lists (home + news page + single story)
   5. Gallery lightbox
   6. Contact / enquiry form check
   ========================================================= */
(function () {
  const root = document.body.dataset.root || "./";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Sticky header shadow ------------------------------ */
  const header = document.getElementById("site-header");
  if (header) {
    // Pages with data-header="full" (the About page) start with the header already full width.
    const fullFromStart = document.body.dataset.header === "full";
    const targetOf = () => (fullFromStart ? 1 : Math.min(1, Math.max(0, window.scrollY / 240)));
    let progress = targetOf();
    header.style.setProperty("--header-progress", progress.toFixed(4));
    header.classList.toggle("is-scrolled", progress > .05);
    let frame = null;
    let lastTime = 0;
    const animateHeader = (now) => {
      const target = targetOf();
      const elapsed = lastTime ? Math.min(now - lastTime, 64) : 16;
      lastTime = now;
      progress = reduceMotion ? target : progress + (target - progress) * (1 - Math.exp(-elapsed / 180));
      if (Math.abs(target - progress) < .001) progress = target;
      header.style.setProperty("--header-progress", progress.toFixed(4));
      header.classList.toggle("is-scrolled", progress > .05);
      frame = progress !== target ? requestAnimationFrame(animateHeader) : null;
      if (!frame) lastTime = 0;
    };
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(animateHeader);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* 2. Mobile menu + dropdowns --------------------------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    };
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) nav.querySelector('a')?.focus();
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a') && !event.target.closest('.has-sub')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (!nav.classList.contains('is-open')) return;
      if (event.key === 'Escape') { closeMenu(); toggle.focus(); }
      if (event.key === 'Tab') {
        const controls = [...header.querySelectorAll('a, button')];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    matchMedia('(max-width: 1020px)').addEventListener('change', event => {
      if (!event.matches) closeMenu();
    });
  }
  document.querySelectorAll(".nav__item.has-sub > .nav__link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const open = !item.classList.contains("is-open");
      document.querySelectorAll(".nav__item.is-open").forEach((el) => {
        el.classList.remove("is-open");
        el.querySelector(".nav__link").setAttribute("aria-expanded", "false");
      });
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".nav__item.is-open").forEach((el) => el.classList.remove("is-open"));
    closeLightbox();
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav")) {
      document.querySelectorAll(".nav__item.is-open").forEach((el) => el.classList.remove("is-open"));
    }
  });

  /* 3. Hero: use video if assets/video/hero.mp4 exists, else slider */
  const hero = document.querySelector(".hero");
  if (hero) {
    const slides = [...hero.querySelectorAll(".hero__slide")];
    const dotsWrap = hero.querySelector(".hero__dots");
    let index = 0;
    let timer = null;

    const show = (i) => {
      slides[index].classList.remove("is-active");
      dotsWrap.children[index].classList.remove("is-active");
      index = (i + slides.length) % slides.length;
      slides[index].classList.add("is-active");
      dotsWrap.children[index].classList.add("is-active");
    };
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Show photo ${i + 1}`);
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", () => { show(i); restart(); });
      dotsWrap.appendChild(b);
    });
    const restart = () => {
      clearInterval(timer);
      if (!reduceMotion && slides.length > 1) timer = setInterval(() => show(index + 1), 6000);
    };
    restart();

    /* Motion reel: scenes of big type and sliding photo cards (replaces slider/video) */
    let reel = false;
    if (!reduceMotion) {
      reel = true;
      clearInterval(timer);
      slides.forEach((sl) => sl.remove());
      dotsWrap.remove();
      hero.classList.add("hero--reel");

      const img = (n) => `${root}assets/images/generated/${n}.webp`;
      const letters = (t) => [...t].map((c, i) => `<i style="--i:${i}">${c}</i>`).join("");
      // Letters reveal outward from the centre of the string.
      const typed = (t) => {
        const mid = (t.length - 1) / 2;
        return [...t].map((c, i) => `<i style="--o:${Math.abs(i - mid).toFixed(1)}">${c === " " ? "&nbsp;" : c}</i>`).join("");
      };
      // Yellow scene: a short lead-in plus one big key word, sliding up through a mask one after another.
      const phrases = [["We focus on", "Results"], ["We build", "Character"], ["We serve our", "Community"]];
      const stage = document.createElement("div");
      stage.className = "reel";
      stage.setAttribute("aria-hidden", "true");
      stage.innerHTML = `
        <div class="scene scene--intro">
          <svg class="zsvg" aria-hidden="true"><clipPath id="zclip" clipPathUnits="userSpaceOnUse"><text id="zt">HIGH SCHOOL</text></clipPath></svg>
          <svg class="zmeas" aria-hidden="true"><text id="zm">HIGH SCHOOL</text></svg>
          <div class="welcome welcome--dark"><span class="w-l">${[..."WEL"].map((c, i) => `<i class="welcome__letter" style="--letter:${i}">${c}</i>`).join("")}</span><span class="w-r">${[..."COME"].map((c, i) => `<i class="welcome__letter" style="--letter:${i + 3}">${c}</i>`).join("")}</span></div>
          <div class="intro__navy">
            <div class="intro__chemistry"></div>
            <div class="welcome welcome--light"><span class="w-l">WEL</span><span class="w-r">COME</span></div>
            <div class="intro__lead intro__lead--to">TO</div>
            <div class="intro__lead intro__lead--school"><span class="lead-a">MUCHEKE</span>&nbsp;<span class="lead-b">HIGH</span></div>
            <canvas class="intro__dust"></canvas>
            <div class="dgA">
              <div class="slat slat--a"><div class="cam"><video muted loop playsinline preload="auto" src="${root}${hero.dataset.video}"></video></div></div>
              <div class="edge--a"></div>
            </div>
            <div class="sub sub--a"><span></span></div>
            <div class="beatB">
              <div class="slat slat--b"><div class="cam"><video muted loop playsinline preload="auto" src="${root}assets/video/students-collaborating.mp4"></video></div></div>
              <div class="edge--b"></div>
              <div class="intro__lead intro__lead--c"><span class="lead-c">HIGH SCHOOL</span></div>
              <div class="sub sub--b"><span>O Level &bull; A Level</span></div>
            </div>
            <div class="beatC"><div class="cwin"></div></div>
          </div>
        </div>
        <div class="scene scene--words">
          <div class="phrases">
            ${phrases.map(([lead, key], i) => `<div class="phrase${i === phrases.length - 1 ? " is-last" : ""}" style="--d:${i * 1.6}s"><span class="lead-in">${lead}</span><span class="key">${letters(key)}</span></div>`).join("")}
          </div>
        </div>
        <div class="scene scene--cards scene--study">
          <div class="study-photo"><img src="${root}assets/images/focused-study-warm-classroom.webp" alt="Girl writing in her exercise book in the classroom"></div>
          <div class="study-message">
            <div class="study-current"><b class="study-bounce-dot"></b><div class="study-current__word">${letters("LEARN ALWAYS").replaceAll('> </i>', '>&nbsp;</i>')}</div></div>
          </div>
        </div>
        `;
      hero.insertBefore(stage, hero.querySelector(".hero__content"));
      const studyScene = stage.querySelector('.scene--study');
      const studyWord = studyScene.querySelector('.study-current__word');
      const studyDot = studyScene.querySelector('.study-bounce-dot');
      const studyPhrases = ['LEARN ALWAYS', 'THINK DEEPLY', 'GROW TOGETHER'];
      let studyElapsed = 0, studyPrevious = performance.now(), studyImpact = -1;
      const bounceStudy = now => {
        const delta = now - studyPrevious;
        studyPrevious = now;
        if (studyScene.classList.contains('is-on') && !stage.classList.contains('is-paused')) {
          studyElapsed += delta;
          const beat = Math.floor((studyElapsed - 448) / 1600);
          if (beat >= 0 && beat !== studyImpact) {
            studyImpact = beat;
            studyWord.innerHTML = letters(studyPhrases[(beat + 1) % studyPhrases.length]).replaceAll('> </i>', '>&nbsp;</i>');
          }
          const first = studyWord.querySelector('i');
          if (first) studyDot.style.left = `${first.offsetWidth / 2}px`;
        } else if (!studyScene.classList.contains('is-on')) {
          studyElapsed = 0; studyImpact = -1;
        }
        requestAnimationFrame(bounceStudy);
      };
      requestAnimationFrame(bounceStudy);


      const scenes = [...stage.querySelectorAll(".scene")];
      const locationCaption = scenes[0].querySelector(".sub--a span");
      locationCaption.addEventListener("animationstart", (event) => {
        if (event.animationName === "subANormal") {
          locationCaption.innerHTML = `
            <b class="government-seal">
              <svg class="government-seal__orbit" viewBox="0 0 160 160"><circle cx="80" cy="80" r="74" pathLength="1"/></svg>
              <img class="government-crest" src="${root}assets/images/zimbabwe-coat-of-arms.png" alt="">
            </b>
            <b class="government-title">${[..."GOVERNMENT HIGH SCHOOL"].map((letter, index) => `<i style="--letter:${index}">${letter === " " ? "&nbsp;" : letter}</i>`).join("")}</b>
            <b class="government-rule"></b>`;
          locationCaption.classList.add("has-government-crest");
        }
      });
      // Horizontal offset of the WEL|COME split point from the centre, so the square grows from the split.
      const setSplit = () => {
        const l = stage.querySelector(".w-l"), r = stage.querySelector(".w-r");
        if (l && r) scenes[0].style.setProperty("--x0", `${(l.offsetWidth - r.offsetWidth) / 2}px`);
      };
      setSplit();
      setTimeout(setSplit, 800);
      addEventListener("resize", setSplit);
      const lengths = [16000, 5200, 5000];
      let cur = -1, paused = false;
      const next = () => {
        if (paused) return setTimeout(next, 400);
        if (cur === scenes.length - 1) return restartCycle();
        const prev = scenes[cur];
        cur += 1;
        scenes[cur].classList.remove("is-leaving");
        scenes[cur].classList.add("is-on", "is-top");
        if (prev) {
          prev.classList.remove("is-top");
          prev.classList.add("is-leaving");
          setTimeout(() => prev.classList.remove("is-on", "is-leaving"), 900);
        }
        setTimeout(next, lengths[cur]);
      };
      // Works out where each title lands. Desktop: along the diagonal edges (A leans /, B leans \).
      // Phones: flat at the top. Everything is positioned by translate/rotate/scale from the scene centre.
      let zoomGeo = null;
      const setDiag = () => {
        const sc = scenes[0], a = sc.querySelector(".lead-a"), c = sc.querySelector(".lead-c");
        const box = sc.getBoundingClientRect(), r = a.getBoundingClientRect();
        const clearance = parseFloat(getComputedStyle(a.parentElement).paddingTop);
        const w = box.width, H = box.height, yc = (H + clearance - 88) / 2;
        const cur = parseFloat(getComputedStyle(a).fontSize);
        const nat = { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
        const ang = 0;
        const s = Math.min((w * .78) / r.width, (H * .095) / cur);
        const fs = cur * s, y = clearance + fs * .45;
        const A = { x: w / 2, y, s, sx: w / 2, sy: y + fs * .62 };
        const compact = w <= 700;
        const B = { x: compact ? w / 2 : w * .24,
          y: compact ? y : clearance + (H - clearance) * .32,
          s: Math.min((w * (compact ? .78 : .36)) / c.offsetWidth, (H * .085) / parseFloat(getComputedStyle(c).fontSize)) };
        B.sx = B.x; B.sy = B.y + parseFloat(getComputedStyle(c).fontSize) * B.s * .8;
        const videoTop = clearance + fs + 20;
        sc.style.setProperty("--video-top", `${videoTop}px`);
        sc.style.setProperty("--video-height", `${Math.max(0, (H - videoTop) / H * 100)}%`);
        // Straightened ("normal") state: centred, name over caption.
        const sn = Math.min(2.6, (w * 0.6) / r.width), fsn = cur * sn;
        const N = { x: w / 2, y: yc - fsn * 0.2, s: sn, sx: w / 2, sy: yc + fsn * 0.5 };
        // Straightened state of HIGH SCHOOL too (it is what the letter zoom starts from).
        const baseC = parseFloat(getComputedStyle(c).fontSize);
        const scC = Math.min(2.8, (w * 0.6) / c.offsetWidth), fsC = baseC * scC;
        const cyC = yc - fsC * 0.2;
        zoomGeo = { w, H, cy: cyC, scale: scC };
        const set = (k, v) => sc.style.setProperty(k, v);
        set("--cnx", "0px"); set("--cny", `${cyC - yc}px`); set("--cns", scC.toFixed(3));
        set("--sbnx", "0px"); set("--sbny", `${yc + fsC * 0.5 - yc}px`);
        set("--rot", `${-ang}rad`); set("--rotb", `${-ang}rad`);
        set("--ax", `${A.x - nat.x}px`); set("--ay", `${A.y - nat.y}px`); set("--as", A.s.toFixed(3));
        set("--nx", `${N.x - nat.x}px`); set("--ny", `${N.y - nat.y}px`); set("--ns", N.s.toFixed(3));
        set("--sax", `${A.sx - w / 2}px`); set("--say", `${A.sy - yc}px`);
        set("--snx", `${N.sx - w / 2}px`); set("--sny", `${N.sy - yc}px`);
        set("--government-top", `${N.y + fsn * .42 + 24}px`);
        set("--bx", `${B.x - w / 2}px`); set("--by", `${B.y - yc}px`); set("--bs", B.s.toFixed(3));
        set("--sbx", `${B.sx - w / 2}px`); set("--sby", `${B.sy - yc}px`);
      };
      setTimeout(setDiag, 3500);

      // Letter zoom: a gold fill is clipped to the letters of HIGH SCHOOL, then the letter shapes are
      // scaled up around the "I" until its stem fills the screen. The gold words scene takes over from there.
      const cwin = scenes[0].querySelector(".cwin");
      const zt = scenes[0].querySelector("#zt"), zm = scenes[0].querySelector("#zm");
      let zoom = null;
      const prepZoom = () => {
        if (!zoomGeo) setDiag();
        const c = scenes[0].querySelector(".lead-c"), cs = getComputedStyle(c);
        const fs = parseFloat(cs.fontSize) * zoomGeo.scale, ls = (parseFloat(cs.letterSpacing) || 0) * zoomGeo.scale;
        for (const el of [zt, zm]) {
          el.setAttribute("x", zoomGeo.w / 2);
          el.setAttribute("y", zoomGeo.cy);
          el.setAttribute("text-anchor", "middle");
          el.setAttribute("dominant-baseline", "central");
          el.style.cssText = `font:700 ${fs}px "Source Sans 3","Segoe UI",Arial,sans-serif;letter-spacing:${ls}px`;
        }
        let zx = zoomGeo.w / 2, zy = zoomGeo.cy;
        try { const e = zm.getExtentOfChar(1); zx = e.x + e.width / 2; zy = e.y + e.height / 2; } catch (_) {}
        zoom = { zx, zy, fs };
        cwin.style.clipPath = "url(#zclip)";
        cwin.style.webkitClipPath = "url(#zclip)";
      };
      const runZoom = () => {
        if (!zoom) return;
        const { zx, zy, fs } = zoom, { w, H } = zoomGeo, D = 1300, t0 = performance.now();
        // Browsers stop drawing clip shapes at extreme zoom, so the letter only grows to ~30x. At that size the
        // stem of the "I" is a tall bar; that bar then widens to the full screen, which is the same gold fill.
        const smax = 30;
        const step = (now) => {
          const p = Math.min(1, (now - t0) / D);
          const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
          const S = Math.exp(Math.log(smax) * e);
          // The zoomed letter drifts to the screen centre as it grows, so the middle is never an empty gap.
          const px = zx + (w / 2 - zx) * e, py = zy + (H / 2 - zy) * e;
          zt.setAttribute("transform", `translate(${px} ${py}) scale(${S}) translate(${-zx} ${-zy})`);
          if (p < 1) return requestAnimationFrame(step);
          const bar = Math.min(w, 0.14 * fs * smax), side = Math.max(0, (w - bar) / 2);
          cwin.style.clipPath = `inset(0 ${side}px)`;
          cwin.style.webkitClipPath = `inset(0 ${side}px)`;
          cwin.style.transition = "clip-path .4s cubic-bezier(.7,0,.3,1), -webkit-clip-path .4s cubic-bezier(.7,0,.3,1)";
          requestAnimationFrame(() => requestAnimationFrame(() => {
            cwin.style.clipPath = "inset(0px)";
            cwin.style.webkitClipPath = "inset(0px)";
          }));
        };
        requestAnimationFrame(step);
      };

      const diagVideo = scenes[0].querySelector(".slat--a video");
      const diagB = scenes[0].querySelector(".slat--b video");
      let diagOn = false, bOn = false;
      setTimeout(() => { diagOn = true; if (!paused) diagVideo.play().catch(() => {}); }, 4970);
      stage.dataset.startedAt = performance.now();
      next();
      // Sample the letter shapes so the dust comes from, and assembles into, the words.
      const dustCanvas = stage.querySelector(".intro__dust");
      const dustContext = dustCanvas.getContext("2d");
      const dustStarted = performance.now();
      let dustClock = dustStarted, dustElapsed = 0, dustPoints;
      const sampleDust = (selector, text, incoming) => {
        const node = stage.querySelector(selector), style = getComputedStyle(node);
        const w = hero.clientWidth, h = hero.clientHeight;
        const sample = document.createElement("canvas");
        sample.width = w; sample.height = h;
        const context = sample.getContext("2d");
        context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        context.textAlign = "center"; context.textBaseline = "middle";
        context.letterSpacing = style.letterSpacing;
        const x = w / 2 + (incoming ? 0 : parseFloat(getComputedStyle(scenes[0]).getPropertyValue("--x0")) || 0);
        const y = h / 2 + (parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)) / 2;
        context.fillText(text, x, y);
        const pixels = context.getImageData(0, 0, w, h).data, points = [];
        const stride = w < 700 ? 2 : 3;
        for (let py = 0; py < h; py += stride) for (let px = 0; px < w; px += stride) {
          if (pixels[(py * w + px) * 4 + 3] > 100) points.push({
            x: px, y: py, incoming, seed: Math.random(),
            dx: 35 + Math.random() * 180, dy: (Math.random() - .65) * 200,
          });
        }
        const left = Math.min(...points.map(point => point.x));
        const right = Math.max(...points.map(point => point.x));
        if (!incoming) {
          const offset = x - w / 2;
          node.style.setProperty("--dust-start", `${(left - offset) / w * 100}%`);
          node.style.setProperty("--dust-end", `${(right - offset + stride) / w * 100}%`);
        }
        for (const point of points) point.sweep = (point.x - left) / Math.max(1, right - left);
        return points;
      };
      const drawDust = (now) => {
        if (!paused) dustElapsed += now - dustClock;
        dustClock = now;
        const t = dustElapsed / 1000;
        if (t > 5.05 || !dustContext) { dustCanvas.remove(); return; }
        if (t >= 3.42) {
          if (!dustPoints) {
            dustCanvas.width = hero.clientWidth; dustCanvas.height = hero.clientHeight;
            dustPoints = [...sampleDust(".intro__lead--to", "TO", false), ...sampleDust(".intro__lead--school", "MUCHEKE HIGH", true)];
          }
          dustContext.clearRect(0, 0, dustCanvas.width, dustCanvas.height);
          for (const point of dustPoints) {
            const progress = (t - (point.incoming ? 3.7 : 3.42) - point.sweep * .55) / (point.incoming ? .55 : .7);
            if (progress < 0 || progress > 1) continue;
            const travel = point.incoming ? (1 - progress) ** 2 : progress;
            const alpha = point.incoming ? Math.sin(progress * Math.PI) : (1 - progress) ** .6;
            dustContext.globalAlpha = alpha * (.7 + .3 * Math.sin(t * 28 + point.seed * 30) ** 2);
            dustContext.fillStyle = "#ffffff";
            const flutter = Math.sin(progress * 12 + point.seed * 20) * travel * 12;
            const px = point.x + point.dx * travel, py = point.y + point.dy * travel + flutter;
            const size = .8 + point.seed * 1.8;
            dustContext.fillRect(px, py, size, size);
            if (point.seed > .87) {
              dustContext.fillRect(px - 3, py + size / 2, 7, .7);
              dustContext.fillRect(px + size / 2, py - 3, .7, 7);
            }
          }
          dustContext.globalAlpha = 1;
        }
        requestAnimationFrame(drawDust);
      };
      requestAnimationFrame(drawDust);
      const restartCycle = () => {
        scenes.forEach(scene => scene.classList.remove('is-on', 'is-top', 'is-leaving'));
        locationCaption.textContent = '';
        locationCaption.classList.remove('has-government-crest');
        studyElapsed = 0; studyImpact = -1;
        studyWord.innerHTML = letters('LEARN ALWAYS').replaceAll('> </i>', '>&nbsp;</i>');
        diagOn = false; bOn = false;
        diagVideo.pause(); diagB.pause();
        diagVideo.currentTime = 0; diagB.currentTime = 0;
        void stage.offsetWidth;
        cur = -1;
        stage.dataset.startedAt = performance.now();
        dustElapsed = 0; dustClock = performance.now(); dustPoints = undefined;
        scenes[0].querySelector('.intro__navy').append(dustCanvas);
        requestAnimationFrame(drawDust);
        setSplit();
        setTimeout(setDiag, 3500);
        setTimeout(() => { diagOn = true; if (!paused) diagVideo.play().catch(() => {}); }, 4970);
        next();
        stage.dispatchEvent(new Event('school-restart'));
      };
      const pause = () => {
        paused = document.hidden || !visible || manualPause;
        stage.classList.toggle("is-paused", paused);
        if (paused) { diagVideo.pause(); diagB.pause(); }
        else {
          if (diagOn) diagVideo.play().catch(() => {});
          if (bOn) diagB.play().catch(() => {});
        }
      };
      let visible = true, manualPause = false;
      const motionToggle = document.createElement('button');
      motionToggle.type = 'button';
      motionToggle.className = 'hero-motion-toggle';
      motionToggle.textContent = 'Pause animation';
      motionToggle.setAttribute('aria-pressed', 'false');
      hero.append(motionToggle);
      motionToggle.addEventListener('click', () => {
        manualPause = !manualPause;
        motionToggle.textContent = manualPause ? 'Play animation' : 'Pause animation';
        motionToggle.setAttribute('aria-pressed', String(manualPause));
        pause();
      });
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; pause(); }).observe(hero);
      document.addEventListener("visibilitychange", pause);
    }

    const videoSrc = hero.dataset.video;
    if (videoSrc && !reduceMotion && !reel) {
      const v = document.createElement("video");
      v.className = "hero__video";
      Object.assign(v, { muted: true, loop: true, autoplay: true, playsInline: true });
      v.setAttribute("aria-hidden", "true");
      v.src = root + videoSrc;
      v.addEventListener("loadeddata", () => {
        hero.prepend(v);
        clearInterval(timer);
        slides.forEach((s) => s.remove());
        dotsWrap.remove();
      });
      v.load();
    }
  }

  /* 4. News ---------------------------------------------- */
  const NEWS = (window.NEWS || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const storyUrl = (n) => `${root}pages/news.html?story=${encodeURIComponent(n.id)}`;
  const card = (n) => `
    <article class="news-card">
      <img src="${root}${n.image}" alt="" loading="lazy">
      <div class="news-card__body">
        <p class="news-card__meta">${fmt(n.date)} | ${n.category}</p>
        <h3><a href="${storyUrl(n)}">${n.title}</a></h3>
        <p>${n.summary}</p>
        <a class="read-more" href="${storyUrl(n)}">Read more<span class="visually-hidden">: ${n.title}</span></a>
      </div>
    </article>`;

  const latest = document.getElementById("latest-news");
  if (latest) latest.innerHTML = NEWS.slice(0, 3).map(card).join("");

  const newsList = document.getElementById("news-list");
  const story = document.getElementById("news-story");
  if (newsList) {
    const params = new URLSearchParams(location.search);
    const id = params.get("story");
    const item = id && NEWS.find((n) => n.id === id);

    if (item && story) {
      story.hidden = false;
      story.innerHTML = `
        <p class="news-card__meta">${fmt(item.date)} | ${item.category}</p>
        <h2>${item.title}</h2>
        <img src="${root}${item.image}" alt="" style="margin:1.5rem 0;width:100%;max-height:460px;object-fit:cover">
        <p>${item.body}</p>
        <p><a href="${root}pages/news.html">Back to all news</a></p>`;
      document.getElementById("news-browse").hidden = true;
      document.title = `${item.title} | Mucheke High School`;
    } else {
      const filters = document.getElementById("news-filters");
      const cats = ["All", ...new Set(NEWS.map((n) => n.category))];
      const render = (cat) => {
        const list = cat === "All" ? NEWS : NEWS.filter((n) => n.category === cat);
        newsList.innerHTML = list.length ? list.map(card).join("") : '<p class="news-empty">No stories in this category yet.</p>';
      };
      filters.innerHTML = cats.map((c, i) => `<button type="button" aria-pressed="${i === 0}">${c}</button>`).join("");
      filters.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        filters.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
        render(b.textContent);
      });
      render("All");
    }
  }

  /* 5. Gallery lightbox ---------------------------------- */
  let lightbox = null;
  function closeLightbox() { if (lightbox) lightbox.classList.remove("is-open"); }
  document.querySelectorAll(".gallery").forEach((gallery) => {
    if (!lightbox) {
      lightbox = document.createElement("div");
      lightbox.className = "lightbox";
      lightbox.setAttribute("role", "dialog");
      lightbox.setAttribute("aria-modal", "true");
      lightbox.innerHTML = '<button class="lightbox__close" type="button">Close</button><figure><img alt=""><figcaption class="lightbox__caption"></figcaption></figure>';
      document.body.appendChild(lightbox);
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("lightbox__close")) closeLightbox();
      });
    }
    gallery.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const img = b.querySelector("img");
      lightbox.querySelector("img").src = img.src;
      lightbox.querySelector("img").alt = img.alt;
      lightbox.querySelector("figcaption").textContent = img.alt;
      lightbox.classList.add("is-open");
      lightbox.querySelector(".lightbox__close").focus();
    });
  });

  /* 6. Forms --------------------------------------------- */
  document.querySelectorAll("form[data-check]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll("[required]").forEach((field) => {
        const valid = field.type === "email" ? /^\S+@\S+\.\S+$/.test(field.value) : field.value.trim() !== "";
        field.classList.toggle("is-invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        form.querySelector(".is-invalid").focus();
        return;
      }
      // No server yet: open the visitor's email app with the message filled in.
      const S = window.SITE || {};
      const data = new FormData(form);
      const lines = [...data.entries()].map(([k, v]) => `${k}: ${v}`).join("\n");
      const subject = encodeURIComponent(form.dataset.subject || "Website enquiry");
      window.location.href = `mailto:${S.email}?subject=${subject}&body=${encodeURIComponent(lines)}`;
      const status = form.querySelector(".form-status");
      if (status) {
        status.textContent = "Your email app is opening with your message. Press send to finish.";
        status.classList.add("is-visible");
      }
    });
  });
  /* 6b. Why Mucheke High: quote slider ------------------- */
  document.querySelectorAll("[data-why]").forEach((stage) => {
    const quotes = window.TESTIMONIALS || [];
    const slides = stage.querySelector(".why__slides");
    if (!quotes.length) { stage.closest(".why").hidden = true; return; }
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    slides.innerHTML = quotes.map((q, i) => `
      <figure class="why__slide${i === 0 ? " is-active" : ""}">
        <h3>${esc(q.role)}</h3>
        <blockquote>&ldquo;${esc(q.quote)}&rdquo;</blockquote>
        <figcaption><strong>${esc(q.name)}</strong><em>${esc(q.note || "")}</em></figcaption>
      </figure>`).join("");
    const items = [...slides.children];
    let at = 0, timer = null;
    const dissolveQuote = quote => {
      slides.querySelector('.why__dust')?.remove();
      const canvas = document.createElement('canvas'); canvas.className = 'why__dust';
      canvas.width = slides.clientWidth; canvas.height = slides.clientHeight;
      const context = canvas.getContext('2d');
      if (!context) return;
      const bounds = slides.getBoundingClientRect();
      const walker = document.createTreeWalker(quote, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let node;
      context.textBaseline = 'top';
      while ((node = walker.nextNode())) {
        const style = getComputedStyle(node.parentElement);
        context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        context.fillStyle = style.color;
        for (let i = 0; i < node.length; i++) {
          if (!node.textContent[i].trim()) continue;
          range.setStart(node, i); range.setEnd(node, i + 1);
          const rect = range.getBoundingClientRect();
          context.fillText(node.textContent[i], rect.left - bounds.left, rect.top - bounds.top);
        }
      }
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const particles = [];
      for (let y = 0; y < canvas.height; y += 2) for (let x = 0; x < canvas.width; x += 2) {
        const offset = (y * canvas.width + x) * 4;
        if (pixels[offset + 3] > 70) particles.push({x,y,
          color: `rgb(${pixels[offset]},${pixels[offset + 1]},${pixels[offset + 2]})`,
          dx: (Math.random() - .5) * 90, dy: (Math.random() - .6) * 100,
          size: .7 + Math.random() * 1.2});
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      slides.append(canvas);
      const started = performance.now();
      const draw = now => {
        if (!canvas.isConnected) return;
        const progress = Math.min(1, (now - started) / 850);
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (const particle of particles) {
          const scatter = Math.min(1, progress * 1.4);
          context.globalAlpha = Math.sin(Math.min(1, progress * 2) * Math.PI / 2) * (1 - progress);
          context.fillStyle = particle.color;
          context.fillRect(particle.x - canvas.width * progress * .95 + particle.dx * scatter,
            particle.y + particle.dy * scatter + Math.sin(progress * 10 + particle.x) * scatter * 8,
            particle.size, particle.size);
        }
        if (progress < 1) requestAnimationFrame(draw);
        else canvas.remove();
      };
      requestAnimationFrame(draw);
    };
    const go = (n) => {
      const previous = items[at];
      const direction = n < at ? -1 : 1;
      items.forEach(item => item.getAnimations().forEach(animation => animation.cancel()));
      if (!reduceMotion && direction > 0) dissolveQuote(previous);
      previous.classList.remove("is-active");
      at = (n + items.length) % items.length;
      items[at].classList.add("is-active");
      items.forEach((item, index) => item.setAttribute('aria-hidden', index !== at));
      if (!reduceMotion && previous !== items[at]) {
        const timing = {duration: 650, easing: 'cubic-bezier(.22,1,.36,1)'};
        previous.animate([
          {transform: 'translateX(0)', opacity: 1, visibility: 'visible'},
          {transform: `translateX(${-direction * 110}%)`, opacity: 0, visibility: 'visible'}
        ], timing);
        items[at].animate([
          {transform: `translateX(${direction * 110}%)`},
          {transform: 'translateX(0)'}
        ], timing);
      }
    };
    const restart = () => {
      clearInterval(timer);
      if (!reduceMotion && items.length > 1) timer = setInterval(() => go(at + 1), 5000);
    };
    stage.querySelector(".why__arrow--prev").addEventListener("click", () => { go(at - 1); restart(); });
    stage.querySelector(".why__arrow--next").addEventListener("click", () => { go(at + 1); restart(); });
    if (items.length < 2) stage.querySelectorAll(".why__arrow").forEach((b) => (b.hidden = true));
    stage.addEventListener("mouseenter", () => clearInterval(timer));
    stage.addEventListener("mouseleave", restart);
    restart();
  });

  /* 7. Scroll choreography: progressive enhancement, no hidden content. */
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!motionPreference.matches && "IntersectionObserver" in window && "animate" in Element.prototype) {
    const animations = new Set();
    const revealed = new WeakSet();
    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        const variant = target.dataset.reveal;
        const from = variant === "image"
          ? { opacity: 0, clipPath: "inset(0 0 18% 0)", transform: "translateY(36px) scale(.97)" }
          : variant === "card"
            ? { opacity: 0, transform: "perspective(1000px) translateY(48px) rotateX(5deg)" }
            : { opacity: 0, transform: "translateY(28px)" };
        const animation = target.animate([from, {
          opacity: 1, clipPath: "inset(0 0 0 0)", transform: "none"
        }], {
          duration: variant === "image" ? 1100 : 850,
          delay: Number(target.dataset.revealDelay || 0),
          easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards"
        });
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation)).catch(() => {});
      });
    }, { threshold: .08, rootMargin: "0px 0px -24px 0px" });

    const prepare = () => {
      document.querySelectorAll(
        ".split > *, .section-head, .stage, .fact, .quote blockquote, .quote cite, .news-card, .gallery button, .partners a"
      ).forEach((el) => {
        if (revealed.has(el) || el.closest("[hidden]")) return;
        revealed.add(el);
        const image = el.classList.contains("split__img") || el.matches(".gallery button");
        const card = el.matches(".stage, .news-card, .fact");
        el.dataset.reveal = image ? "image" : card ? "card" : "text";
        const siblings = [...el.parentElement.children];
        el.dataset.revealDelay = Math.min(siblings.indexOf(el), 3) * 110;
        observer.observe(el);
      });
    };
    prepare();
    // News category changes receive the same staggered entrance.
    const newsChanges = new MutationObserver(prepare);
    [latest, newsList].filter(Boolean).forEach((el) => newsChanges.observe(el, { childList: true }));

    const images = [...document.querySelectorAll(".stage img")];
    images.forEach((img) => img.classList.add("scroll-image"));
    let frame = 0;
    let active = true;
    const paint = () => {
      frame = 0;
      const height = window.innerHeight;
      const range = document.documentElement.scrollHeight - height;
      progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0})`;
      // Read all positions before writing transforms.
      const positions = images.map((img) => img.parentElement.getBoundingClientRect());
      images.forEach((img, i) => {
        const box = positions[i];
        if (box.bottom < 0 || box.top > height) return;
        const travel = Math.max(-1, Math.min(1, (height / 2 - box.top - box.height / 2) / height));
        img.style.setProperty("--scroll-shift", `${(travel * 18).toFixed(2)}px`);
      });
    };
    const schedule = () => { if (active && !frame) frame = requestAnimationFrame(paint); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();

    motionPreference.addEventListener("change", (event) => {
      if (!event.matches) return;
      active = false;
      observer.disconnect();
      newsChanges.disconnect();
      animations.forEach((animation) => animation.cancel());
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      images.forEach((img) => {
        img.classList.remove("scroll-image");
        img.style.removeProperty("--scroll-shift");
      });
      progress.remove();
    });
  }
})();

/* Bus travels along the tour edge; totals rise after it passes. */
(function () {
  const section = document.querySelector('.bus-reveal'); // optional: the bus still drives without the totals block
  const stage = document.querySelector('.school-photo');
  const bus = stage?.querySelector('.bus-reveal__bus img');
  if (!stage || !bus) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const counters = section ? [...section.querySelectorAll('[data-count]')] : [];
  const frames = new Set();
  let started = false;
  const showStats = () => {
    if (started) return;
    started = true;
    if (section) section.classList.add('is-counting');
    counters.forEach((counter, index) => {
      const target = Number(counter.dataset.count);
      if (motion.matches) { counter.textContent = `${target}+`; return; }
      counter.textContent = '0+';
      const begins = performance.now() + index * 200 + 120;
      const count = (now) => {
        const progress = Math.min(1, Math.max(0, (now - begins) / 1900));
        const eased = 1 - Math.pow(1 - progress, 4);
        counter.textContent = `${Math.round(target * eased)}+`;
        if (progress < 1 && !motion.matches) {
          const id = requestAnimationFrame((time) => { frames.delete(id); count(time); });
          frames.add(id);
        } else counter.textContent = `${target}+`;
      };
      count(performance.now());
    });
  };
  stage.addEventListener('animationend', (event) => {
    if (event.target === stage && event.animationName === 'admissionsDrive') showStats();
  });
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    frames.forEach(cancelAnimationFrame);
    frames.clear();
    counters.forEach((counter) => { counter.textContent = `${counter.dataset.count}+`; });
    if (stage.classList.contains('is-driving')) showStats();
  });
  const observer = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    try { await bus.decode(); } catch (_) { /* Preserve text if the image fails. */ }
    stage.classList.add('is-driving');
    if (motion.matches) showStats();
  }, { threshold: .35 });
  observer.observe(stage);
})();

/* Move closer to the school photograph as the visitor scrolls through it. */
(function () {
  const photo = document.querySelector('.school-photo');
  if (!photo) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null, visible = false;
  const paint = () => {
    frame = null;
    if (motion.matches) { photo.style.removeProperty('--photo-scale'); return; }
    const bounds = photo.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
    const amount = window.matchMedia('(max-width: 700px)').matches ? .12 : .22;
    photo.style.setProperty('--photo-scale', (1 + progress * amount).toFixed(4));
  };
  const schedule = () => {
    if (visible && frame === null) frame = requestAnimationFrame(paint);
  };
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(photo);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  motion.addEventListener('change', paint);
})();
