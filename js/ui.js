/**
 * @file ui.js
 * @description Gestión de pantallas, menú principal, modales, puntaje y HUD.
 */
const UI = (() => {
  const screens = {
    transition: document.getElementById('screen-transition'),
    defeat: document.getElementById('screen-defeat'),
    victory: document.getElementById('screen-victory'),
  };

  const elements = {
    homeScreen: document.getElementById('screen-home'),
    gameArea: document.getElementById('game-area'),
    homeBestScore: document.getElementById('home-best-score'),
    scoreDisplay: document.getElementById('score-display'),
    scoreValue: document.getElementById('score-value'),
    finalScore: document.getElementById('final-score'),
    finalTime: document.getElementById('final-time'),
    victoryStars: document.getElementById('victory-stars'),
    transitionTitle: document.getElementById('transition-title'),
    transitionText: document.getElementById('transition-text'),
    transitionScore: document.getElementById('transition-score'),
    defeatTitle: document.getElementById('defeat-title'),
    defeatText: document.getElementById('defeat-text'),
    sceneHud: document.getElementById('scene-hud'),
    sceneName: document.getElementById('scene-name'),
    sceneObjective: document.getElementById('scene-objective'),
    sceneProgress: document.getElementById('scene-progress'),
    modalRecords: document.getElementById('modal-records'),
    modalCredits: document.getElementById('modal-credits'),
    recordsList: document.getElementById('records-list'),
    recordsEmpty: document.getElementById('records-empty'),
    btnStart: document.getElementById('btn-start'),
    btnRecords: document.getElementById('btn-records'),
    btnCredits: document.getElementById('btn-credits'),
    btnContinue: document.getElementById('btn-continue'),
    btnRetry: document.getElementById('btn-retry'),
    btnRestart: document.getElementById('btn-restart'),
  };

  let score = 0;
  let logosDrawn = false;

  function hideOverlayScreens() {
    Object.values(screens).forEach((el) => el.classList.add('hidden'));
  }

  function revealScreen(screenEl) {
    hideOverlayScreens();
    screenEl.classList.remove('hidden');
    const content = screenEl.querySelector('.overlay-content');
    if (content) {
      content.style.animation = 'none';
      content.offsetHeight;
      content.style.animation = '';
    }
  }

  function updateBestScoreDisplay() {
    elements.homeBestScore.textContent = Storage.getBestScore();
  }

  function formatRecordDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  }

  function renderRecordsList() {
    const records = Storage.getRecords();
    elements.recordsList.replaceChildren();
    elements.recordsEmpty.classList.toggle('hidden', records.length > 0);

    records.forEach((record, index) => {
      const li = document.createElement('li');
      li.className = 'records-list__item';
      li.innerHTML = `
        <span class="records-list__rank">${index + 1}</span>
        <span class="records-list__score">${record.score} pts</span>
        <span class="records-list__stars">${'★'.repeat(record.stars)}${'☆'.repeat(3 - record.stars)}</span>
        <span class="records-list__date">${formatRecordDate(record.date)}</span>
      `;
      elements.recordsList.appendChild(li);
    });
  }

  function openModal(modalEl) {
    modalEl.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  function closeModals() {
    elements.modalRecords.classList.add('hidden');
    elements.modalCredits.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  function initLogos() {
    if (logosDrawn) return;
    document.querySelectorAll('.logo-canvas').forEach((canvas) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const size = canvas.width;
      ctx.clearRect(0, 0, size, size);
      Ingredients.drawPotato(ctx, size / 2, size / 2, size * 0.88);
    });
    logosDrawn = true;
  }

  function showHome() {
    elements.gameArea.classList.add('hidden');
    elements.homeScreen.classList.remove('hidden');
    updateBestScoreDisplay();
    HomeBG.start();
    closeModals();

    elements.homeScreen.querySelectorAll('.home-animate').forEach((el) => {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = '';
    });
  }

  function hideHome() {
    elements.homeScreen.classList.add('hidden');
    elements.gameArea.classList.remove('hidden');
    HomeBG.stop();
    closeModals();
  }

  function showTransition(title, text, scoreValue) {
    elements.transitionTitle.textContent = title;
    elements.transitionScore.textContent = scoreValue ?? 0;

    if (text) {
      elements.transitionText.textContent = text;
      elements.transitionText.classList.remove('hidden');
    } else {
      elements.transitionText.classList.add('hidden');
    }

    elements.scoreDisplay.classList.remove('hidden');
    elements.sceneHud.classList.add('hidden');
    revealScreen(screens.transition);
  }

  function showDefeat(title, text) {
    elements.defeatTitle.textContent = title;
    elements.defeatText.textContent = text;
    elements.sceneHud.classList.add('hidden');
    revealScreen(screens.defeat);
  }

  function getStarCount(totalScore) {
    if (totalScore >= 150) return 3;
    if (totalScore >= 120) return 2;
    if (totalScore >= 100) return 1;
    return 0;
  }

  function formatTimeRemaining(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return `${seconds} s`;
  }

  function showVictory({ score: totalScore, timeRemainingMs = 0 }) {
    const stars = getStarCount(totalScore);
    Storage.addRecord(totalScore, stars);

    elements.finalScore.textContent = totalScore;
    elements.finalTime.textContent = formatTimeRemaining(timeRemainingMs);

    elements.victoryStars.querySelectorAll('.star').forEach((star, index) => {
      star.classList.toggle('active', index < stars);
    });
    elements.victoryStars.setAttribute(
      'aria-label',
      `Estrellas de desempeño: ${stars} de 3`
    );

    elements.sceneHud.classList.add('hidden');
    revealScreen(screens.victory);
  }

  function showGameplayUI() {
    hideOverlayScreens();
    elements.scoreDisplay.classList.remove('hidden');
    elements.sceneHud.classList.remove('hidden');
  }

  function setScore(value) {
    score = Math.max(0, value);
    elements.scoreValue.textContent = score;
  }

  function addScore(points) {
    setScore(score + points);
    return score;
  }

  function getScore() {
    return score;
  }

  function resetScore() {
    setScore(0);
  }

  function updateSceneHud(name, objective, progressItems) {
    elements.sceneName.textContent = name;
    elements.sceneObjective.textContent = objective;
    elements.sceneProgress.replaceChildren();

    progressItems.forEach((item) => {
      const chip = document.createElement('span');
      chip.className = 'progress-chip' + (item.done ? ' done' : '');

      if (item.ingredientId) {
        const chipCanvas = document.createElement('canvas');
        chipCanvas.className = 'chip-canvas';
        chipCanvas.width = 24;
        chipCanvas.height = 24;
        Ingredients.draw(chipCanvas.getContext('2d'), item.ingredientId, 12, 12, 20);
        chip.appendChild(chipCanvas);
      } else if (item.icon) {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'chip-icon';
        iconSpan.textContent = item.icon;
        chip.appendChild(iconSpan);
      }

      const labelSpan = document.createElement('span');
      labelSpan.textContent = item.label;
      chip.appendChild(labelSpan);
      elements.sceneProgress.appendChild(chip);
    });
  }

  function onStart(callback) {
    elements.btnStart.addEventListener('click', callback);
  }

  function onRecords(callback) {
    elements.btnRecords.addEventListener('click', callback);
  }

  function onCredits(callback) {
    elements.btnCredits.addEventListener('click', callback);
  }

  function onContinue(callback) {
    elements.btnContinue.addEventListener('click', callback);
  }

  function onRetry(callback) {
    elements.btnRetry.addEventListener('click', callback);
  }

  function onRestart(callback) {
    elements.btnRestart.addEventListener('click', callback);
  }

  function initModals() {
    document.querySelectorAll('[data-close-modal]').forEach((el) => {
      el.addEventListener('click', closeModals);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModals();
    });
  }

  function flashScore(points) {
    const el = elements.scoreValue;
    const badge = elements.scoreDisplay;
    el.style.transform = 'scale(1.25)';
    el.style.color = points > 0 ? '#558b2f' : '#b83d18';
    badge.style.transform = 'scale(1.08)';
    setTimeout(() => {
      el.style.transform = '';
      el.style.color = '';
      badge.style.transform = '';
    }, 300);
  }

  return {
    initLogos,
    initModals,
    showHome,
    hideHome,
    showTransition,
    showDefeat,
    showVictory,
    showGameplayUI,
    updateBestScoreDisplay,
    renderRecordsList,
    openModal,
    closeModals,
    setScore,
    addScore,
    getScore,
    resetScore,
    updateSceneHud,
    onStart,
    onRecords,
    onCredits,
    onContinue,
    onRetry,
    onRestart,
    flashScore,
    getStarCount,
  };
})();
