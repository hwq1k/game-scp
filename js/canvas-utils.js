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

  return { capDelta, clamp, roundRect };
})();
