/**
 * @file ui.js
 * @description Gestión de pantallas (menú, juego, ranking), modales, HUD y puntaje.
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
    leaderboardScreen: document.getElementById('screen-leaderboard'),
    modalCredits: document.getElementById('modal-credits'),
    leaderboardTableBody: document.getElementById('leaderboard-table-body'),
    leaderboardTableBodyLocal: document.getElementById('leaderboard-table-body-local'),
    recordsEmpty: document.getElementById('records-empty'),
    tabLeaderboardGlobal: document.getElementById('tab-leaderboard-global'),
    tabLeaderboardLocal: document.getElementById('tab-leaderboard-local'),
    panelLeaderboardGlobal: document.getElementById('panel-leaderboard-global'),
    panelLeaderboardLocal: document.getElementById('panel-leaderboard-local'),
    leaderboardLoading: document.getElementById('leaderboard-loading'),
    leaderboardOffline: document.getElementById('leaderboard-offline'),
    leaderboardError: document.getElementById('leaderboard-error'),
    leaderboardEmpty: document.getElementById('leaderboard-empty'),
    btnLeaderboardBack: document.getElementById('btn-leaderboard-back'),
    victoryLeaderboard: document.getElementById('victory-leaderboard'),
    victoryAuthHint: document.getElementById('victory-auth-hint'),
    btnGoogleSigninVictory: document.getElementById('btn-google-signin-victory'),
    victoryAuthSigned: document.getElementById('victory-auth-signed'),
    victoryAuthName: document.getElementById('victory-auth-name'),
    btnSubmitScore: document.getElementById('btn-submit-score'),
    submitScoreStatus: document.getElementById('submit-score-status'),
    btnGoogleSigninHome: document.getElementById('btn-google-signin-home'),
    btnGoogleSigninLeaderboard: document.getElementById('btn-google-signin-leaderboard'),
    authUserHome: document.getElementById('auth-user-home'),
    authUserLeaderboard: document.getElementById('auth-user-leaderboard'),
    authUserNameHome: document.getElementById('auth-user-name-home'),
    authUserNameLeaderboard: document.getElementById('auth-user-name-leaderboard'),
    authUserPhotoHome: document.getElementById('auth-user-photo-home'),
    authUserPhotoLeaderboard: document.getElementById('auth-user-photo-leaderboard'),
    btnSignoutHome: document.getElementById('btn-signout-home'),
    btnSignoutLeaderboard: document.getElementById('btn-signout-leaderboard'),
    btnStart: document.getElementById('btn-start'),
    btnRecords: document.getElementById('btn-records'),
    btnCredits: document.getElementById('btn-credits'),
    btnContinue: document.getElementById('btn-continue'),
    btnRetry: document.getElementById('btn-retry'),
    btnRestart: document.getElementById('btn-restart'),
  };

  let score = 0;
  let logosDrawn = false;
  let lastVictoryScore = 0;
  let leaderboardTab = 'global';

  const MEDALS = ['🥇', '🥈', '🥉'];

  /** @param {number} rank */
  function getRankLabel(rank) {
    return rank <= 3 ? MEDALS[rank - 1] : String(rank);
  }

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

  /**
   * @param {HTMLElement} bodyEl
   * @param {Array<{ rank: number, player: string, score: number, date: string, playerTitle?: string }>} rows
   */
  function renderLeaderboardTable(bodyEl, rows) {
    if (!bodyEl) return;
    bodyEl.replaceChildren();

    rows.forEach((row, index) => {
      const div = document.createElement('div');
      div.className = 'leaderboard-row';
      div.setAttribute('role', 'row');
      if (row.rank <= 3) div.classList.add(`leaderboard-row--top${row.rank}`);
      div.style.animationDelay = `${0.04 + index * 0.045}s`;

      const pos = document.createElement('span');
      pos.className = 'leaderboard-row__pos';
      pos.setAttribute('role', 'cell');
      pos.textContent = getRankLabel(row.rank);
      pos.setAttribute('aria-label', `Posición ${row.rank}`);

      const player = document.createElement('span');
      player.className = 'leaderboard-row__player';
      player.setAttribute('role', 'cell');
      player.textContent = row.player;
      if (row.playerTitle) player.title = row.playerTitle;

      const scoreCell = document.createElement('span');
      scoreCell.className = 'leaderboard-row__score';
      scoreCell.setAttribute('role', 'cell');
      scoreCell.textContent = String(row.score);

      const dateCell = document.createElement('span');
      dateCell.className = 'leaderboard-row__date';
      dateCell.setAttribute('role', 'cell');
      dateCell.textContent = row.date;

      div.append(pos, player, scoreCell, dateCell);
      bodyEl.appendChild(div);
    });
  }

  /** @param {HTMLElement | null} panelEl */
  function setPanelTableVisible(panelEl, visible) {
    panelEl?.querySelector('.leaderboard-table')?.classList.toggle('hidden', !visible);
  }

  /** @returns {Promise<boolean>} */
  async function ensureLeaderboardReady() {
    if (Leaderboard.isReady()) return true;
    return Leaderboard.init();
  }

  function setLeaderboardTab(tab) {
    leaderboardTab = tab;
    const isGlobal = tab === 'global';

    elements.tabLeaderboardGlobal?.classList.toggle('leaderboard-tab--active', isGlobal);
    elements.tabLeaderboardLocal?.classList.toggle('leaderboard-tab--active', !isGlobal);
    elements.tabLeaderboardGlobal?.setAttribute('aria-selected', String(isGlobal));
    elements.tabLeaderboardLocal?.setAttribute('aria-selected', String(!isGlobal));
    elements.panelLeaderboardGlobal?.classList.toggle('hidden', !isGlobal);
    elements.panelLeaderboardLocal?.classList.toggle('hidden', isGlobal);

    if (isGlobal) {
      loadGlobalLeaderboard();
    } else {
      renderLocalRecordsList();
    }
  }

  function renderLocalRecordsList() {
    const records = Storage.getRecords();
    const hasRecords = records.length > 0;

    elements.recordsEmpty.classList.toggle('hidden', hasRecords);
    setPanelTableVisible(elements.panelLeaderboardLocal, hasRecords);

    if (!hasRecords) {
      elements.leaderboardTableBodyLocal.replaceChildren();
      return;
    }

    const playerName = Storage.getPlayerName() || 'Tú';
    renderLeaderboardTable(
      elements.leaderboardTableBodyLocal,
      records.map((record, index) => ({
        rank: index + 1,
        player: playerName,
        score: record.score,
        date: formatRecordDate(record.date),
      }))
    );
  }

  function renderRecordsList() {
    setLeaderboardTab(leaderboardTab);
  }

  /**
   * @param {Array<{ name: string, score: number, timestamp: string }>} entries
   */
  function renderGlobalLeaderboard(entries) {
    const hasEntries = entries.length > 0;

    elements.leaderboardEmpty.classList.toggle('hidden', hasEntries);
    setPanelTableVisible(elements.panelLeaderboardGlobal, hasEntries);

    if (!hasEntries) {
      elements.leaderboardTableBody.replaceChildren();
      return;
    }

    renderLeaderboardTable(
      elements.leaderboardTableBody,
      entries.map((entry, index) => ({
        rank: index + 1,
        player: entry.name,
        playerTitle: entry.name,
        score: entry.score,
        date: formatRecordDate(entry.timestamp),
      }))
    );
  }

  async function loadGlobalLeaderboard() {
    elements.leaderboardLoading.classList.remove('hidden');
    elements.leaderboardOffline.classList.add('hidden');
    elements.leaderboardError.classList.add('hidden');
    setPanelTableVisible(elements.panelLeaderboardGlobal, false);
    elements.leaderboardEmpty.classList.add('hidden');

    const ready = await ensureLeaderboardReady();
    if (!ready) {
      elements.leaderboardLoading.classList.add('hidden');
      elements.leaderboardOffline.classList.remove('hidden');
      return;
    }

    try {
      const top = await Leaderboard.fetchTopScores();
      elements.leaderboardLoading.classList.add('hidden');
      renderGlobalLeaderboard(top);
    } catch (err) {
      elements.leaderboardLoading.classList.add('hidden');
      elements.leaderboardError.textContent = err.message || 'No se pudo cargar el ranking.';
      elements.leaderboardError.classList.remove('hidden');
    }
  }

  function resetSubmitScoreStatus() {
    if (!elements.submitScoreStatus) return;
    elements.submitScoreStatus.textContent = '';
    elements.submitScoreStatus.className = 'victory-leaderboard__status';
  }

  function setSubmitScoreStatus(message, type = 'ok') {
    if (!elements.submitScoreStatus) return;
    elements.submitScoreStatus.textContent = message;
    elements.submitScoreStatus.className = `victory-leaderboard__status victory-leaderboard__status--${type}`;
  }

  /** Paneles de sesión Google reutilizados (menú + ranking). */
  const AUTH_SLOTS = [
    {
      signIn: () => elements.btnGoogleSigninHome,
      panel: () => elements.authUserHome,
      name: () => elements.authUserNameHome,
      photo: () => elements.authUserPhotoHome,
    },
    {
      signIn: () => elements.btnGoogleSigninLeaderboard,
      panel: () => elements.authUserLeaderboard,
      name: () => elements.authUserNameLeaderboard,
      photo: () => elements.authUserPhotoLeaderboard,
    },
  ];

  function updateAuthPanels(user) {
    const signedIn = Boolean(user);
    const name = user?.displayName ?? '';
    const photo = user?.photoURL ?? '';

    AUTH_SLOTS.forEach(({ signIn, panel, name: nameEl, photo: photoEl }) => {
      signIn()?.classList.toggle('hidden', signedIn);
      panel()?.classList.toggle('hidden', !signedIn);
      const nameNode = nameEl();
      if (nameNode) nameNode.textContent = name;
      const photoNode = photoEl();
      if (photoNode) {
        photoNode.src = photo;
        photoNode.hidden = !photo;
      }
    });

    updateVictoryAuthUi(user);
  }

  /**
   * @param {firebase.User | null} user
   */
  function updateVictoryAuthUi(user) {
    const signedIn = Boolean(user);
    const ready = typeof Leaderboard !== 'undefined' && FirebaseConfig?.isConfigured();

    elements.victoryLeaderboard?.classList.toggle('hidden', !ready);
    elements.victoryAuthHint?.classList.toggle('hidden', signedIn);
    elements.btnGoogleSigninVictory?.classList.toggle('hidden', signedIn || !ready);
    elements.victoryAuthSigned?.classList.toggle('hidden', !signedIn);

    if (elements.victoryAuthName && user?.displayName) {
      elements.victoryAuthName.textContent = user.displayName;
    }
    if (elements.btnSubmitScore) {
      elements.btnSubmitScore.disabled = !signedIn;
    }
  }

  async function handleGoogleSignIn() {
    try {
      await FirebaseAuth.signInWithGoogle();
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') return;
      console.error('[Auth]', err);
      alert(err.message || 'No se pudo iniciar sesión con Google.');
    }
  }

  async function handleSignOut() {
    try {
      await FirebaseAuth.signOut();
    } catch (err) {
      console.error('[Auth]', err);
    }
  }

  async function handleSubmitScore() {
    if (!elements.btnSubmitScore) return;

    const pts = lastVictoryScore;
    elements.btnSubmitScore.disabled = true;
    resetSubmitScoreStatus();
    setSubmitScoreStatus('Enviando…', 'ok');

    try {
      const ready = await ensureLeaderboardReady();
      if (!ready) throw new Error('Firebase no configurado.');
      await Leaderboard.submitScore(undefined, pts);
      setSubmitScoreStatus('¡Puntaje enviado al ranking global!', 'ok');
    } catch (err) {
      setSubmitScoreStatus(err.message || 'Error al enviar el puntaje.', 'error');
      elements.btnSubmitScore.disabled = false;
    }
  }

  function setupLeaderboardUi() {
    elements.tabLeaderboardGlobal?.addEventListener('click', () => setLeaderboardTab('global'));
    elements.tabLeaderboardLocal?.addEventListener('click', () => setLeaderboardTab('local'));
    elements.btnSubmitScore?.addEventListener('click', handleSubmitScore);
    elements.btnGoogleSigninHome?.addEventListener('click', handleGoogleSignIn);
    elements.btnGoogleSigninLeaderboard?.addEventListener('click', handleGoogleSignIn);
    elements.btnGoogleSigninVictory?.addEventListener('click', handleGoogleSignIn);
    elements.btnSignoutHome?.addEventListener('click', handleSignOut);
    elements.btnSignoutLeaderboard?.addEventListener('click', handleSignOut);
    elements.btnLeaderboardBack?.addEventListener('click', hideLeaderboard);
  }

  async function setupFirebaseAuth() {
    if (!FirebaseConfig?.isConfigured()) return;

    const ready = await FirebaseCore.init();
    if (!ready) return;

    FirebaseAuth.watchAuth((user) => {
      updateAuthPanels(user);
    });
  }

  function getModal() {
    return elements.modalCredits;
  }

  function openModal(modalEl) {
    modalEl.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  function closeModals() {
    elements.modalCredits.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  function replayLeaderboardAnimation() {
    elements.leaderboardScreen?.querySelectorAll('.leaderboard-enter').forEach((el) => {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = '';
    });
  }

  function showLeaderboard() {
    elements.homeScreen.classList.add('hidden');
    elements.gameArea.classList.add('hidden');
    elements.leaderboardScreen.classList.remove('hidden');
    HomeBG.stop();
    closeModals();
    replayLeaderboardAnimation();
    renderRecordsList();
  }

  function hideLeaderboard() {
    showHome();
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
    elements.leaderboardScreen.classList.add('hidden');
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

  function formatTimeRemaining(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return `${seconds} s`;
  }

  function showVictory({ score: totalScore, timeRemainingMs = 0 }) {
    const stars = Storage.getStarsForScore(totalScore);
    Storage.addRecord(totalScore, stars);
    lastVictoryScore = totalScore;

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

    resetSubmitScoreStatus();
    updateVictoryAuthUi(FirebaseAuth.getCurrentUser());

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
      if (e.key !== 'Escape') return;
      if (!elements.leaderboardScreen.classList.contains('hidden')) {
        hideLeaderboard();
        return;
      }
      closeModals();
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
    setupLeaderboardUi,
    setupFirebaseAuth,
    loadGlobalLeaderboard,
    showHome,
    hideHome,
    showLeaderboard,
    hideLeaderboard,
    showTransition,
    showDefeat,
    showVictory,
    showGameplayUI,
    updateBestScoreDisplay,
    renderRecordsList,
    getModal,
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
  };
})();
