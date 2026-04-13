/* ================================================================
   SCRIPT PRINCIPAL — SITE PESSOAL
================================================================ */

// ================================================================
// 0. LOADING SCREEN — CYBERPUNK
// ================================================================

(function initLoader() {
  const loader   = document.getElementById('loader');
  const bar      = document.getElementById('loader-bar');
  const pct      = document.getElementById('loader-pct');
  const lines    = document.querySelectorAll('.loader-line');
  const lCanvas  = document.getElementById('loader-matrix');
  const lCtx     = lCanvas.getContext('2d');

  // Matrix rain no loader
  lCanvas.width  = window.innerWidth;
  lCanvas.height = window.innerHeight;
  // Chuva neon no loader — igual ao tema principal
  const lPalette = [
    [255,205,0], [255,205,0],
    [0,195,255], [255,30,130], [210,225,255],
  ];
  const lCount = Math.floor(lCanvas.width / 6);
  const lDrops = Array.from({ length: lCount }, () => ({
    x: Math.random() * lCanvas.width,
    y: Math.random() * lCanvas.height,
    len: 10 + Math.random() * 50,
    speed: 2.5 + Math.random() * 8,
    alpha: 0.04 + Math.random() * 0.18,
    c: lPalette[Math.floor(Math.random() * lPalette.length)],
    thick: 0.4 + Math.random() * 0.6,
  }));

  function drawLoaderMatrix() {
    lCtx.clearRect(0, 0, lCanvas.width, lCanvas.height);
    for (const d of lDrops) {
      d.y += d.speed;
      if (d.y - d.len > lCanvas.height) { d.y = -d.len; d.x = Math.random() * lCanvas.width; }
      const g = lCtx.createLinearGradient(d.x, d.y - d.len, d.x, d.y);
      g.addColorStop(0, `rgba(${d.c[0]},${d.c[1]},${d.c[2]},0)`);
      g.addColorStop(1, `rgba(${d.c[0]},${d.c[1]},${d.c[2]},${d.alpha})`);
      lCtx.beginPath();
      lCtx.strokeStyle = g;
      lCtx.lineWidth = d.thick;
      lCtx.moveTo(d.x, d.y - d.len);
      lCtx.lineTo(d.x, d.y);
      lCtx.stroke();
    }
  }
  const lRaf = setInterval(drawLoaderMatrix, 30);

  // Barra de progresso via JS (controla o ::after via custom property)
  function setProgress(val) {
    bar.style.setProperty('--p', val + '%');
    bar.querySelector ? null : null;
    // Controla largura diretamente via um elemento interno
    if (!bar._fill) {
      bar._fill = document.createElement('div');
      bar._fill.style.cssText = 'position:absolute;inset:0;height:100%;background:#00ff41;box-shadow:0 0 10px #00ff41,0 0 24px rgba(0,255,65,0.5);width:0%;transition:width 0.1s linear;';
      bar.appendChild(bar._fill);
    }
    bar._fill.style.width = val + '%';
    pct.textContent = Math.floor(val) + '%';
  }

  // Sequência de loading
  let lineIdx = 0;
  function showNextLine(cb) {
    if (lineIdx >= lines.length) { cb && cb(); return; }
    lines[lineIdx].classList.add('ll-show');
    lineIdx++;
    setTimeout(() => showNextLine(cb), lineIdx < lines.length ? 520 : 0);
  }

  // Anima a barra de 0 a 100
  function animateBar(from, to, duration, cb) {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      // easing: ease-in-out
      const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      setProgress(from + (to - from) * ease);
      if (t < 1) requestAnimationFrame(step);
      else { setProgress(to); cb && cb(); }
    }
    requestAnimationFrame(step);
  }

  // Sequência total
  setTimeout(() => {
    // Linhas 0-2 enquanto barra vai de 0 a 85
    showNextLine(null);
    animateBar(0, 85, 2200, () => {
      // Linha 3 (acesso concedido) + barra vai a 100
      lines[3].classList.add('ll-show');
      animateBar(85, 100, 400, () => {
        // Pequena pausa dramática, depois fecha
        setTimeout(() => {
          clearInterval(lRaf);
          loader.classList.add('loader-hide');
        }, 600);
      });
    });
  }, 300);
})();

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
// 3. RELÂMPAGOS (tema padrão)
// ================================================================

function initStorm() {
  const canvas = document.getElementById('storm-canvas');
  const ctx    = canvas.getContext('2d');
  let w, h;

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Desenha um raio recursivo ramificado
  function drawBolt(x1, y1, x2, y2, depth) {
    if (depth === 0) return;
    const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * (Math.abs(x2 - x1) * 0.8);
    const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 20;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(mx, my);
    ctx.lineTo(x2, y2);
    const rc = depth % 2 === 0 ? '180,80,255' : '80,180,255';
    ctx.strokeStyle = `rgba(${rc}, ${0.13 * depth})`;
    ctx.lineWidth   = depth * 0.5;
    ctx.stroke();

    if (depth > 1 && Math.random() > 0.5) {
      const branchX = mx + (Math.random() - 0.5) * 120;
      const branchY = my + Math.random() * 80;
      drawBolt(mx, my, branchX, branchY, depth - 1);
    }

    drawBolt(x1, y1, mx, my, depth - 1);
    drawBolt(mx, my, x2, y2, depth - 1);
  }

  function flash() {
    if (document.body.classList.contains('cyber')) return;

    const x     = Math.random() * w;
    const endY  = h * (0.4 + Math.random() * 0.4);
    const alpha = 0.18 + Math.random() * 0.22;

    // Flash de fundo difuso — roxo/neon
    ctx.fillStyle = `rgba(140, 0, 255, ${alpha * 0.06})`;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.shadowBlur  = 22;
    ctx.shadowColor = 'rgba(160, 80, 255, 0.7)';
    drawBolt(x, 0, x + (Math.random() - 0.5) * 180, endY, 5);
    ctx.restore();

    // Apaga gradualmente
    let fadeSteps = 8;
    const fadeOut = setInterval(() => {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.25 + Math.random() * 0.1})`;
      ctx.fillRect(0, 0, w, h);
      fadeSteps--;
      if (fadeSteps <= 0) {
        ctx.clearRect(0, 0, w, h);
        clearInterval(fadeOut);
      }
    }, 40);

    // Às vezes um segundo flash rápido (efeito realista)
    if (Math.random() > 0.55) {
      setTimeout(() => {
        if (document.body.classList.contains('cyber')) return;
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.shadowBlur  = 10;
        ctx.shadowColor = 'rgba(180, 200, 255, 0.4)';
        drawBolt(x + (Math.random() - 0.5) * 30, 0, x + (Math.random() - 0.5) * 200, endY * 0.9, 4);
        ctx.restore();
        setTimeout(() => ctx.clearRect(0, 0, w, h), 80);
      }, 120 + Math.random() * 80);
    }

    scheduleNext();
  }

  function scheduleNext() {
    setTimeout(flash, 3000 + Math.random() * 9000);
  }

  // Primeiro raio com delay
  setTimeout(flash, 2000 + Math.random() * 4000);
}

initStorm();

// ================================================================
// 3. CHUVA NEON — CP2077 (tema padrão)
// ================================================================

function initNeonRain() {
  const canvas = document.getElementById('snow-canvas');
  const ctx    = canvas.getContext('2d');
  let w, h, drops;

  const COUNT = window.innerWidth < 600 ? 90 : 200;

  // Paleta CP2077: amarelo, azul elétrico, rosa, branco-frio
  const PALETTE = [
    [255, 205, 0],
    [255, 205, 0],   // amarelo dobrado — predominante
    [0,   195, 255],
    [255, 30,  130],
    [210, 225, 255],
  ];

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function makeDrop() {
    const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    return {
      x:     Math.random() * w,
      y:     Math.random() * h,
      len:   10 + Math.random() * 55,
      speed: 3 + Math.random() * 9,
      alpha: 0.055 + Math.random() * 0.25,
      r: c[0], g: c[1], b: c[2],
      thick: 0.4 + Math.random() * 0.7,
    };
  }

  function initDrops() {
    drops = [];
    for (let i = 0; i < COUNT; i++) drops.push(makeDrop());
  }

  resize();
  initDrops();
  window.addEventListener('resize', () => { resize(); initDrops(); });

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (const d of drops) {
      d.y += d.speed;
      if (d.y - d.len > h) {
        d.y = -d.len;
        d.x = Math.random() * w;
      }

      const grad = ctx.createLinearGradient(d.x, d.y - d.len, d.x, d.y);
      grad.addColorStop(0, `rgba(${d.r},${d.g},${d.b},0)`);
      grad.addColorStop(1, `rgba(${d.r},${d.g},${d.b},${d.alpha})`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = d.thick;
      ctx.moveTo(d.x, d.y - d.len);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  draw();
}

initNeonRain();

// ================================================================
// 3b. SKYLINE DA CIDADE — CP2077 (tema padrão)
// ================================================================

function initSkyline() {
  const canvas = document.getElementById('skyline-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, buildings, frame = 0;

  const WIN_COLORS = [
    [255, 205, 0],   // amarelo
    [0,   195, 255], // ciano
    [255, 255, 210], // branco quente
    [255, 80,  180], // pink
  ];

  function makeBuildings() {
    buildings = [];
    const ground = h;

    // Camada traseira — prédios menores, mais apagados
    let x = 0;
    while (x < w) {
      const bw = 18 + Math.random() * 55;
      const bh = 30 + Math.random() * 110;
      const wins = [];
      const cols = Math.floor(bw / 9);
      const rows = Math.floor(bh / 11);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.6) {
            const col = WIN_COLORS[Math.floor(Math.random() * WIN_COLORS.length)];
            wins.push({ x: x + c * 9 + 2, y: ground - bh + r * 11 + 3,
              r: col[0], g: col[1], b: col[2],
              a: 0.12 + Math.random() * 0.22,
              blink: Math.random() > 0.9,
              on: true, timer: Math.random() * 180,
            });
          }
        }
      }
      buildings.push({ x, y: ground - bh, w: bw, h: bh, layer: 0, wins });
      x += bw + Math.random() * 6;
    }

    // Camada frontal — megatowers
    x = -30;
    while (x < w + 30) {
      const bw = 28 + Math.random() * 95;
      const bh = 80 + Math.random() * (h * 0.65);
      const wins = [];
      const cols = Math.floor(bw / 8);
      const rows = Math.floor(bh / 10);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.55) {
            const col = WIN_COLORS[Math.floor(Math.random() * WIN_COLORS.length)];
            wins.push({ x: x + c * 8 + 2, y: ground - bh + r * 10 + 2,
              r: col[0], g: col[1], b: col[2],
              a: 0.25 + Math.random() * 0.45,
              blink: Math.random() > 0.88,
              on: true, timer: Math.random() * 200,
            });
          }
        }
      }
      const antenna = Math.random() > 0.55
        ? { h: 12 + Math.random() * 50 }
        : null;
      buildings.push({ x, y: ground - bh, w: bw, h: bh, layer: 1, wins, antenna });
      x += bw + Math.random() * 18;
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, w, h);
    frame++;

    // Camada 0 — fundo
    for (const b of buildings) {
      if (b.layer !== 0) continue;
      ctx.fillStyle = 'rgba(8, 2, 18, 0.55)';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      for (const win of b.wins) {
        if (win.blink) {
          win.timer--;
          if (win.timer <= 0) { win.on = !win.on; win.timer = 40 + Math.random() * 160; }
          if (!win.on) continue;
        }
        ctx.fillStyle = `rgba(${win.r},${win.g},${win.b},${win.a * 0.45})`;
        ctx.fillRect(win.x, win.y, 4, 5);
      }
    }

    // Camada 1 — frente
    for (const b of buildings) {
      if (b.layer !== 1) continue;
      ctx.fillStyle = 'rgba(4, 0, 10, 0.94)';
      ctx.fillRect(b.x, b.y, b.w, b.h);

      if (b.antenna) {
        ctx.fillStyle = 'rgba(4, 0, 10, 0.98)';
        ctx.fillRect(b.x + b.w / 2 - 1, b.y - b.antenna.h, 2, b.antenna.h);
        const pulse = 0.5 + Math.sin(frame * 0.04 + b.x) * 0.45;
        ctx.fillStyle = `rgba(255, 40, 40, ${pulse})`;
        ctx.fillRect(b.x + b.w / 2 - 2, b.y - b.antenna.h - 3, 4, 4);
      }

      for (const win of b.wins) {
        if (win.blink) {
          win.timer--;
          if (win.timer <= 0) { win.on = !win.on; win.timer = 40 + Math.random() * 200; }
          if (!win.on) continue;
        }
        ctx.fillStyle = `rgba(${win.r},${win.g},${win.b},${win.a})`;
        ctx.fillRect(win.x, win.y, 4, 5);
      }
    }

    // Brilho neon no chão — reflexo da cidade
    const grd = ctx.createLinearGradient(0, h - 60, 0, h);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(0.5, 'rgba(180,0,255,0.035)');
    grd.addColorStop(1,   'rgba(255,80,0,0.05)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, h - 60, w, 60);

    requestAnimationFrame(drawFrame);
  }

  function init() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = Math.round(window.innerHeight * 0.55);
    makeBuildings();
    drawFrame();
  }

  init();
  window.addEventListener('resize', () => {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = Math.round(window.innerHeight * 0.55);
    makeBuildings();
  });
}

initSkyline();

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
  } else {
    matrix.stop();
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
  setTimeout(() => {
    heroEls.forEach(el => el.classList.add('visible'));
  }, 200);
}

// Hero title — letras se despedaçando em estilhaços a cada 5s
function initTitleScatter() {
  const title = document.querySelector('.hero-title');
  if (!title) return;

  const text = title.textContent.trim();

  // Para cada letra, cria 4 estilhaços triangulares com clip-path
  // que juntos cobrem o caractere inteiro
  title.innerHTML = text.split('').map(ch => {
    if (ch === ' ') {
      return '<span class="tl-wrap" style="display:inline-block;white-space:pre"> </span>';
    }

    // Ponto de fratura aleatório por letra
    const cx = 30 + Math.random() * 40;
    const cy = 25 + Math.random() * 50;

    // 4 triângulos que se encontram em (cx, cy) e cobrem o bounding box
    const clips = [
      `polygon(0% 0%, 100% 0%, ${cx}% ${cy}%)`,           // topo
      `polygon(100% 0%, 100% 100%, ${cx}% ${cy}%)`,        // direita
      `polygon(100% 100%, 0% 100%, ${cx}% ${cy}%)`,        // base
      `polygon(0% 100%, 0% 0%, ${cx}% ${cy}%)`,            // esquerda
    ];

    const shards = clips.map(clip =>
      `<span class="tl-shard" style="position:absolute;inset:0;clip-path:${clip}">${ch}</span>`
    ).join('');

    // tl-sp: caractere invisível que dá dimensão ao wrapper
    return `<span class="tl-wrap" style="display:inline-block;position:relative">` +
           `<span class="tl-sp" style="visibility:hidden">${ch}</span>${shards}</span>`;
  }).join('');

  function scatter() {
    if (document.body.classList.contains('cyber')) return;

    title.style.animation = 'none';
    const shards = title.querySelectorAll('.tl-shard');

    // Fase 1: estilhaços voam para todos os lados
    shards.forEach(sp => {
      const dx  = (Math.random() - 0.5) * 900;
      const dy  = (Math.random() - 0.5) * 600;
      const rot = (Math.random() - 0.5) * 1080;
      sp.style.transition = 'transform 0.55s cubic-bezier(0.6,0,1,0.5), opacity 0.45s ease';
      sp.style.transform  = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      sp.style.opacity    = '0';
    });

    // Fase 2: volta e se reconstrói
    setTimeout(() => {
      shards.forEach(sp => {
        sp.style.transition = 'transform 0.75s cubic-bezier(0.15,0.85,0.3,1), opacity 0.75s ease';
        sp.style.transform  = 'translate(0,0) rotate(0deg)';
        sp.style.opacity    = '1';
      });
      setTimeout(() => { title.style.animation = ''; }, 900);
    }, 750);
  }

  setTimeout(() => {
    scatter();
    setInterval(scatter, 5000);
  }, 3000);
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
initTitleScatter();
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
  // Retoma música principal se estava tocando antes
  if (isPlaying && !isMuted) {
    audio.volume = 0;
    audio.play().then(() => {
      fadeVolume(audio, 0, INITIAL_VOLUME, 1000);
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
