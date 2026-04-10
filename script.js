/* ================================================================
   SCRIPT PRINCIPAL — SITE PESSOAL
   ================================================================
   Organização:
     1. Cursor customizado
     2. Grain / ruído de fundo
     3. Neve (tema padrão)
     4. Matrix rain (tema cyber)
     5. Player de música
     6. Tema toggle
     7. Scroll reveal
     8. Discord
     9. Página secreta
================================================================ */

// ================================================================
// 1. CURSOR CUSTOMIZADO
// ================================================================

const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursor-trail');

let mouseX = -100, mouseY = -100;
let trailX = -100, trailY = -100;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  trail.style.left = trailX + 'px';
  trail.style.top  = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

const interactiveEls = document.querySelectorAll(
  'a, button, .fragment, .music-item, .gallery-item, .secret-trigger'
);

interactiveEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hover');
    trail.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hover');
    trail.classList.remove('hover');
  });
});

document.addEventListener('mouseleave', () => {
  cursor.style.opacity = '0';
  trail.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  cursor.style.opacity = '1';
  trail.style.opacity = '1';
});

// ================================================================
// 2. GRAIN / RUÍDO DE FUNDO
// ================================================================

function initGrain() {
  const canvas = document.getElementById('grain-canvas');
  const ctx    = canvas.getContext('2d');
  let w, h;

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  function generateNoise() {
    const imageData = ctx.createImageData(w, h);
    const buffer    = imageData.data;
    for (let i = 0; i < buffer.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      buffer[i]     = v;
      buffer[i + 1] = v;
      buffer[i + 2] = v;
      buffer[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  let lastTime = 0;
  function loop(timestamp) {
    if (timestamp - lastTime > 80) {
      generateNoise();
      lastTime = timestamp;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

initGrain();

// ================================================================
// 3. NEVE (tema padrão)
// ================================================================

function initSnow() {
  const canvas = document.getElementById('snow-canvas');
  const ctx    = canvas.getContext('2d');
  let w, h, flakes;

  const COUNT = window.innerWidth < 600 ? 55 : 100;

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function makeFlake() {
    return {
      x:     Math.random() * w,
      y:     Math.random() * h - h,
      r:     Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.5 + 0.15,
      drift: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.45 + 0.08,
      sway:  Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.008 + 0.003
    };
  }

  function initFlakes() {
    flakes = [];
    for (let i = 0; i < COUNT; i++) {
      const f = makeFlake();
      f.y = Math.random() * h;
      flakes.push(f);
    }
  }

  resize();
  initFlakes();
  window.addEventListener('resize', () => { resize(); initFlakes(); });

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.sway += f.swaySpeed;
      f.x    += Math.sin(f.sway) * 0.3 + f.drift;
      f.y    += f.speed;
      if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w; }
      if (f.x < -4) f.x = w + 4;
      if (f.x > w + 4) f.x = -4;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(205, 212, 235, ${f.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

initSnow();

// ================================================================
// 4. MATRIX RAIN (tema cyber)
// ================================================================

const matrixCanvas = document.getElementById('matrix-canvas');
const mctx = matrixCanvas.getContext('2d');
let matrixActive = false;
let matrixRAF = null;

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|/\\:;';

function initMatrix() {
  let cols, drops, fontSize;

  function resize() {
    matrixCanvas.width  = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    fontSize = window.innerWidth < 600 ? 11 : 14;
    cols = Math.floor(matrixCanvas.width / fontSize);
    drops = Array(cols).fill(1);
  }

  resize();
  window.addEventListener('resize', resize);

  function drawMatrix() {
    if (!matrixActive) return;
    mctx.fillStyle = 'rgba(2, 11, 2, 0.055)';
    mctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const y = drops[i] * fontSize;
      if (drops[i] * fontSize < matrixCanvas.height * 0.3) {
        mctx.fillStyle = 'rgba(180, 255, 200, 0.95)';
      } else {
        const alpha = Math.random() > 0.5 ? 0.85 : 0.4;
        mctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
      }
      mctx.font = `${fontSize}px "Space Mono", monospace`;
      mctx.fillText(char, i * fontSize, y);
      if (y > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    matrixRAF = requestAnimationFrame(drawMatrix);
  }

  return {
    start: () => { matrixActive = true; drawMatrix(); },
    stop:  () => {
      matrixActive = false;
      cancelAnimationFrame(matrixRAF);
      mctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
  };
}

const matrix = initMatrix();

// ================================================================
// 5. PLAYER DE MÚSICA
// ================================================================

const INITIAL_VOLUME = 0.08;

const audio      = document.getElementById('bg-audio');
const cyberAudio = document.getElementById('cyber-audio');
const muteBtn    = document.getElementById('mute-btn');
const iconPlay   = document.getElementById('icon-play');
const iconPause  = document.getElementById('icon-pause');
const muteLabel  = document.getElementById('mute-label');

let isPlaying = false;
let isMuted   = false;
let cyberUnlocked = false;

audio.volume = INITIAL_VOLUME;

function updateMuteBtn() {
  if (isPlaying && !isMuted) {
    muteBtn.classList.add('playing');
    iconPlay.classList.add('hidden');
    iconPause.classList.remove('hidden');
    muteLabel.textContent = 'pausar';
  } else {
    muteBtn.classList.remove('playing');
    iconPlay.classList.remove('hidden');
    iconPause.classList.add('hidden');
    muteLabel.textContent = 'música';
  }
}

// Fade de volume suave
function fadeVolume(audioEl, from, to, duration, callback) {
  const steps    = 30;
  const stepTime = duration / steps;
  const stepVal  = (to - from) / steps;
  let   current  = from;

  const interval = setInterval(() => {
    current += stepVal;
    if ((stepVal > 0 && current >= to) || (stepVal < 0 && current <= to)) {
      audioEl.volume = Math.max(0, Math.min(1, to));
      clearInterval(interval);
      if (callback) callback();
    } else {
      audioEl.volume = Math.max(0, Math.min(1, current));
    }
  }, stepTime);
}

// Desbloqueia cyberAudio na mesma janela de gesto do usuário
function unlockCyberAudio() {
  if (cyberUnlocked) return;
  cyberUnlocked = true;
  cyberAudio.volume = 0;
  cyberAudio.play().then(() => {
    cyberAudio.pause();
    cyberAudio.currentTime = 0;
  }).catch(() => { cyberUnlocked = false; });
}

function tryAutoplay() {
  audio.volume = 0;
  audio.play()
    .then(() => {
      isPlaying = true;
      unlockCyberAudio();
      fadeVolume(audio, 0, INITIAL_VOLUME, 1500);
      updateMuteBtn();
    })
    .catch(() => {
      isPlaying = false;
      updateMuteBtn();
      const events = ['touchstart', 'touchend', 'click', 'keydown'];
      function startOnInteraction(e) {
        if (e.target === muteBtn || muteBtn.contains(e.target)) return;
        // Desbloqueia cyberAudio junto com o audio principal
        unlockCyberAudio();
        audio.volume = 0;
        audio.play().then(() => {
          isPlaying = true;
          isMuted   = false;
          fadeVolume(audio, 0, INITIAL_VOLUME, 1500);
          updateMuteBtn();
        }).catch(() => {});
        events.forEach(ev => document.removeEventListener(ev, startOnInteraction));
      }
      events.forEach(ev => document.addEventListener(ev, startOnInteraction));
    });
}

muteBtn.addEventListener('click', () => {
  const activeAudio = isCyber ? cyberAudio : audio;
  if (!isPlaying) {
    activeAudio.volume = 0;
    activeAudio.play().then(() => {
      isPlaying = true;
      isMuted   = false;
      fadeVolume(activeAudio, 0, INITIAL_VOLUME, 800);
      updateMuteBtn();
    }).catch(() => {});
  } else if (!isMuted) {
    isMuted = true;
    fadeVolume(activeAudio, activeAudio.volume, 0, 500, () => activeAudio.pause());
    updateMuteBtn();
  } else {
    isMuted = false;
    activeAudio.volume = 0;
    activeAudio.play().then(() => {
      fadeVolume(activeAudio, 0, INITIAL_VOLUME, 800);
    }).catch(() => {});
    updateMuteBtn();
  }
});

setTimeout(tryAutoplay, 800);

// ================================================================
// 6. TEMA — TOGGLE
// ================================================================

const themeToggle = document.getElementById('theme-toggle');
const themeLabel  = document.getElementById('theme-label');
let isCyber = false;

themeToggle.addEventListener('click', () => {
  isCyber = !isCyber;
  document.body.classList.toggle('cyber', isCyber);
  themeLabel.textContent = isCyber ? 'cyber' : 'clima';

  if (isCyber) {
    matrix.start();
    // Para Crystal Castles
    audio.pause();
    audio.volume = 0;
    // Inicia Snow Strippers
    cyberAudio.currentTime = 0;
    cyberAudio.volume = 0;
    cyberAudio.play().then(() => {
      isPlaying = true;
      isMuted   = false;
      fadeVolume(cyberAudio, 0, INITIAL_VOLUME, 1200);
      updateMuteBtn();
    }).catch(() => {});
  } else {
    matrix.stop();
    // Para Snow Strippers
    cyberAudio.pause();
    cyberAudio.volume = 0;
    cyberAudio.currentTime = 0;
    // Retoma Crystal Castles
    audio.volume = 0;
    audio.play().then(() => {
      isPlaying = true;
      isMuted   = false;
      fadeVolume(audio, 0, INITIAL_VOLUME, 1200);
      updateMuteBtn();
    }).catch(() => {});
  }

  document.querySelectorAll('.reveal.visible').forEach(el => {
    el.classList.remove('visible');
    setTimeout(() => el.classList.add('visible'), 50);
  });
});

// ================================================================
// 7. SCROLL REVEAL — Animações de entrada
// ================================================================

function initHeroAnimations() {
  const heroEls = document.querySelectorAll('.hero .fade-in-up');
  setTimeout(() => {
    heroEls.forEach(el => el.classList.add('visible'));
  }, 200);
}

function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

initHeroAnimations();
initScrollReveal();

// ================================================================
// 8. DISCORD — COPIAR USERNAME AO CLICAR
// ================================================================

const discordCard   = document.getElementById('discord-card');
const discordCopied = document.getElementById('discord-copied');

if (discordCard) {
  discordCard.addEventListener('click', () => {
    navigator.clipboard.writeText('sc6utxx').then(() => {
      discordCopied.classList.add('show');
      setTimeout(() => discordCopied.classList.remove('show'), 2000);
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = 'sc6utxx';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      discordCopied.classList.add('show');
      setTimeout(() => discordCopied.classList.remove('show'), 2000);
    });
  });
}

// ================================================================
// 9. PÁGINA SECRETA (overlay interno)
// ================================================================

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSecretPage();
});

const spPage    = document.getElementById('secret-page');
const spOpen    = document.getElementById('open-secret-page');
const spClose   = document.getElementById('sp-close');
const spAudio   = document.getElementById('sp-audio');
const spMute    = document.getElementById('sp-mute');
const spMuteIco = document.getElementById('sp-mute-icon');
const spDateEl  = document.getElementById('sp-date');

const SP_VOL    = 0.1;
let spPlaying   = false;
let spMuted     = false;

if (spDateEl) {
  spDateEl.textContent = new Date()
    .toLocaleDateString('pt-BR', { year:'numeric', month:'long', day:'2-digit' })
    .toLowerCase();
}

// Grain da página secreta
(function spGrain() {
  const c   = document.getElementById('sp-grain');
  const ctx = c.getContext('2d');
  let w, h;

  function resize() {
    w = c.width  = window.innerWidth;
    h = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let last = 0;
  function loop(ts) {
    if (!spPage.classList.contains('sp-open')) { requestAnimationFrame(loop); return; }
    if (ts - last > 65) {
      const img = ctx.createImageData(w, h);
      const buf = img.data;
      for (let i = 0; i < buf.length; i += 4) {
        const v = (Math.random() * 255)|0;
        buf[i] = buf[i+1] = buf[i+2] = v;
        buf[i+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      last = ts;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

spAudio.volume = 0;

function spUpdateMute() {
  if (spPlaying && !spMuted) {
    spMute.classList.add('sp-playing');
    spMuteIco.textContent = '♫';
  } else {
    spMute.classList.remove('sp-playing');
    spMuteIco.textContent = '♩';
  }
}

function spTryPlay() {
  spAudio.volume = 0;
  spAudio.play()
    .then(() => {
      spPlaying = true;
      fadeVolume(spAudio, 0, SP_VOL, 2000);
      spUpdateMute();
    })
    .catch(() => {
      spPlaying = false;
      spUpdateMute();
    });
}

spMute.addEventListener('click', () => {
  if (!spPlaying) {
    spAudio.play().then(() => {
      spPlaying = true; spMuted = false;
      fadeVolume(spAudio, 0, SP_VOL, 1200);
      spUpdateMute();
    }).catch(() => {});
  } else if (!spMuted) {
    spMuted = true;
    fadeVolume(spAudio, spAudio.volume, 0, 600, () => spAudio.pause());
    spUpdateMute();
  } else {
    spMuted = false;
    spAudio.play();
    fadeVolume(spAudio, 0, SP_VOL, 1200);
    spUpdateMute();
  }
});

spOpen.addEventListener('click', openSecretPage);

function openSecretPage() {
  spPage.classList.add('sp-open');
  spPage.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  audio.pause();
  audio.volume = 0;
  cyberAudio.pause();
  cyberAudio.volume = 0;
  setTimeout(spTryPlay, 700);
}

spClose.addEventListener('click', closeSecretPage);

function closeSecretPage() {
  if (!spPage.classList.contains('sp-open')) return;
  spPage.classList.remove('sp-open');
  spPage.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (spPlaying) {
    spMuted = true;
    fadeVolume(spAudio, spAudio.volume, 0, 600, () => {
      spAudio.pause();
      spAudio.currentTime = 0;
      spPlaying = false;
      spMuted   = false;
      spUpdateMute();
    });
  }
  if (isPlaying && !isMuted) {
    const activeAudio = isCyber ? cyberAudio : audio;
    activeAudio.volume = 0;
    activeAudio.play().then(() => {
      fadeVolume(activeAudio, 0, INITIAL_VOLUME, 1000);
    }).catch(() => {});
  }
}

// ================================================================
// Easter egg de console
// ================================================================
console.log('%c∴ você chegou até aqui.', 'color: #7c5fa8; font-family: monospace; font-size: 12px;');
console.log('%ccurioso assim.', 'color: rgba(255,255,255,0.3); font-family: monospace; font-size: 11px;');
