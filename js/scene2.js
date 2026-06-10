/**
 * @file scene2.js
 * @description Nivel 2 — Atrapa los Ingredientes. Recoge ingredientes correctos con la bandeja.
 */
const Scene2 = (() => {
  const CORRECT_INGREDIENTS = [
    { id: 'papa', label: 'Papa' },
    { id: 'limon', label: 'Limón' },
    { id: 'huevo', label: 'Huevo' },
    { id: 'aceituna', label: 'Aceituna' },
  ];

  const WRONG_INGREDIENTS = [
    { id: 'tomate', label: 'Tomate' },
    { id: 'hamburguesa', label: 'Hamburguesa' },
    { id: 'pizza', label: 'Pizza' },
    { id: 'gaseosa', label: 'Gaseosa' },
  ];

  const TIME_LIMIT_MS = 60000;
  const WIN_SCORE = 100;
  const DIFFICULTY_STEP_MS = 15000;
  const BASE_SPAWN_INTERVAL = 1100;
  const BASE_FALL_SPEED = 0.18;
  const TRAY_SPEED = 0.45;
  const MAX_FALL_SPEED = 0.34;
  const MIN_SPAWN_INTERVAL = 620;
  const MAX_ON_SCREEN_CAP = 12;

  let ctx = null;
  let width = 0;
  let height = 0;
  let onComplete = null;
  let onFail = null;

  let tray = { x: 0, y: 0, w: 0, h: 0 };
  let fallingItems = [];
  let caughtCounts = {};
  let levelScore = 0;
  let timeLeft = TIME_LIMIT_MS;
  let spawnTimer = 0;
  let finished = false;
  let keys = { left: false, right: false };
  let keyDownHandler = null;
  let keyUpHandler = null;
  let message = '';
  let messageTimer = 0;
  let flashColor = null;
  let flashTimer = 0;
  let particles = [];
  let difficultyTier = 0;
  let lastDifficultyTier = -1;
  let elapsedTime = 0;

  function init(context, canvasWidth, canvasHeight, completeCallback, failCallback) {
    ctx = context;
    width = canvasWidth;
    height = canvasHeight;
    onComplete = completeCallback;
    onFail = failCallback;

    const trayW = Math.min(width * 0.28, 130);
    const trayH = Math.min(height * 0.07, 36);
    tray = {
      x: width / 2 - trayW / 2,
      y: height * 0.82,
      w: trayW,
      h: trayH,
    };

    fallingItems = [];
    caughtCounts = {};
    CORRECT_INGREDIENTS.forEach((ing) => {
      caughtCounts[ing.id] = 0;
    });
    levelScore = 0;
    timeLeft = TIME_LIMIT_MS;
    spawnTimer = 0;
    finished = false;
    keys = { left: false, right: false };
    message = 'Usa ← → o desliza el dedo para mover la bandeja';
    messageTimer = 3500;
    flashColor = null;
    flashTimer = 0;
    particles = [];
    difficultyTier = 0;
    lastDifficultyTier = -1;
    elapsedTime = 0;

    updateHud();
    spawnWave();

    keyDownHandler = (e) => {
      if (finished) return;
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        keys.left = true;
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        keys.right = true;
      }
    };

    keyUpHandler = (e) => {
      if (e.code === 'ArrowLeft') keys.left = false;
      if (e.code === 'ArrowRight') keys.right = false;
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
  }

  function getDifficultyTier(elapsed) {
    return Math.min(3, Math.floor(elapsed / DIFFICULTY_STEP_MS));
  }

  function getFallSpeed(tier) {
    return Math.min(MAX_FALL_SPEED, BASE_FALL_SPEED * (1 + tier * 0.22));
  }

  function getSpawnInterval(tier) {
    return Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - tier * 160);
  }

  function getSpawnCount(tier) {
    return tier >= 2 ? 2 : 1;
  }

  function getMaxOnScreen(tier) {
    return Math.min(MAX_ON_SCREEN_CAP, 5 + tier * 2);
  }

  function getCorrectChance(tier) {
    return Math.min(0.6, 0.55 + tier * 0.015);
  }

  function pickIngredient() {
    const isCorrect = Math.random() < getCorrectChance(difficultyTier);
    const pool = isCorrect ? CORRECT_INGREDIENTS : WRONG_INGREDIENTS;
    const template = pool[Math.floor(Math.random() * pool.length)];
    const radius = Math.min(width, height) * 0.04;
    return {
      ...template,
      correct: isCorrect,
      x: radius + Math.random() * (width - radius * 2),
      y: -radius * 2,
      radius,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.004,
    };
  }

  function spawnItem() {
    if (fallingItems.length >= getMaxOnScreen(difficultyTier)) return;
    fallingItems.push(pickIngredient());
  }

  function spawnWave() {
    const count = getSpawnCount(difficultyTier);
    const maxOnScreen = getMaxOnScreen(difficultyTier);
    for (let i = 0; i < count && fallingItems.length < maxOnScreen; i++) {
      spawnItem();
    }
  }

  function onDifficultyIncrease(tier) {
    const labels = ['', 'Ritmo medio', 'Cocina acelerada', '¡Modo chef!'];
    showMessage(`¡${labels[tier] || 'Más intensidad'}!`, 1800);
    flashScreen('rgba(212, 160, 60, 0.15)', 350);
    updateHud();
  }

  function addCatchParticles(x, y) {
    const colors = ['#e8c84a', '#7ec87e', '#d4a03c', '#f0c96a', '#a8d878'];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 1.8 + Math.random() * 2.8;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life: 450 + Math.random() * 250,
        maxLife: 700,
        color: colors[i % colors.length],
        size: 2 + Math.random() * 3.5,
      });
    }
  }

  function updateHud() {
    const progressItems = CORRECT_INGREDIENTS.map((ing) => ({
      ingredientId: ing.id,
      label: `${ing.label} (${caughtCounts[ing.id]})`,
      done: caughtCounts[ing.id] > 0,
    }));

    const phaseLabel = difficultyTier > 0 ? ` · Fase ${difficultyTier + 1}/4` : '';

    UI.updateSceneHud(
      'Nivel 2: Atrapa los Ingredientes',
      `Meta: ${WIN_SCORE} pts · Nivel: ${levelScore} pts${phaseLabel}`,
      progressItems
    );
  }

  function showMessage(text, duration = 1500) {
    message = text;
    messageTimer = duration;
  }

  function flashScreen(color, duration = 200) {
    flashColor = color;
    flashTimer = duration;
  }

  function catchItem(item) {
    if (item.correct) {
      levelScore += 10;
      caughtCounts[item.id] = (caughtCounts[item.id] || 0) + 1;
      UI.addScore(10);
      UI.flashScore(10);
      showMessage(`¡${item.label}! +10`, 1000);
      flashScreen('rgba(126, 200, 126, 0.25)');
      addCatchParticles(item.x, tray.y + tray.h * 0.3);
      AudioFX.press();
    } else {
      levelScore = Math.max(0, levelScore - 5);
      UI.addScore(-5);
      UI.flashScore(-5);
      showMessage(`¡${item.label}! No va en la causa. -5`, 1200);
      flashScreen('rgba(224, 112, 112, 0.25)');
    }
    updateHud();
  }

  function checkCollisions() {
    fallingItems = fallingItems.filter((item) => {
      const onTray =
        item.y + item.radius >= tray.y &&
        item.y - item.radius <= tray.y + tray.h &&
        item.x >= tray.x - item.radius &&
        item.x <= tray.x + tray.w + item.radius;

      if (onTray) {
        catchItem(item);
        return false;
      }

      if (item.y - item.radius > height) {
        return false;
      }

      return true;
    });
  }

  function winLevel() {
    if (finished) return;
    finished = true;
    AudioFX.success();
    setTimeout(() => {
      if (onComplete) onComplete({ timeRemainingMs: timeLeft });
    }, 800);
  }

  function loseLevel() {
    if (finished) return;
    finished = true;
    AudioFX.fail();
    setTimeout(() => {
      if (onFail) onFail();
    }, 600);
  }

  function endLevel() {
    if (levelScore >= WIN_SCORE) {
      winLevel();
    } else {
      loseLevel();
    }
  }

  function handlePointerMove(canvasX) {
    if (finished) return;
    tray.x = CanvasUtils.clamp(canvasX - tray.w / 2, 8, width - tray.w - 8);
  }

  function update(delta) {
    if (finished) return;

    timeLeft -= delta;
    if (timeLeft <= 0) {
      timeLeft = 0;
      endLevel();
      return;
    }

    if (keys.left) tray.x -= TRAY_SPEED * delta;
    if (keys.right) tray.x += TRAY_SPEED * delta;
    tray.x = CanvasUtils.clamp(tray.x, 8, width - tray.w - 8);

    elapsedTime = TIME_LIMIT_MS - timeLeft;
    difficultyTier = getDifficultyTier(elapsedTime);

    if (difficultyTier > lastDifficultyTier) {
      lastDifficultyTier = difficultyTier;
      if (difficultyTier > 0) onDifficultyIncrease(difficultyTier);
    }

    const fallSpeed = getFallSpeed(difficultyTier);
    const spawnInterval = getSpawnInterval(difficultyTier);

    spawnTimer += delta;
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      spawnWave();
    }

    fallingItems.forEach((item) => {
      item.y += fallSpeed * delta;
      item.rotation += item.rotSpeed * delta;
    });

    checkCollisions();

    particles = particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.life -= delta;
      return p.life > 0;
    });

    if (messageTimer > 0) messageTimer -= delta;
    if (flashTimer > 0) flashTimer -= delta;
  }

  function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1a2838');
    grad.addColorStop(0.5, '#2a2218');
    grad.addColorStop(1, '#1a1410');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(232, 213, 181, 0.06)';
    ctx.font = `600 ${Math.max(11, width * 0.024)}px Nunito, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Cocina piurana — Ingredientes al vuelo', width / 2, 28);

    if (flashColor && flashTimer > 0) {
      ctx.fillStyle = flashColor;
      ctx.fillRect(0, 0, width, height);
    }
  }

  function drawTimer() {
    const seconds = Math.ceil(timeLeft / 1000);
    const urgent = timeLeft <= 10000;
    const timerW = 90;
    const timerH = 40;
    const x = width - timerW - 16;
    const y = height * 0.1;

    ctx.fillStyle = urgent ? 'rgba(196, 92, 58, 0.85)' : 'rgba(26, 20, 16, 0.8)';
    CanvasUtils.roundRect(ctx, x, y, timerW, timerH, 10);
    ctx.fill();

    ctx.strokeStyle = urgent ? '#e07070' : 'rgba(212, 160, 60, 0.5)';
    ctx.lineWidth = 2;
    CanvasUtils.roundRect(ctx, x, y, timerW, timerH, 10);
    ctx.stroke();

    ctx.fillStyle = urgent ? '#ffe0e0' : '#f5efe6';
    ctx.font = `700 ${Math.max(16, width * 0.04)}px Nunito, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${seconds}s`, x + timerW / 2, y + timerH / 2);

    ctx.fillStyle = 'rgba(232, 213, 181, 0.6)';
    ctx.font = `600 ${Math.max(9, width * 0.02)}px Nunito, sans-serif`;
    ctx.fillText('Tiempo', x + timerW / 2, y - 8);
  }

  function drawLevelScore() {
    const barW = Math.min(width * 0.55, 260);
    const barH = 18;
    const x = 16;
    const y = height * 0.1;
    const ratio = Math.min(1, levelScore / WIN_SCORE);

    ctx.fillStyle = 'rgba(26, 20, 16, 0.8)';
    CanvasUtils.roundRect(ctx, x - 4, y - 4, barW + 8, barH + 28, 10);
    ctx.fill();

    ctx.fillStyle = 'rgba(232, 213, 181, 0.6)';
    ctx.font = `600 ${Math.max(9, width * 0.02)}px Nunito, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`Nivel: ${levelScore} / ${WIN_SCORE}`, x, y + 6);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    CanvasUtils.roundRect(ctx, x, y + 12, barW, barH, 6);
    ctx.fill();

    if (ratio > 0) {
      const grad = ctx.createLinearGradient(x, 0, x + barW * ratio, 0);
      grad.addColorStop(0, '#5a7247');
      grad.addColorStop(1, '#d4a03c');
      ctx.fillStyle = grad;
      CanvasUtils.roundRect(ctx, x, y + 12, barW * ratio, barH, 6);
      ctx.fill();
    }
  }

  function drawCaughtIndicator() {
    const startX = 16;
    const startY = height * 0.2;
    const iconSize = Math.min(width * 0.08, 36);

    ctx.fillStyle = 'rgba(26, 20, 16, 0.65)';
    CanvasUtils.roundRect(ctx, startX - 6, startY - 6, iconSize * 4 + 30, iconSize + 20, 10);
    ctx.fill();

    ctx.fillStyle = 'rgba(232, 213, 181, 0.55)';
    ctx.font = `600 ${Math.max(8, width * 0.018)}px Nunito, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Atrapados:', startX, startY + 4);

    CORRECT_INGREDIENTS.forEach((ing, i) => {
      const cx = startX + i * (iconSize + 8);
      const cy = startY + 18;
      const count = caughtCounts[ing.id] || 0;

      ctx.fillStyle = count > 0 ? 'rgba(212, 160, 60, 0.25)' : 'rgba(0,0,0,0.25)';
      CanvasUtils.roundRect(ctx, cx, cy, iconSize, iconSize, 8);
      ctx.fill();

      Ingredients.draw(ctx, ing.id, cx + iconSize / 2, cy + iconSize / 2 - 2, iconSize * 0.85);

      ctx.fillStyle = count > 0 ? '#f0c96a' : '#b8a898';
      ctx.font = `700 ${Math.max(9, iconSize * 0.28)}px Nunito, sans-serif`;
      ctx.fillText(String(count), cx + iconSize / 2, cy + iconSize - 2);
    });
  }

  function drawParticles() {
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawDifficultyIndicator() {
    if (difficultyTier === 0) return;

    const dots = 3;
    const dotR = 4;
    const gap = 10;
    const totalW = dots * (dotR * 2) + (dots - 1) * gap;
    const startX = width / 2 - totalW / 2;
    const y = height * 0.065;

    for (let i = 0; i < dots; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * (dotR * 2 + gap) + dotR, y, dotR, 0, Math.PI * 2);
      ctx.fillStyle = i < difficultyTier ? '#f0c96a' : 'rgba(255,255,255,0.15)';
      ctx.fill();
    }
  }

  function drawFallingItems() {
    fallingItems.forEach((item) => {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);

      ctx.beginPath();
      ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
      ctx.strokeStyle = item.correct ? 'rgba(126, 200, 126, 0.6)' : 'rgba(224, 112, 112, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      Ingredients.draw(ctx, item.id, 0, 0, item.radius * 1.7);

      ctx.restore();
    });
  }

  function drawTray() {
    const { x, y, w, h } = tray;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 4, y + 4, w, h);

    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#a07038');
    grad.addColorStop(1, '#6a4828');
    ctx.fillStyle = grad;
    CanvasUtils.roundRect(ctx, x, y, w, h, 8);
    ctx.fill();

    ctx.strokeStyle = '#c49050';
    ctx.lineWidth = 2;
    CanvasUtils.roundRect(ctx, x, y, w, h, 8);
    ctx.stroke();

    ctx.fillStyle = 'rgba(245, 239, 230, 0.7)';
    ctx.font = `600 ${Math.max(9, w * 0.12)}px Nunito, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Bandeja', x + w / 2, y + h / 2);
  }

  function drawMessage() {
    if (messageTimer <= 0 || !message) return;

    ctx.font = `600 ${Math.max(10, width * 0.022)}px Nunito, sans-serif`;
    const msgW = ctx.measureText(message).width + 36;
    const msgH = 32;
    const mx = (width - msgW) / 2;
    const my = height * 0.42;

    ctx.fillStyle = 'rgba(26, 20, 16, 0.85)';
    CanvasUtils.roundRect(ctx, mx, my, msgW, msgH, 14);
    ctx.fill();

    ctx.fillStyle = '#f5efe6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, width / 2, my + msgH / 2);
  }

  function drawEndOverlay() {
    if (!finished) return;

    ctx.fillStyle = 'rgba(26, 20, 16, 0.55)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = levelScore >= WIN_SCORE ? '#f0c96a' : '#e07070';
    ctx.font = `700 ${Math.max(14, width * 0.035)}px Nunito, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = levelScore >= WIN_SCORE
      ? '¡Ingredientes listos!'
      : `Necesitas ${WIN_SCORE} pts`;
    ctx.fillText(text, width / 2, height * 0.45);
  }

  function render() {
    drawBackground();
    drawDifficultyIndicator();
    drawFallingItems();
    drawParticles();
    drawTray();
    drawTimer();
    drawLevelScore();
    drawCaughtIndicator();
    drawMessage();
    drawEndOverlay();
  }

  function destroy() {
    if (keyDownHandler) {
      window.removeEventListener('keydown', keyDownHandler);
      keyDownHandler = null;
    }
    if (keyUpHandler) {
      window.removeEventListener('keyup', keyUpHandler);
      keyUpHandler = null;
    }
    keys.left = false;
    keys.right = false;
    fallingItems = [];
    particles = [];
    finished = true;
  }

  return {
    init,
    update,
    render,
    handlePointerMove,
    destroy,
  };
})();
