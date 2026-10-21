// Slide Forms 1–6 straight into the introduction; no WebGL sequence.
const reel = document.querySelector('.reel');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
if (reel && !preference.matches) {
  startForms(reel);
  reel.addEventListener('school-restart', () => startForms(reel));
}

function startForms(reel) {
  const intro = reel.querySelector('.scene--intro');
  const host = document.createElement('div');
  host.className = 'school-growth school-forms';
  host.setAttribute('aria-hidden', 'true');
  const root = document.body.dataset.root || './';
  const portraits = Array.from({ length: 6 }, (_, index) => {
    const student = document.createElement('div');
    student.className = 'form-slide';
    const image = document.createElement('img');
    image.alt = '';
    const glow = document.createElement('canvas');
    glow.className = 'form-slide__glow';
    image.addEventListener('load', () => {
      glow.width = 384;
      glow.height = Math.round(384 * image.naturalHeight / image.naturalWidth);
      const context = glow.getContext('2d');
      context.shadowColor = '#66ffe1';
      context.shadowBlur = 14;
      context.drawImage(image, 0, 0, glow.width, glow.height);
      context.drawImage(image, 0, 0, glow.width, glow.height);
    }, {once:true});
    image.src = `${root}assets/images/generated/form-${index + 1}-${index < 3 ? 'cutout.png' : 'portrait.webp'}`;
    student.append(glow, image);
    host.append(student);
    return student;
  });
  const offer = document.createElement('div');
  offer.className = 'train-offer';
  offer.innerHTML = '<div class="train-offer__kicker">We offer</div><div class="train-offer__form">FORM 1</div>';
  const label = offer.querySelector('.train-offer__form');
  const dust = document.createElement('canvas');
  dust.className = 'train-offer__dust';
  offer.append(dust);
  const dustContext = dust.getContext('2d');
  let lastPhase = -1, particles = [], dustWidth = 0;
  const horizon = document.createElement('div');
  horizon.className = 'train-horizon';
  horizon.innerHTML = `<svg viewBox="0 0 1000 1000" preserveAspectRatio="none"><path class="train-horizon__surface" d="M-100 800 Q500 560 1100 800 L1100 1100 L-100 1100Z"/><path class="train-horizon__edge" d="M-100 800 Q500 560 1100 800"/></svg>`;
  const family = document.createElement('div');
  family.className = 'train-family';
  family.innerHTML = '<span>WE ARE</span><strong>ONE BIG FAMILY</strong>';
  host.append(offer, horizon, family);
  intro.append(host);
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => 1 - (1 - clamp(value)) ** 3;
  const startsAt = 9.57, duration = .7, entry = .4;
  let previous = performance.now();
  let elapsed = previous - Number(reel.dataset.startedAt || previous);
  function frame(now) {
    if (!reel.classList.contains('is-paused')) elapsed += now - previous;
    previous = now;
    const time = elapsed / 1000;
    const active = time - startsAt;
    host.style.opacity = active >= 0 ? '1' : '0';
    const railTime = Math.max(0, active - entry);
    const phase = Math.min(5, Math.floor(railTime / duration));
    const local = railTime / duration - phase;
    const travel = phase + ease((local - .5) / .5);
    const departure = ease((railTime - 6 * duration) / .45);
    offer.style.opacity = active >= 0 ? String(ease(active / .18) * (1 - departure)) : '0';
    label.textContent = `FORM ${phase + 1}`;
    // Sample the actual lettering once per form, then scatter its pixels.
    if (dustContext && (phase !== lastPhase || dustWidth !== offer.clientWidth)) {
      lastPhase = phase;
      dustWidth = offer.clientWidth;
      dust.width = dustWidth;
      dust.height = offer.clientHeight;
      dustContext.clearRect(0, 0, dust.width, dust.height);
      const style = getComputedStyle(label);
      dustContext.font = `700 ${style.fontSize} ${style.fontFamily}`;
      dustContext.textAlign = 'center';
      dustContext.textBaseline = 'middle';
      dustContext.fillStyle = '#fff';
      dustContext.fillText(label.textContent, dust.width / 2, label.offsetTop + label.offsetHeight / 2);
      const pixels = dustContext.getImageData(0, 0, dust.width, dust.height).data;
      particles = [];
      for (let y = 0; y < dust.height; y += 3) {
        for (let x = 0; x < dust.width; x += 3) {
          if (pixels[(y * dust.width + x) * 4 + 3] > 80) {
            particles.push({x, y, dx:25 + Math.random() * 100, dy:(Math.random() - .65) * 120, size:1 + Math.random() * 1.5});
          }
        }
      }
    }
    const dissolve = clamp((local - .5) / .5);
    label.style.opacity = String(ease(local / .18) * (1 - dissolve));
    if (dustContext) {
      dustContext.clearRect(0, 0, dust.width, dust.height);
      if (active >= entry && dissolve > 0) {
        dustContext.globalAlpha = Math.sin(dissolve * Math.PI);
        particles.forEach((particle, index) => {
          dustContext.fillStyle = index % 4 ? '#fff' : '#a5fff0';
          dustContext.fillRect(particle.x + particle.dx * dissolve, particle.y + particle.dy * dissolve, particle.size, particle.size);
        });
        dustContext.globalAlpha = 1;
      }
    }
    label.style.transform = `translateY(${(1 - ease(local / .22)) * 12}px)`;
    horizon.style.opacity = String(ease(active / entry) * (1 - departure));
    family.style.opacity = String(ease((railTime - 6 * duration - .3) / .4));
    family.style.transform = `translateY(${(1 - ease((railTime - 6 * duration - .3) / .4)) * 24}px)`;
    const width = host.clientWidth, height = host.clientHeight;
    const spacing = width <= 700 ? 145 : 230;
    const portraitWidth = Math.max(100, Math.min(180, width * .12));
    portraits.forEach((student, index) => {
      const x = width / 2 + (index - travel) * spacing + (1 - ease(active / entry)) * width;
      const focus = Math.max(0, 1 - Math.abs(x - width / 2) / spacing);
      const horizonY = .68 + (clamp(x / width) - .5) ** 2 / 3;
      student.style.width = `${portraitWidth}px`;
      student.style.height = `${portraitWidth * 1.4}px`;
      student.style.left = `${x}px`;
      student.style.top = `${height * (horizonY + .035) - portraitWidth * .7}px`;
      student.style.opacity = String(1 - departure);
      student.querySelector('.form-slide__glow').style.opacity = String(.2 + focus ** 2 * .8);
      student.style.zIndex = String(Math.round(focus * 100) + 1);
      student.style.transform = `translate(-50%,-50%) scale(${1 + focus * .85})`;
    });
    if (time < 16 && intro.classList.contains('is-on')) requestAnimationFrame(frame);
    else host.remove();
  }
  requestAnimationFrame(frame);
}
