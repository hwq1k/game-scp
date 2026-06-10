/**
 * @file game.js
 * @description Motor principal del juego: estados, escenas, bucle de renderizado e input.
 */
(() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas?.getContext('2d');
  const gameArea = document.getElementById('game-area');

  const STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    TRANSITION: 'transition',
    DEFEAT: 'defeat',
    VICTORY: 'victory',
  };

  const SCENES = [Scene1, Scene2];

  const FAIL_MESSAGES = [
    {
      title: '¡No alcanzaste a prensar!',
      text: 'Las papas necesitan más fuerza. Presiona ESPACIO (o toca la pantalla) más rápido antes de que se acabe el tiempo.',
    },
    {
      title: '¡No alcanzaste la meta!',
      text: 'Necesitas al menos 100 puntos atrapando ingredientes correctos (papa, limón, huevo, aceituna). Evita tomate, hamburguesa, pizza y gaseosa.',
    },
  ];

  let gameState = STATE.MENU;
  let currentSceneIndex = 0;
  let activeScene = null;
  let lastTimestamp = 0;
  let pendingSceneIndex = null;
  let logicalWidth = 0;
  let logicalHeight = 0;
  let resizeTimer = null;
  let hasRenderedFrame = false;

  /** @returns {boolean} */
  function isGameAreaVisible() {
    return gameArea && !gameArea.classList.contains('hidden');
  }

  /**
   * Sincroniza bitmap interno con el tamaño visual del canvas.
   * No se ejecuta en el game loop — solo en resize/orientación/ResizeObserver.
   */
  function resizeCanvas() {
    if (!isGameAreaVisible()) return;

    const prevW = logicalWidth;
    const prevH = logicalHeight;
    const size = CanvasUtils.syncCanvasSize(canvas, ctx);
    if (!size) return;

    logicalWidth = size.width;
    logicalHeight = size.height;

    if (
      activeScene &&
      gameState === STATE.PLAYING &&
      activeScene.onResize &&
      size.changed &&
      (prevW !== logicalWidth || prevH !== logicalHeight)
    ) {
      activeScene.onResize(logicalWidth, logicalHeight);
    }
  }

  /**
   * Garantiza que el canvas tenga tamaño válido tras mostrar el área de juego.
   * @param {() => void} callback
   */
  function whenCanvasReady(callback) {
    const attempt = () => {
      resizeCanvas();
      if (logicalWidth >= 1 && logicalHeight >= 1) {
        callback();
      } else {
        requestAnimationFrame(attempt);
      }
    };
    requestAnimationFrame(attempt);
  }

  /** Fondo de respaldo cuando el canvas aún no tiene escena activa. */
  function drawPlaceholder() {
    if (logicalWidth < 1 || logicalHeight < 1) return;

    CanvasUtils.beginFrame(ctx, canvas);
    const grad = ctx.createLinearGradient(0, 0, 0, logicalHeight);
    grad.addColorStop(0, '#5c3820');
    grad.addColorStop(0.5, '#3d2415');
    grad.addColorStop(1, '#1a0e08');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  }

  /** @param {Event} event */
  function getCanvasCoords(event) {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches?.[0] ?? event.changedTouches?.[0];

    return {
      x: (touch?.clientX ?? event.clientX) - rect.left,
      y: (touch?.clientY ?? event.clientY) - rect.top,
    };
  }

  /** @param {Event} event */
  function handlePointer(event) {
    if (gameState !== STATE.PLAYING || !activeScene) return;

    event.preventDefault();
    const coords = getCanvasCoords(event);

    if (activeScene.handlePointerMove) {
      activeScene.handlePointerMove(coords.x);
      return;
    }

    if (activeScene.handleClick) {
      activeScene.handleClick(coords.x, coords.y);
    }
  }

  /** Solo mueve la bandeja con arrastre táctil o clic sostenido. */
  function handlePointerDrag(event) {
    if (gameState !== STATE.PLAYING || !activeScene?.handlePointerMove) return;
    if (event.type === 'mousemove' && event.buttons !== 1) return;

    event.preventDefault();
    const coords = getCanvasCoords(event);
    activeScene.handlePointerMove(coords.x);
  }

  /** Muestra u oculta controles táctiles según escena activa. */
  function updateTouchControls() {
    TouchControls.update(gameState === STATE.PLAYING, currentSceneIndex);
  }

  function startScene(index) {
    if (logicalWidth < 1) resizeCanvas();

    currentSceneIndex = index;
    activeScene = SCENES[index];
    activeScene.init(ctx, logicalWidth, logicalHeight, onSceneComplete, onSceneFail);
    gameState = STATE.PLAYING;
    hasRenderedFrame = false;
    UI.showGameplayUI();
    updateTouchControls();
  }

  function onSceneFail() {
    gameState = STATE.DEFEAT;
    if (activeScene) {
      activeScene.destroy();
      activeScene = null;
    }
    TouchControls.hide();

    const msg = FAIL_MESSAGES[currentSceneIndex] ?? FAIL_MESSAGES[1];
    UI.showDefeat(msg.title, msg.text);
  }

  function retryCurrentScene() {
    whenCanvasReady(() => startScene(currentSceneIndex));
  }

  /**
   * @param {{ timeRemainingMs?: number }} [sceneStats]
   */
  function onSceneComplete(sceneStats) {
    if (activeScene) {
      activeScene.destroy();
      activeScene = null;
    }

    if (currentSceneIndex < SCENES.length - 1) {
      gameState = STATE.TRANSITION;
      pendingSceneIndex = currentSceneIndex + 1;
      TouchControls.hide();
      UI.showTransition('¡Las papas están listas!', null, UI.getScore());
      return;
    }

    endGame(sceneStats);
  }

  function continueToNextScene() {
    if (pendingSceneIndex === null) return;
    const next = pendingSceneIndex;
    pendingSceneIndex = null;
    whenCanvasReady(() => startScene(next));
  }

  /** @param {{ timeRemainingMs?: number }} [sceneStats] */
  function endGame(sceneStats = {}) {
    gameState = STATE.VICTORY;
    TouchControls.hide();
    UI.showVictory({
      score: UI.getScore(),
      timeRemainingMs: sceneStats.timeRemainingMs ?? 0,
    });
  }

  function startGame() {
    UI.resetScore();
    currentSceneIndex = 0;
    pendingSceneIndex = null;
    startScene(0);
  }

  function beginPlay() {
    UI.hideHome();
    whenCanvasReady(startGame);
  }

  function restartGame() {
    if (activeScene) {
      activeScene.destroy();
      activeScene = null;
    }
    gameState = STATE.MENU;
    hasRenderedFrame = false;
    UI.showHome();
  }

  /**
   * Bucle principal (requestAnimationFrame).
   * Crítico: cada frame reinicia la matriz del canvas antes de dibujar.
   * No usar ctx.scale() aquí — compone sobre el frame anterior y desplaza/acelera el contenido en X.
   * @param {number} timestamp
   */
  function gameLoop(timestamp) {
    const playing = gameState === STATE.PLAYING && activeScene && logicalWidth > 0 && ctx;
    const showPlaceholder =
      isGameAreaVisible() && logicalWidth > 0 && !hasRenderedFrame && !playing && ctx;

    if (playing || showPlaceholder) {
      const delta = CanvasUtils.capDelta(lastTimestamp ? timestamp - lastTimestamp : 0);
      lastTimestamp = timestamp;

      if (playing) {
        activeScene.update(delta);
        // 1. Reset matriz → 2. clearRect en identidad → 3. escalado responsive (setTransform)
        CanvasUtils.beginFrame(ctx, canvas);
        ctx.save();
        activeScene.render();
        ctx.restore();
        hasRenderedFrame = true;
      } else {
        drawPlaceholder();
      }
    }

    requestAnimationFrame(gameLoop);
  }

  function scheduleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      TouchControls.updateBodyClass();
      resizeCanvas();
      HomeBG.onResize();
    }, 100);
  }

  function init() {
    if (!canvas || !ctx) {
      console.error('[game] Canvas no disponible.');
      return;
    }

    TouchControls.init({
      onPress: () => activeScene?.triggerPress?.(),
      onMoveLeft: (active) => activeScene?.setMoveLeft?.(active),
      onMoveRight: (active) => activeScene?.setMoveRight?.(active),
    });

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => scheduleResize());
      ro.observe(canvas);
    }

    window.addEventListener('resize', scheduleResize);
    window.addEventListener('orientationchange', scheduleResize);

    canvas.addEventListener('click', handlePointer);
    canvas.addEventListener('touchstart', handlePointer, { passive: false });
    canvas.addEventListener('touchmove', handlePointerDrag, { passive: false });
    canvas.addEventListener('mousemove', handlePointerDrag);

    UI.initModals();
    UI.setupLeaderboardUi();
    UI.setupFirebaseAuth();
    UI.initLogos();
    UI.updateBestScoreDisplay();

    UI.onStart(beginPlay);
    UI.onRecords(() => UI.showLeaderboard());
    UI.onCredits(() => UI.openModal(UI.getModal()));
    UI.onContinue(continueToNextScene);
    UI.onRetry(retryCurrentScene);
    UI.onRestart(restartGame);

    UI.showHome();
    lastTimestamp = 0;
    requestAnimationFrame(gameLoop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
