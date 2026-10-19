/* =========================================================
   components.js — builds the top bar, header, nav and footer
   on every page, so you only edit the menu in ONE place.

   Each page sets:
     <body data-root="./" data-page="home">      (index.html)
     <body data-root="../" data-page="about">    (pages/*.html)
   ========================================================= */
(function () {
  const body = document.body;
  const root = body.dataset.root || "./";
  const current = body.dataset.page || "";
  const S = window.SITE || {};

  // Menu: edit here to add or remove pages (plain links, no dropdowns)
  const MENU = [
    { label: "Home", href: "index.html", page: "home" },
    { label: "About", href: "pages/about.html", page: "about" },
    { label: "Academics", href: "pages/academics.html", page: "academics" },
    { label: "Student life", href: "pages/sport.html", page: "life" },
    { label: "Admissions", href: "pages/admissions.html", page: "admissions" },
    { label: "News", href: "pages/news.html", page: "news" },
    { label: "Contact", href: "pages/contact.html", page: "contact" }
  ];

  const url = (href) => root + href;

  const icons = {
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.3z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10 15V9l5.2 3L10 15z"/></svg>'
  };

  const socialLinks = ["facebook", "whatsapp", "youtube"]
    .filter((k) => S[k])
    .map((k) => `<a href="${S[k]}" target="_blank" rel="noopener" aria-label="${k}">${icons[k]}</a>`)
    .join("");

  function navHTML() {
    return MENU.map((item) => {
      const isCurrent = item.page === current ? " is-current" : "";
      return `<li class="nav__item${isCurrent}"><a class="nav__link" href="${url(item.href)}"${isCurrent ? ' aria-current="page"' : ""}>${item.label}</a></li>`;
    }).join("");
  }

  const header = `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" id="site-header">
    <div class="container">
      <a class="header-brand" href="${url("index.html")}">
        <img src="${url("assets/images/mucheke-crest-navy-hd.png")}" alt="Mucheke High School crest" width="52" height="77">
        <span class="header-brand__name" aria-label="Mucheke High"><span aria-hidden="true">Mucheke</span><span aria-hidden="true">High</span></span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Open menu"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></button>
      <nav class="nav" id="main-nav" aria-label="Main">
        <ul class="nav__list">${navHTML()}</ul>
      </nav>
    </div>
  </header>`;

  const year = new Date().getFullYear();
  const footer = `
  <footer class="site-footer">
    <div class="container footer__idrow">
      <div class="footer__id">
        <img src="${url("assets/images/mucheke-crest-navy-hd.png")}" alt="Mucheke High School crest" width="48" height="71">
        <span>${S.name}</span>
      </div>
    </div>
    <div class="container footer__grid">
      <div class="footer__about">
        <h4>Our vision</h4>
        <p class="footer__vision">${S.vision || ""}</p>
        <div class="footer__social">${socialLinks}</div>
      </div>
      <div>
        <h4>Quick links</h4>
        <ul class="footer__links">
          <li><a href="${url("pages/about.html")}">About us</a></li>
          <li><a href="${url("pages/academics.html")}">Academics</a></li>
          <li><a href="${url("pages/admissions.html")}">Admissions</a></li>
          <li><a href="${url("pages/news.html")}">News</a></li>
          <li><a href="${url("pages/contact.html")}">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact us</h4>
        <p><a href="tel:${(S.phone || "").replace(/\s/g, "")}">${S.phone || ""}</a><br>
        <a href="mailto:${S.email}">${S.email}</a></p>
        <p><strong>Office hours</strong><br>${S.officeHours || ""}</p>
      </div>
      <div>
        <h4>Find us</h4>
        <p>${(S.address || []).join("<br>")}</p>
        <p><strong>GPS</strong><br>${S.gps || ""}</p>
      </div>
    </div>
    <div class="container footer__partners">
      <a class="footer__partner" href="https://www.zimsec.co.zw/" target="_blank" rel="noopener">
        <img src="${url("assets/images/zimsec-crest-cropped.png")}" alt="ZIMSEC crest" width="52" height="53" loading="lazy">
        <span><strong>ZIMSEC</strong>Zimbabwe School Examinations Council</span>
      </a>
      <a class="footer__partner" href="https://mopse.co.zw/" target="_blank" rel="noopener">
        <img class="footer__arms" src="${url("assets/images/zimbabwe-coat-of-arms.png")}" alt="Zimbabwe coat of arms" width="56" height="50" loading="lazy">
        <span><strong>Government school</strong>Ministry of Primary and Secondary Education</span>
      </a>
    </div>
    <div class="container footer__bottom">
      <span>© ${year} ${S.name}. All rights reserved.</span>
      <span>Forms 1 – 6 &middot; O Level and A Level &middot; ZIMSEC curriculum</span>
    </div>
  </footer>`;

  document.getElementById("header-slot").outerHTML = header;
  document.getElementById("footer-slot").outerHTML = footer;
})();
