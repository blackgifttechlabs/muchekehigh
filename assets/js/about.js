(function () {
  const root = document.querySelector('.about-slider');
  if (!root) return;
  const slides = [...root.querySelectorAll('[data-slide]')];
  const dots = [...root.querySelectorAll('[data-slide-to]')];
  const pause = root.querySelector('.about-pause');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer = null, paused = false, visible = true;
  const schedule = () => {
    clearTimeout(timer);
    if (!paused && visible && !document.hidden && !motion.matches && !root.matches(':hover') && !root.contains(document.activeElement)) timer = setTimeout(() => show(current + 1), 4000);
  };
  // Rolling wheels: the bus slides in over T ms with an easing curve; each wheel turns by (distance travelled / wheel radius)
  // using the SAME easing, so the rotation always matches the bus position and stops exactly when it stops.
  const runBus = () => {
    const art = root.querySelector('.about-slide__art--bus');
    if (!art || motion.matches || !art.animate) return;
    const img = art.querySelector('img');
    const W = img.offsetWidth;
    if (!W) return;
    const D = window.innerWidth * 0.8;           // distance driven, px
    const r = W * 0.0625 / 2;                    // wheel radius: the wheel is 6.25% of the bus width
    const timing = { duration: 2600, easing: 'cubic-bezier(.16,.75,.3,1)' };
    art.animate([{ transform: `translateX(${D}px)` }, { transform: 'translateX(0)' }], { ...timing, fill: 'backwards' });
    art.querySelectorAll('.bus-reveal__wheel').forEach((wheel) => wheel.animate(
      [{ transform: 'translate(-50%, -50%) rotate(0rad)' }, { transform: `translate(-50%, -50%) rotate(${-D / r}rad)` }], timing));
  };
  const show = (index, announce = false) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; slide.classList.toggle('is-active', i === current); });
    dots.forEach((dot, i) => { dot.classList.toggle('is-active', i === current); dot.setAttribute('aria-pressed', String(i === current)); });
    if (announce) root.querySelector('[data-slide-status]').textContent = `Slide ${current + 1} of ${slides.length}`;
    if (slides[current].classList.contains('about-slide--bus')) runBus();
    schedule();
  };
  root.querySelector('.about-arrow--prev').addEventListener('click', () => show(current - 1, true));
  root.querySelector('.about-arrow--next').addEventListener('click', () => show(current + 1, true));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i, true)));
  pause.addEventListener('click', () => { paused = !paused; pause.textContent = paused ? '▶' : 'Ⅱ'; pause.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow'); schedule(); });
  root.addEventListener('keydown', (event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); root.querySelector(event.key === 'ArrowLeft' ? '.about-arrow--prev' : '.about-arrow--next').focus(); show(current + (event.key === 'ArrowLeft' ? -1 : 1), true); } });
  root.addEventListener('mouseenter', schedule); root.addEventListener('mouseleave', schedule);
  root.addEventListener('focusin', schedule); root.addEventListener('focusout', () => setTimeout(schedule, 0));
  let touch = null;
  root.addEventListener('touchstart', (event) => { touch = {x: event.touches[0].clientX, y: event.touches[0].clientY}; }, {passive: true});
  root.addEventListener('touchend', (event) => { if (!touch) return; const dx = event.changedTouches[0].clientX - touch.x, dy = event.changedTouches[0].clientY - touch.y; touch = null; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1), true); }, {passive: true});
  root.addEventListener('touchcancel', () => { touch = null; }, {passive: true});
  document.addEventListener('visibilitychange', schedule); motion.addEventListener('change', schedule);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(root);
  show(0);
})();
