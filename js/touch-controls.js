/**
 * @file touch-controls.js
 * @description Controles táctiles en pantalla para móvil y tablet.
 */
const TouchControls = (() => {
  const root = document.getElementById('touch-controls');
  const scene1Panel = document.getElementById('touch-scene1');
  const scene2Panel = document.getElementById('touch-scene2');
  const btnPress = document.getElementById('touch-press');
  const btnLeft = document.getElementById('touch-left');
  const btnRight = document.getElementById('touch-right');

  let onPress = null;
  let onMoveLeft = null;
  let onMoveRight = null;

  /** @returns {boolean} */
  function shouldShow() {
    const narrow = window.matchMedia('(max-width: 1024px)').matches;
    const touchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    return narrow || touchLike;
  }

  function updateBodyClass() {
    document.body.classList.toggle('has-touch-ui', shouldShow());
    document.body.classList.toggle(
      'is-portrait',
      window.innerHeight > window.innerWidth
    );
  }

  function bindHold(button, onDown, onUp) {
    if (!button) return;

    const start = (e) => {
      e.preventDefault();
      button.classList.add('is-active');
      onDown();
    };
    const end = (e) => {
      e.preventDefault();
      button.classList.remove('is-active');
      onUp();
    };

    button.addEventListener('touchstart', start, { passive: false });
    button.addEventListener('touchend', end, { passive: false });
    button.addEventListener('touchcancel', end, { passive: false });
    button.addEventListener('mousedown', start);
    button.addEventListener('mouseup', end);
    button.addEventListener('mouseleave', end);
  }

  /**
   * @param {{ onPress?: () => void, onMoveLeft?: (active: boolean) => void, onMoveRight?: (active: boolean) => void }} handlers
   */
  function init(handlers) {
    onPress = handlers.onPress ?? null;
    onMoveLeft = handlers.onMoveLeft ?? null;
    onMoveRight = handlers.onMoveRight ?? null;

    btnPress?.addEventListener('click', (e) => {
      e.preventDefault();
      onPress?.();
    });

    bindHold(btnLeft, () => onMoveLeft?.(true), () => onMoveLeft?.(false));
    bindHold(btnRight, () => onMoveRight?.(true), () => onMoveRight?.(false));

    window.addEventListener('resize', updateBodyClass);
    window.addEventListener('orientationchange', updateBodyClass);
    updateBodyClass();
  }

  /**
   * @param {boolean} playing
   * @param {number} sceneIndex
   */
  function update(playing, sceneIndex) {
    const show = playing && shouldShow();
    if (!root) return;

    root.classList.toggle('hidden', !show);
    if (!show) return;

    scene1Panel?.classList.toggle('hidden', sceneIndex !== 0);
    scene2Panel?.classList.toggle('hidden', sceneIndex !== 1);
  }

  function hide() {
    root?.classList.add('hidden');
    btnLeft?.classList.remove('is-active');
    btnRight?.classList.remove('is-active');
    onMoveLeft?.(false);
    onMoveRight?.(false);
  }

  return { init, update, hide, shouldShow, updateBodyClass };
})();
