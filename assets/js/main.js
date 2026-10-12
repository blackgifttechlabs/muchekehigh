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
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* 2. Mobile menu + dropdowns --------------------------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
      toggle.textContent = open ? "Close" : "Menu";
      document.body.style.overflow = open ? "hidden" : "";
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

    const videoSrc = hero.dataset.video;
    if (videoSrc && !reduceMotion) {
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
