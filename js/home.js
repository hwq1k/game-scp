/**
 * @file home.js
 * @description Pantalla principal: fondo animado con ingredientes flotantes.
 */
const HomeBG = (() => {
  const INGREDIENT_IDS = ['papa', 'limon', 'aceituna', 'huevo'];
  const ITEM_COUNT = 16;

  let canvas = null;
  let ctx = null;
  let items = [];
  let running = false;
  let animId = null;
  let lastTime = 0;
  let width = 0;
  let height = 0;

  function createItem() {
    return {
      id: INGREDIENT_IDS[Math.floor(Math.random() * INGREDIENT_IDS.length)],
      x: Math.random() * width,
      y: Math.random() * height,
      size: 24 + Math.random() * 32,
      vy: -(0.012 + Math.random() * 0.022),
      vx: (Math.random() - 0.5) * 0.018,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.0008,
      opacity: 0.14 + Math.random() * 0.16,
    };
  }

  function initItems() {
    items = [];
    for (let i = 0; i < ITEM_COUNT; i++) {
      const item = createItem();
      item.y = Math.random() * height;
      items.push(item);
    }
  }

  function resize() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (items.length === 0) initItems();
  }

  function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#b80d1c');
    grad.addColorStop(0.45, '#D91023');
    grad.addColorStop(1, '#9a0b1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.beginPath();
    ctx.arc(width * 0.15, height * 0.2, width * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.75, width * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawItems() {
    items.forEach((item) => {
      ctx.save();
      ctx.globalAlpha = item.opacity;
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);
      Ingredients.draw(ctx, item.id, 0, 0, item.size);
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  function update(delta) {
    items.forEach((item) => {
      item.y += item.vy * delta;
      item.x += item.vx * delta;
      item.rotation += item.rotSpeed * delta;

      if (item.y < -item.size) {
        item.y = height + item.size;
        item.x = Math.random() * width;
      }
      if (item.x < -item.size) item.x = width + item.size;
      if (item.x > width + item.size) item.x = -item.size;
    });
  }

  function loop(timestamp) {
    if (!running) return;
    const delta = CanvasUtils.capDelta(lastTime ? timestamp - lastTime : 0);
    lastTime = timestamp;

    update(delta);
    drawBackground();
    drawItems();

    animId = requestAnimationFrame(loop);
  }

  function start() {
    if (!canvas) {
      canvas = document.getElementById('home-bg-canvas');
      ctx = canvas?.getContext('2d');
    }
    if (!ctx) return;

    resize();
    running = true;
    lastTime = 0;
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function onResize() {
    if (running) resize();
  }

  return { start, stop, onResize };
})();
