/**
 * @file game.js
 * @description Motor principal del juego: estados, escenas, bucle de renderizado e input.
 */
(() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

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

  /**
   * Ajusta el canvas al contenedor y reinicia la escena activa si es necesario.
   */
  function resizeCanvas() {
    const wrapper = canvas.parentElement;
    const rect = wrapper.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    logicalWidth = rect.width;
    logicalHeight = rect.height;

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (activeScene && gameState === STATE.PLAYING) {
      activeScene.destroy();
      activeScene.init(ctx, logicalWidth, logicalHeight, onSceneComplete, onSceneFail);
    }
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

  /** @param {number} index */
  function startScene(index) {
    currentSceneIndex = index;
    activeScene = SCENES[index];
    activeScene.init(ctx, logicalWidth, logicalHeight, onSceneComplete, onSceneFail);
    gameState = STATE.PLAYING;
    UI.showGameplayUI();
  }

  function onSceneFail() {
    gameState = STATE.DEFEAT;
    if (activeScene) {
      activeScene.destroy();
      activeScene = null;
    }

    const msg = FAIL_MESSAGES[currentSceneIndex] ?? FAIL_MESSAGES[1];
    UI.showDefeat(msg.title, msg.text);
  }

  function retryCurrentScene() {
    startScene(currentSceneIndex);
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
      UI.showTransition('¡Las papas están listas!', null, UI.getScore());
      return;
    }

    endGame(sceneStats);
  }

  function continueToNextScene() {
    if (pendingSceneIndex !== null) {
      startScene(pendingSceneIndex);
      pendingSceneIndex = null;
    }
  }

  /** @param {{ timeRemainingMs?: number }} [sceneStats] */
  function endGame(sceneStats = {}) {
    gameState = STATE.VICTORY;
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

  function restartGame() {
    if (activeScene) {
      activeScene.destroy();
      activeScene = null;
    }
    gameState = STATE.MENU;
    UI.showHome();
  }

  /** @param {number} timestamp */
  function gameLoop(timestamp) {
    const delta = CanvasUtils.capDelta(lastTimestamp ? timestamp - lastTimestamp : 0);
    lastTimestamp = timestamp;

    if (gameState === STATE.PLAYING && activeScene) {
      activeScene.update(delta);
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);
      activeScene.render();
    }

    requestAnimationFrame(gameLoop);
  }

  function scheduleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      HomeBG.onResize();
    }, 100);
  }

  function init() {
    resizeCanvas();
    window.addEventListener('resize', scheduleResize);

    canvas.addEventListener('click', handlePointer);
    canvas.addEventListener('touchstart', handlePointer, { passive: false });
    canvas.addEventListener('touchmove', handlePointerDrag, { passive: false });
    canvas.addEventListener('mousemove', handlePointerDrag);

    UI.initModals();
    UI.initLogos();
    UI.updateBestScoreDisplay();

    UI.onStart(() => {
      UI.hideHome();
      startGame();
    });

    UI.onRecords(() => {
      UI.renderRecordsList();
      UI.openModal(document.getElementById('modal-records'));
    });

    UI.onCredits(() => {
      UI.openModal(document.getElementById('modal-credits'));
    });

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
