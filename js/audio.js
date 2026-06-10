/**
 * @file audio.js
 * @description Efectos de sonido opcionales con Web Audio API (sin archivos externos).
 */
const AudioFX = (() => {
  let ctx = null;
  let enabled = true;

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      enabled = false;
    }
  }

  function resume() {
    if (!ctx) init();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function playTone(freq, duration, type = 'sine', volume = 0.08) {
    if (!enabled || !ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  function playNoise(duration, volume = 0.06) {
    if (!enabled || !ctx) return;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  function press() {
    resume();
    playNoise(0.08, 0.1);
    playTone(120, 0.06, 'square', 0.04);
  }

  function success() {
    resume();
    playTone(523, 0.15, 'sine', 0.07);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.07), 100);
    setTimeout(() => playTone(784, 0.25, 'sine', 0.08), 200);
  }

  function fail() {
    resume();
    playTone(180, 0.35, 'sawtooth', 0.06);
    setTimeout(() => playTone(140, 0.4, 'sawtooth', 0.05), 150);
  }

  function setEnabled(value) {
    enabled = value;
  }

  return { init, resume, press, success, fail, setEnabled };
})();
