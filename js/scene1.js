/**
 * @file scene1.js
 * @description Nivel 1 — La Prensa de Papas. Prensa la base de la causa antes de que acabe el tiempo.
 */
const Scene1 = (() => {
  const TIME_LIMIT_MS = 20000;
  const PROGRESS_PER_PRESS = 5;
  const COMPRESS_DECAY = 0.92;
  const COMPRESS_IMPULSE = 1;

  let ctx = null;
  let width = 0;
  let height = 0;
  let onComplete = null;
  let onFail = null;

  let progress = 0;
  let timeLeft = TIME_LIMIT_MS;
  let compressAmount = 0;
  let compressTarget = 0;
  let finished = false;
  let keyHandler = null;
  let particles = [];

  const PressRenderer = {
    drawBackground(context, w, h) {
      const grad = context.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#2a2218');
      grad.addColorStop(0.6, '#3d3028');
      grad.addColorStop(1, '#1a1410');
      context.fillStyle = grad;
      context.fillRect(0, 0, w, h);

      const tableY = h * 0.72;
      context.fillStyle = '#5a4030';
      context.fillRect(w * 0.08, tableY, w * 0.84, h * 0.06);
      context.fillStyle = '#4a3428';
      context.fillRect(w * 0.08, tableY + h * 0.06, w * 0.84, h * 0.025);

      context.fillStyle = 'rgba(232, 213, 181, 0.5)';
      context.font = `600 ${Math.max(11, w * 0.024)}px Nunito, sans-serif`;
      context.textAlign = 'center';
      context.fillText('Cocina piurana — Preparación de la base', w / 2, 28);
    },

    drawPress(context, w, h, prog, compression) {
      const cx = w / 2;
      const baseY = h * 0.58;
      const pressW = Math.min(w * 0.42, 220);
      const plateH = Math.min(h * 0.045, 28);
      const maxTravel = Math.min(h * 0.14, 80);
      const travel = compression * maxTravel;

      const bottomPlateY = baseY;
      const topPlateY = baseY - plateH - maxTravel * 0.55 + travel;
      const mashHeight = (maxTravel * 0.5) * (prog / 100);

      CanvasUtils.roundRect(context, cx - pressW / 2, bottomPlateY, pressW, plateH, 6);
      context.fillStyle = '#6a6a72';
      context.fill();
      context.strokeStyle = '#9a9aa8';
      context.lineWidth = 2;
      context.stroke();

      if (mashHeight > 2) {
        const mashY = bottomPlateY - mashHeight;
        context.fillStyle = '#e8c84a';
        CanvasUtils.roundRect(context, cx - pressW * 0.42, mashY, pressW * 0.84, mashHeight, 4);
        context.fill();
        context.fillStyle = 'rgba(212, 160, 60, 0.35)';
        for (let i = 0; i < 4; i++) {
          context.beginPath();
          context.arc(
            cx - pressW * 0.3 + i * pressW * 0.2,
            mashY + mashHeight * 0.5,
            3,
            0,
            Math.PI * 2
          );
          context.fill();
        }
      } else {
        context.fillStyle = '#e8c84a';
        context.beginPath();
        context.ellipse(cx, bottomPlateY - 4, pressW * 0.35, 10, 0, 0, Math.PI * 2);
        context.fill();
      }

      const frameW = pressW + 24;
      context.fillStyle = '#4a4a52';
      context.fillRect(cx - frameW / 2, bottomPlateY - maxTravel * 0.65 - 20, 14, maxTravel * 0.65 + plateH + 30);
      context.fillRect(cx + frameW / 2 - 14, bottomPlateY - maxTravel * 0.65 - 20, 14, maxTravel * 0.65 + plateH + 30);

      CanvasUtils.roundRect(context, cx - pressW / 2, topPlateY, pressW, plateH, 6);
      context.fillStyle = '#7a7a84';
      context.fill();
      context.strokeStyle = '#b0b0bc';
      context.lineWidth = 2;
      context.stroke();

      const handleY = topPlateY - 8;
      context.fillStyle = '#8a6030';
      context.fillRect(cx - 8, handleY - maxTravel * 0.35, 16, maxTravel * 0.35);
      context.beginPath();
      context.arc(cx, handleY - maxTravel * 0.35, 18, 0, Math.PI * 2);
      context.fillStyle = '#a07038';
      context.fill();
      context.strokeStyle = '#c49050';
      context.lineWidth = 2;
      context.stroke();

      context.fillStyle = 'rgba(245, 239, 230, 0.7)';
      context.font = `600 ${Math.max(10, w * 0.022)}px Nunito, sans-serif`;
      context.textAlign = 'center';
      context.fillText('Prensa de papas', cx, baseY + plateH + 22);
    },

    drawProgressBar(context, w, h, prog) {
      const barW = Math.min(w * 0.75, 340);
      const barH = 22;
      const x = (w - barW) / 2;
      const y = h * 0.84;

      context.fillStyle = 'rgba(26, 20, 16, 0.7)';
      CanvasUtils.roundRect(context, x - 4, y - 4, barW + 8, barH + 8, 12);
      context.fill();

      context.fillStyle = 'rgba(0, 0, 0, 0.4)';
      CanvasUtils.roundRect(context, x, y, barW, barH, 8);
      context.fill();

      const fillW = barW * (prog / 100);
      if (fillW > 0) {
        const grad = context.createLinearGradient(x, 0, x + fillW, 0);
        grad.addColorStop(0, '#c45c3a');
        grad.addColorStop(0.5, '#d4a03c');
        grad.addColorStop(1, '#e8c84a');
        context.fillStyle = grad;
        CanvasUtils.roundRect(context, x, y, fillW, barH, 8);
        context.fill();
      }

      context.fillStyle = '#f5efe6';
      context.font = `700 ${Math.max(11, w * 0.024)}px Nunito, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(`Progreso: ${Math.floor(prog)}%`, w / 2, y + barH / 2);
    },

    drawTimer(context, w, h, ms, urgent) {
      const seconds = Math.ceil(ms / 1000);
      const timerW = 90;
      const timerH = 40;
      const x = w / 2 - timerW / 2;
      const y = h * 0.1;

      context.fillStyle = urgent ? 'rgba(196, 92, 58, 0.85)' : 'rgba(26, 20, 16, 0.8)';
      CanvasUtils.roundRect(context, x, y, timerW, timerH, 10);
      context.fill();

      context.strokeStyle = urgent ? '#e07070' : 'rgba(212, 160, 60, 0.5)';
      context.lineWidth = 2;
      CanvasUtils.roundRect(context, x, y, timerW, timerH, 10);
      context.stroke();

      context.fillStyle = urgent ? '#ffe0e0' : '#f5efe6';
      context.font = `700 ${Math.max(16, w * 0.04)}px Nunito, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(`${seconds}s`, w / 2, y + timerH / 2);

      context.fillStyle = 'rgba(232, 213, 181, 0.6)';
      context.font = `600 ${Math.max(9, w * 0.02)}px Nunito, sans-serif`;
      context.fillText('Tiempo', w / 2, y - 8);
    },

    drawHint(context, w, h) {
      context.fillStyle = 'rgba(232, 213, 181, 0.55)';
      context.font = `600 ${Math.max(10, w * 0.022)}px Nunito, sans-serif`;
      context.textAlign = 'center';
      const isMobile = 'ontouchstart' in window;
      const hint = isMobile
        ? 'Toca la pantalla para prensar'
        : 'Presiona ESPACIO repetidamente';
      context.fillText(hint, w / 2, h * 0.93);
    },

    drawParticles(context) {
      particles.forEach((p) => {
        context.globalAlpha = p.life / p.maxLife;
        context.fillStyle = p.color;
        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
    },

  };

  function init(context, canvasWidth, canvasHeight, completeCallback, failCallback) {
    ctx = context;
    width = canvasWidth;
    height = canvasHeight;
    onComplete = completeCallback;
    onFail = failCallback;

    progress = 0;
    timeLeft = TIME_LIMIT_MS;
    compressAmount = 0;
    compressTarget = 0;
    finished = false;
    particles = [];

    AudioFX.init();

    UI.updateSceneHud(
      'Nivel 1: La Prensa de Papas',
      'Prensa las papas hasta el 100% antes de que acabe el tiempo',
      [{ ingredientId: 'papa', label: 'Base de papa', done: false }]
    );

    keyHandler = (e) => {
      if (e.code === 'Space' && !finished) {
        e.preventDefault();
        doPress();
      }
    };
    window.addEventListener('keydown', keyHandler);
  }

  function addBurstParticles() {
    const cx = width / 2;
    const cy = height * 0.5;
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 3 - 1,
        life: 400,
        maxLife: 400,
        color: '#e8c84a',
        size: 2 + Math.random() * 3,
      });
    }
  }

  function doPress() {
    if (finished) return;

    AudioFX.resume();
    progress = Math.min(100, progress + PROGRESS_PER_PRESS);
    compressTarget = COMPRESS_IMPULSE;
    addBurstParticles();
    AudioFX.press();

    UI.updateSceneHud(
      'Nivel 1: La Prensa de Papas',
      `Prensa las papas — ${Math.floor(progress)}% completado`,
      [{ ingredientId: 'papa', label: 'Base de papa', done: progress >= 100 }]
    );

    if (progress >= 100) {
      winLevel();
    }
  }

  function winLevel() {
    if (finished) return;
    finished = true;

    const timeBonus = Math.floor(timeLeft / 1000) * 5;
    UI.addScore(50 + timeBonus);
    UI.flashScore(50 + timeBonus);
    AudioFX.success();

    setTimeout(() => {
      if (onComplete) onComplete();
    }, 900);
  }

  function loseLevel() {
    if (finished) return;
    finished = true;
    AudioFX.fail();

    setTimeout(() => {
      if (onFail) onFail();
    }, 600);
  }

  /** @param {number} [_x] @param {number} [_y] */
  function handleClick(_x, _y) {
    doPress();
  }

  function update(delta) {
    if (finished) return;

    timeLeft -= delta;
    if (timeLeft <= 0) {
      timeLeft = 0;
      loseLevel();
      return;
    }

    compressTarget *= COMPRESS_DECAY;
    compressAmount += (compressTarget - compressAmount) * 0.35;

    particles = particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.life -= delta;
      return p.life > 0;
    });
  }

  function render() {
    PressRenderer.drawBackground(ctx, width, height);
    PressRenderer.drawPress(ctx, width, height, progress, compressAmount);
    PressRenderer.drawTimer(ctx, width, height, timeLeft, timeLeft <= 5000);
    PressRenderer.drawProgressBar(ctx, width, height, progress);
    PressRenderer.drawHint(ctx, width, height);
    PressRenderer.drawParticles(ctx);

    if (finished && progress >= 100) {
      ctx.fillStyle = 'rgba(212, 160, 60, 0.2)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#f0c96a';
      ctx.font = `700 ${Math.max(14, width * 0.035)}px Nunito, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('¡Base lista!', width / 2, height * 0.32);
    }
  }

  function destroy() {
    if (keyHandler) {
      window.removeEventListener('keydown', keyHandler);
      keyHandler = null;
    }
    particles = [];
    finished = true;
  }

  return {
    init,
    update,
    render,
    handleClick,
    destroy,
  };
})();
