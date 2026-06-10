/**
 * @file ingredients.js
 * @description Dibujo dinámico de ingredientes con formas geométricas (sin imágenes externas).
 */
const Ingredients = (() => {
  const DRAWERS = {
    papa: drawPotato,
    limon: drawLemon,
    huevo: drawEgg,
    aceituna: drawOlive,
    tomate: drawTomato,
    hamburguesa: drawBurger,
    pizza: drawPizza,
    gaseosa: drawSoda,
  };

  function drawPotato(ctx, x, y, size) {
    const s = size;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(0.2);

    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.42, s * 0.32, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e8c84a';
    ctx.fill();
    ctx.strokeStyle = '#c8a030';
    ctx.lineWidth = s * 0.04;
    ctx.stroke();

    const spots = [[-0.12, -0.08], [0.1, 0.05], [-0.05, 0.12], [0.15, -0.1]];
    ctx.fillStyle = '#b89028';
    spots.forEach(([ox, oy]) => {
      ctx.beginPath();
      ctx.arc(ox * s, oy * s, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawEgg(ctx, x, y, size) {
    const s = size;
    ctx.save();
    ctx.translate(x, y);

    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.28, s * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f5efe6';
    ctx.fill();
    ctx.strokeStyle = '#d8d0c0';
    ctx.lineWidth = s * 0.03;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(-s * 0.08, -s * 0.1, s * 0.08, s * 0.12, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fill();

    ctx.restore();
  }

  function drawLemon(ctx, x, y, size) {
    const s = size;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.3);

    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.38, s * 0.26, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e8d44a';
    ctx.fill();
    ctx.strokeStyle = '#c8b430';
    ctx.lineWidth = s * 0.03;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(s * 0.34, -s * 0.06);
    ctx.lineTo(s * 0.46, -s * 0.14);
    ctx.strokeStyle = '#c8b430';
    ctx.lineWidth = s * 0.04;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(s * 0.1, -s * 0.28, s * 0.1, s * 0.05, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#5a7247';
    ctx.fill();

    ctx.restore();
  }

  function drawOlive(ctx, x, y, size) {
    const s = size;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(0.4);

    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.22, s * 0.32, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3d5230';
    ctx.fill();
    ctx.strokeStyle = '#2a3820';
    ctx.lineWidth = s * 0.03;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(-s * 0.05, -s * 0.08, s * 0.06, s * 0.1, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(126, 160, 100, 0.5)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -s * 0.34, s * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = '#8a4040';
    ctx.fill();

    ctx.restore();
  }

  function drawTomato(ctx, x, y, size) {
    const s = size;
    ctx.save();
    ctx.translate(x, y);

    ctx.beginPath();
    ctx.arc(0, s * 0.04, s * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = '#c45c3a';
    ctx.fill();
    ctx.strokeStyle = '#a04028';
    ctx.lineWidth = s * 0.03;
    ctx.stroke();

    ctx.fillStyle = '#5a7247';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.22);
    ctx.lineTo(-s * 0.12, -s * 0.38);
    ctx.lineTo(-s * 0.04, -s * 0.28);
    ctx.lineTo(0, -s * 0.42);
    ctx.lineTo(s * 0.04, -s * 0.28);
    ctx.lineTo(s * 0.12, -s * 0.38);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-s * 0.1, 0, s * 0.06, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 180, 160, 0.4)';
    ctx.fill();

    ctx.restore();
  }

  function drawBurger(ctx, x, y, size) {
    const s = size;
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#d4a87a';
    CanvasUtils.roundRect(ctx, -s * 0.38, s * 0.12, s * 0.76, s * 0.14, s * 0.05);
    ctx.fill();
    ctx.strokeStyle = '#b08050';
    ctx.lineWidth = s * 0.02;
    ctx.stroke();

    ctx.fillStyle = '#5a7247';
    ctx.fillRect(-s * 0.36, s * 0.02, s * 0.72, s * 0.06);

    ctx.fillStyle = '#8a5030';
    CanvasUtils.roundRect(ctx, -s * 0.36, -s * 0.06, s * 0.72, s * 0.1, s * 0.03);
    ctx.fill();

    ctx.fillStyle = '#e8c84a';
    ctx.beginPath();
    ctx.arc(0, -s * 0.18, s * 0.38, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#c8a030';
    ctx.lineWidth = s * 0.02;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 220, 180, 0.5)';
    ctx.beginPath();
    ctx.arc(-s * 0.1, -s * 0.22, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.12, -s * 0.2, s * 0.03, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawPizza(ctx, x, y, size) {
    const s = size;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.6);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, s * 0.42, -0.6, 0.6);
    ctx.closePath();
    ctx.fillStyle = '#e8c84a';
    ctx.fill();
    ctx.strokeStyle = '#c8a030';
    ctx.lineWidth = s * 0.03;
    ctx.stroke();

    ctx.strokeStyle = '#c8a030';
    ctx.lineWidth = s * 0.02;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(s * 0.38 * Math.cos(-0.3), s * 0.38 * Math.sin(-0.3));
    ctx.moveTo(0, 0);
    ctx.lineTo(s * 0.38 * Math.cos(0.3), s * 0.38 * Math.sin(0.3));
    ctx.stroke();

    const pepperoni = [[0.18, 0.08], [0.22, -0.1], [0.1, -0.15], [0.28, 0.02]];
    pepperoni.forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px * s, py * s, s * 0.06, 0, Math.PI * 2);
      ctx.fillStyle = '#c45c3a';
      ctx.fill();
    });

    ctx.restore();
  }

  function drawSoda(ctx, x, y, size) {
    const s = size;
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(200, 220, 240, 0.5)';
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, -s * 0.1);
    ctx.lineTo(-s * 0.26, s * 0.32);
    ctx.lineTo(s * 0.26, s * 0.32);
    ctx.lineTo(s * 0.2, -s * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8aa8c0';
    ctx.lineWidth = s * 0.03;
    ctx.stroke();

    ctx.fillStyle = '#c45c3a';
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, s * 0.05);
    ctx.lineTo(-s * 0.24, s * 0.3);
    ctx.lineTo(s * 0.24, s * 0.3);
    ctx.lineTo(s * 0.18, s * 0.05);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#e07070';
    ctx.lineWidth = s * 0.04;
    ctx.beginPath();
    ctx.moveTo(s * 0.08, -s * 0.38);
    ctx.lineTo(s * 0.14, s * 0.1);
    ctx.stroke();

    ctx.fillStyle = '#f5efe6';
    ctx.fillRect(-s * 0.22, -s * 0.18, s * 0.44, s * 0.1);
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = s * 0.02;
    ctx.strokeRect(-s * 0.22, -s * 0.18, s * 0.44, s * 0.1);

    ctx.restore();
  }

  /**
   * Dibuja un ingrediente por su identificador.
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} id
   * @param {number} x
   * @param {number} y
   * @param {number} size
   */
  function draw(ctx, id, x, y, size) {
    const fn = DRAWERS[id];
    if (fn) fn(ctx, x, y, size);
  }

  return {
    drawPotato,
    drawEgg,
    drawLemon,
    drawOlive,
    drawTomato,
    drawBurger,
    drawPizza,
    drawSoda,
    draw,
  };
})();
