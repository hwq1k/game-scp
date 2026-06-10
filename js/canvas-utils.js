/**
 * @file canvas-utils.js
 * @description Utilidades compartidas de Canvas: formas, límites y control de delta.
 */
const CanvasUtils = (() => {
  /** Evita saltos grandes al recuperar foco de la pestaña. */
  const MAX_DELTA_MS = 50;

  /**
   * Limita el delta del bucle de juego para estabilidad física.
   * @param {number} delta - Milisegundos desde el último frame.
   * @returns {number}
   */
  function capDelta(delta) {
    return Math.min(delta, MAX_DELTA_MS);
  }

  /**
   * Restringe un valor entre mínimo y máximo.
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Dibuja un rectángulo con esquinas redondeadas.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {number} r - Radio de las esquinas.
   */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /**
   * Perfil de viewport para ajustes responsive.
   * @returns {'mobile'|'tablet'|'desktop'}
   */
  function getViewportProfile() {
    const w = window.innerWidth;
    if (w <= 480) return 'mobile';
    if (w <= 1024) return 'tablet';
    return 'desktop';
  }

  /** @returns {boolean} */
  function isPortrait() {
    return window.innerHeight > window.innerWidth;
  }

  /** @returns {number} Ratio de píxeles del dispositivo. */
  function getDpr() {
    return window.devicePixelRatio || 1;
  }

  /**
   * Restablece la matriz de transformación a identidad.
   * Evita acumulación de translate/scale entre frames.
   * @param {CanvasRenderingContext2D} context
   */
  function resetCanvasTransform(context) {
    if (typeof context.resetTransform === 'function') {
      context.resetTransform();
    } else {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  /**
   * Aplica el escalado responsive (HiDPI) reemplazando la matriz actual.
   * Usa setTransform — nunca scale() en el bucle, porque scale() compone y acumula.
   * @param {CanvasRenderingContext2D} context
   * @returns {number} DPR aplicado
   */
  function applyResponsiveScale(context) {
    const dpr = getDpr();
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return dpr;
  }

  /**
   * Única fuente de verdad para dimensionar un canvas.
   *
   * - Mide el tamaño VISUAL real del elemento canvas (no el contenedor padre).
   * - NO modifica style.width / style.height (el CSS 100% controla el display).
   * - Sincroniza bitmap interno (canvas.width/height) con el tamaño visual × DPR.
   * - Solo reasigna bitmap si las dimensiones cambiaron.
   *
   * @param {HTMLCanvasElement} canvasEl
   * @param {CanvasRenderingContext2D} context
   * @returns {{ width: number, height: number, changed: boolean } | null}
   */
  function syncCanvasSize(canvasEl, context) {
    // Eliminar inline width/height heredados (causan doble escalado con CSS 100%).
    canvasEl.style.removeProperty('width');
    canvasEl.style.removeProperty('height');

    const rect = canvasEl.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;

    if (displayWidth < 1 || displayHeight < 1) return null;

    const dpr = getDpr();
    const bitmapWidth = Math.round(displayWidth * dpr);
    const bitmapHeight = Math.round(displayHeight * dpr);
    const changed =
      canvasEl.width !== bitmapWidth || canvasEl.height !== bitmapHeight;

    if (changed) {
      canvasEl.width = bitmapWidth;
      canvasEl.height = bitmapHeight;
    }

    applyResponsiveScale(context);

    return {
      width: displayWidth,
      height: displayHeight,
      changed,
    };
  }

  /**
   * Inicio de frame: reset → clearRect en identidad → escalado responsive.
   * Llamar al inicio de cada requestAnimationFrame antes de dibujar.
   * @param {CanvasRenderingContext2D} context
   * @param {HTMLCanvasElement} canvasEl
   */
  function beginFrame(context, canvasEl) {
    resetCanvasTransform(context);
    context.clearRect(0, 0, canvasEl.width, canvasEl.height);
    applyResponsiveScale(context);
  }

  /**
   * Actualiza partículas y devuelve solo las vivas.
   * @param {Array<{ x: number, y: number, vx: number, vy: number, life: number }>} particles
   * @param {number} delta
   * @param {number} [gravity=0.05]
   * @returns {typeof particles}
   */
  function updateParticles(particles, delta, gravity = 0.05) {
    return particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.life -= delta;
      return p.life > 0;
    });
  }

  /**
   * Dibuja un temporizador estilo badge (compartido entre escenas).
   * @param {CanvasRenderingContext2D} context
   * @param {{ x: number, y: number, ms: number, urgent?: boolean, label?: string, width?: number, height?: number }} opts
   */
  function drawTimerBadge(context, opts) {
    const timerW = opts.width ?? 90;
    const timerH = opts.height ?? 40;
    const urgent = opts.urgent ?? false;
    const label = opts.label ?? 'Tiempo';
    const seconds = Math.ceil(opts.ms / 1000);
    const cx = opts.x + timerW / 2;

    context.fillStyle = urgent ? 'rgba(196, 92, 58, 0.85)' : 'rgba(26, 20, 16, 0.8)';
    roundRect(context, opts.x, opts.y, timerW, timerH, 10);
    context.fill();

    context.strokeStyle = urgent ? '#e07070' : 'rgba(212, 160, 60, 0.5)';
    context.lineWidth = 2;
    roundRect(context, opts.x, opts.y, timerW, timerH, 10);
    context.stroke();

    context.fillStyle = urgent ? '#ffe0e0' : '#f5efe6';
    context.font = `700 ${Math.max(16, timerW * 0.18)}px Nunito, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`${seconds}s`, cx, opts.y + timerH / 2);

    context.fillStyle = 'rgba(232, 213, 181, 0.6)';
    context.font = `600 ${Math.max(9, timerW * 0.1)}px Nunito, sans-serif`;
    context.fillText(label, cx, opts.y - 8);
  }

  return {
    capDelta,
    clamp,
    roundRect,
    getViewportProfile,
    isPortrait,
    getDpr,
    resetCanvasTransform,
    applyResponsiveScale,
    syncCanvasSize,
    beginFrame,
    updateParticles,
    drawTimerBadge,
  };
})();

