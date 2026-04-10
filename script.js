/* ================================================================
   SCRIPT PRINCIPAL — SITE PESSOAL
   ================================================================
   Organização:
     1. Cursor customizado
     2. Grain / ruído de fundo
     3. Player de música
     4. Scroll reveal (animações de entrada)
     5. Elemento secreto
================================================================ */

// ================================================================
// 1. CURSOR CUSTOMIZADO
// ================================================================

const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursor-trail');

let mouseX = -100, mouseY = -100;
let trailX = -100, trailY = -100;

// Segue o mouse diretamente
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

// Trail com lag suave
function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  trail.style.left = trailX + 'px';
  trail.style.top  = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

// Efeito ao hover em elementos interativos
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

// Esconde cursor ao sair da janela
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
// Para ajustar a intensidade do grain: altere a opacidade em
// style.css, seletor #grain-canvas { opacity: ... }
// Valores recomendados: 0.02 (sutil) a 0.08 (visível)
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
      buffer[i]     = v; // R
      buffer[i + 1] = v; // G
      buffer[i + 2] = v; // B
      buffer[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Atualiza o grain a cada ~80ms para efeito animado sutil
  // Para grain estático (mais leve): chame generateNoise() só uma vez
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
      y:     Math.random() * h - h,            // começa acima da tela
      r:     Math.random() * 1.4 + 0.3,        // raio 0.3–1.7px
      speed: Math.random() * 0.5 + 0.15,       // queda lenta
      drift: (Math.random() - 0.5) * 0.25,     // deriva lateral suave
      alpha: Math.random() * 0.45 + 0.08,      // opacidade discreta
      sway:  Math.random() * Math.PI * 2,      // fase inicial do balanço
      swaySpeed: Math.random() * 0.008 + 0.003 // velocidade do balanço
    };
  }

  function initFlakes() {
    flakes = [];
    for (let i = 0; i < COUNT; i++) {
      const f = makeFlake();
      f.y = Math.random() * h; // distribui pela tela no início
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

      // Reseta quando sai da tela
      if (f.y > h + 4) {
        f.y = -4;
        f.x = Math.random() * w;
      }
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

    // Fundo semi-transparente para o rastro
    mctx.fillStyle = 'rgba(2, 11, 2, 0.055)';
    mctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const y = drops[i] * fontSize;

      // Cabeça da coluna — brilhante
      if (drops[i] * fontSize < matrixCanvas.height * 0.3) {
        mctx.fillStyle = 'rgba(180, 255, 200, 0.95)';
      } else {
        // Intensidade decrescente com a posição
        const alpha = Math.random() > 0.5 ? 0.85 : 0.4;
        mctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
      }

      mctx.font = `${fontSize}px "Space Mono", monospace`;
      mctx.fillText(char, i * fontSize, y);

      // Reseta a coluna com chance aleatória
      if (y > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    matrixRAF = requestAnimationFrame(drawMatrix);
  }

  return { start: () => { matrixActive = true; drawMatrix(); },
           stop:  () => { matrixActive = false; cancelAnimationFrame(matrixRAF);
                          mctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height); } };
}

const matrix = initMatrix();

// ================================================================
// 4. TEMA — TOGGLE
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
    // Para Crystal Castles e inicia Snow Strippers
    fadeVolume(audio, audio.volume, 0, 400, () => audio.pause());
    cyberAudio.volume = 0;
    cyberAudio.play().then(() => {
      isPlaying = true;
      isMuted   = false;
      fadeVolume(cyberAudio, 0, INITIAL_VOLUME, 1200);
      updateMuteBtn();
    }).catch(() => {});
  } else {
    matrix.stop();
    // Para Snow Strippers e retoma Crystal Castles
    fadeVolume(cyberAudio, cyberAudio.volume, 0, 400, () => {
      cyberAudio.pause();
      cyberAudio.currentTime = 0;
    });
    if (!isMuted) {
      audio.volume = 0;
      audio.play().then(() => {
        isPlaying = true;
        fadeVolume(audio, 0, INITIAL_VOLUME, 1200);
        updateMuteBtn();
      }).catch(() => {});
    }
  }

  // Re-observa elementos para re-disparar animações
  document.querySelectorAll('.reveal.visible').forEach(el => {
    el.classList.remove('visible');
    setTimeout(() => el.classList.add('visible'), 50);
  });
});

// ================================================================
// 6. PLAYER DE MÚSICA
// ================================================================
// Para trocar a música:
//   1. Coloque seu .mp3 em /music/
//   2. Edite o <source src="..."> no index.html
//
// Para ajustar o volume inicial: altere o valor de INITIAL_VOLUME
// Escala: 0.0 (mudo) até 1.0 (máximo)
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

function tryAutoplay() {
  audio.volume = 0;
  audio.play()
    .then(() => {
      isPlaying = true;
      fadeVolume(audio, 0, INITIAL_VOLUME, 1500);
      updateMuteBtn();
    })
    .catch(() => {
      isPlaying = false;
      updateMuteBtn();
      const events = ['touchstart', 'touchend', 'click', 'keydown'];
      function startOnInteraction(e) {
        // No mobile, só inicia se o clique não foi no botão de música
        if (e.target === muteBtn || muteBtn.contains(e.target)) return;
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
  if (!isPlaying) {
    audio.volume = 0;
    audio.play().then(() => {
      isPlaying = true;
      isMuted   = false;
      fadeVolume(audio, 0, INITIAL_VOLUME, 800);
      updateMuteBtn();
    }).catch(() => {});
  } else if (!isMuted) {
    isMuted = true;
    fadeVolume(audio, audio.volume, 0, 500, () => audio.pause());
    updateMuteBtn();
  } else {
    isMuted = false;
    audio.play();
    fadeVolume(audio, 0, INITIAL_VOLUME, 800);
    updateMuteBtn();
  }
});

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

// Inicia depois de um pequeno delay para não chocar o usuário
setTimeout(tryAutoplay, 800);

// ================================================================
// 6. SCROLL REVEAL — Animações de entrada
// ================================================================
// Para adicionar efeito de reveal a qualquer elemento:
//   1. Adicione a classe "reveal" no HTML
//   2. O JavaScript cuidará do resto
// ================================================================

// Hero — inicia visível após delay
function initHeroAnimations() {
  const heroEls = document.querySelectorAll('.hero .fade-in-up');
  // Pequeno delay para o fade inicial
  setTimeout(() => {
    heroEls.forEach(el => el.classList.add('visible'));
  }, 200);
}

// Intersection Observer para elementos .reveal
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Opcional: deixe observando para re-animar ao rolar de volta
        // Se quiser que anime só uma vez, descomente a linha abaixo:
        // observer.unobserve(entry.target);
      } else {
        // Remove a classe para re-animar ao voltar ao scroll
        entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.12,          // Elemento precisa estar 12% visível
    rootMargin: '0px 0px -40px 0px' // Offset para não acionar muito cedo
  });

  revealEls.forEach(el => observer.observe(el));
}

initHeroAnimations();
initScrollReveal();

// ================================================================
// 7. DISCORD — COPIAR USERNAME AO CLICAR
// ================================================================

const discordCard   = document.getElementById('discord-card');
const discordCopied = document.getElementById('discord-copied');

if (discordCard) {
  discordCard.addEventListener('click', () => {
    navigator.clipboard.writeText('sc6utxx').then(() => {
      discordCopied.classList.add('show');
      setTimeout(() => discordCopied.classList.remove('show'), 2000);
    }).catch(() => {
      // Fallback para navegadores sem clipboard API
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
// 8. ELEMENTO SECRETO
// Fecha página secreta com Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSecretPage();
});

// ================================================================
// 9. PÁGINA SECRETA (overlay interno)
// ================================================================

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

// Data dinâmica
if (spDateEl) {
  spDateEl.textContent = new Date()
    .toLocaleDateString('pt-BR', { year:'numeric', month:'long', day:'2-digit' })
    .toLowerCase();
}

// Grain próprio da página secreta
(function spGrain() {
  const c   = document.getElementById('sp-grain');
  const ctx = c.getContext('2d');
  let w, h, raf;

  function resize() {
    w = c.width  = window.innerWidth;
    h = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let last = 0;
  function loop(ts) {
    if (!spPage.classList.contains('sp-open')) { raf = requestAnimationFrame(loop); return; }
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
    raf = requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

// Música da página secreta
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

// Abrir página secreta
spOpen.addEventListener('click', openSecretPage);

function openSecretPage() {
  spPage.classList.add('sp-open');
  spPage.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Para o áudio principal imediatamente (garante no mobile)
  audio.pause();
  audio.volume = 0;
  cyberAudio.pause();
  cyberAudio.volume = 0;
  // Inicia música secreta após delay atmosférico
  setTimeout(spTryPlay, 700);
}


// Fechar página secreta
spClose.addEventListener('click', closeSecretPage);

function closeSecretPage() {
  if (!spPage.classList.contains('sp-open')) return;
  spPage.classList.remove('sp-open');
  spPage.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  // Para música secreta com fade
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
  // Retoma música do tema ativo se estava tocando antes
  if (isPlaying && !isMuted) {
    const activeAudio = isCyber ? cyberAudio : audio;
    activeAudio.volume = 0;
    activeAudio.play().then(() => {
      fadeVolume(activeAudio, 0, INITIAL_VOLUME, 1000);
    }).catch(() => {});
  }
}

// ================================================================
// Pequeno easter egg de console (para quem inspecionar o código)
// ================================================================
console.log(
  '%c∴ você chegou até aqui.',
  'color: #7c5fa8; font-family: monospace; font-size: 12px;'
);
console.log(
  '%ccurioso assim.',
  'color: rgba(255,255,255,0.3); font-family: monospace; font-size: 11px;'
);
