
// ============================================================================
//  CORE: utilities, RNG, input, procedural audio
// ============================================================================
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const rndi = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const wpick = arr => { // weighted pick: [{w, ...}]
  let t = 0; for (const a of arr) t += a.w;
  let r = Math.random() * t;
  for (const a of arr) { r -= a.w; if (r <= 0) return a; }
  return arr[arr.length - 1];
};
const fmtRub = n => Math.round(n).toLocaleString('en-US') + ' ₽';
const fmtTime = s => { s = Math.max(0, Math.ceil(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const _tmpV = [V3(), V3(), V3(), V3(), V3(), V3()];

// ---------------------------------------------------------------- input
const Input = {
  keys: {}, pressed: {}, mouse: { dx: 0, dy: 0, l: false, r: false, lPressed: false, wheel: 0 },
  locked: false, wantLock: false,
  init(canvas) {
    window.addEventListener('keydown', e => {
      if (e.code === 'Tab' || e.code === 'Space' || (e.code.startsWith('Digit'))) e.preventDefault();
      if (!this.keys[e.code]) this.pressed[e.code] = true;
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });
    window.addEventListener('blur', () => { this.keys = {}; this.mouse.l = this.mouse.r = false; });
    canvas.addEventListener('mousedown', e => {
      if (!this.locked) { if (this.wantLock) this.requestLock(canvas); return; }
      if (e.button === 0) { this.mouse.l = true; this.mouse.lPressed = true; }
      if (e.button === 2) this.mouse.r = true;
    });
    window.addEventListener('mouseup', e => { if (e.button === 0) this.mouse.l = false; if (e.button === 2) this.mouse.r = false; });
    window.addEventListener('mousemove', e => { if (this.locked) { this.mouse.dx += e.movementX; this.mouse.dy += e.movementY; } });
    window.addEventListener('wheel', e => { if (this.locked) this.mouse.wheel += Math.sign(e.deltaY); }, { passive: true });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === canvas; if (!this.locked) { this.mouse.l = this.mouse.r = false; } });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  },
  lock(canvas) { this.wantLock = true; if (!this.locked) this.requestLock(canvas); },
  requestLock(canvas) { try { const p = canvas.requestPointerLock({ unadjustedMovement: true }); if (p && p.catch) p.catch(() => { try { canvas.requestPointerLock(); } catch (e) { } }); } catch (e) { try { canvas.requestPointerLock(); } catch (e2) { } } },
  unlock() { this.wantLock = false; if (document.pointerLockElement) document.exitPointerLock(); },
  endFrame() { this.pressed = {}; this.mouse.dx = this.mouse.dy = 0; this.mouse.lPressed = false; this.mouse.wheel = 0; },
  key(c) { return !!this.keys[c]; },
  hit(c) { return !!this.pressed[c]; },
};

// ---------------------------------------------------------------- audio
// Everything is synthesized: noise bursts, filtered oscillators, envelopes.
const Audio = {
  ctx: null, master: null, listener: { pos: V3(), yaw: 0 }, noiseBuf: null, ambient: null,
  init() {
    if (this.ctx) return;
    const C = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = C.createGain(); this.master.gain.value = 0.7; this.master.connect(C.destination);
    this.comp = C.createDynamicsCompressor(); this.comp.threshold.value = -12; this.comp.ratio.value = 6; this.comp.connect(this.master);
    const len = C.sampleRate * 2, buf = C.createBuffer(1, len, C.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  // spatialize: returns gain node connected to output, attenuated + panned relative to listener
  out(pos, ref = 15, maxD = 200, rolloff = 1.4) {
    const C = this.ctx, g = C.createGain();
    if (!pos) { g.connect(this.comp); return g; }
    const L = this.listener, dx = pos.x - L.pos.x, dz = pos.z - L.pos.z, dist = Math.hypot(dx, pos.y - L.pos.y, dz);
    if (dist > maxD) { g.gain.value = 0; return g; }
    g.gain.value = clamp(Math.pow(ref / Math.max(dist, ref), rolloff), 0, 1);
    // pan: angle relative to listener facing direction (yaw: 0 = -z)
    const fx = -Math.sin(L.yaw), fz = -Math.cos(L.yaw), rx = -fz, rz = fx;
    const dn = dist > 0.01 ? 1 / dist : 0, pan = clamp((dx * rx + dz * rz) * dn, -1, 1);
    const p = C.createStereoPanner(); p.pan.value = pan * 0.8;
    // simple distance low-pass
    const f = C.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = clamp(18000 - dist * 70, 900, 18000);
    g.connect(f); f.connect(p); p.connect(this.comp);
    return g;
  },
  noise(dst, dur, vol, { type = 'bandpass', freq = 1000, q = 1, decay = dur, attack = 0.002, sweep } = {}) {
    const C = this.ctx, t = C.currentTime, s = C.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = C.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    const g = C.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    s.connect(f); f.connect(g); g.connect(dst); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  },
  tone(dst, freq, dur, vol, { type = 'sine', to, attack = 0.002 } = {}) {
    const C = this.ctx, t = C.currentTime, o = C.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
    const g = C.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dst); o.start(t); o.stop(t + dur + 0.02);
  },
  // gunshot: character depends on caliber class & suppressor. pos null = player's own weapon
  shot(kind, suppressed, pos) {
    if (!this.ctx) return;
    const own = !pos;
    const dst = own ? this.out(null) : this.out(pos, suppressed ? 6 : 25, suppressed ? 80 : 400, 1.2);
    const big = kind === 'rifle' ? 1 : kind === 'sniper' ? 1.5 : kind === 'shotgun' ? 1.4 : kind === 'smg' ? 0.7 : 0.55;
    if (suppressed) {
      this.noise(dst, 0.12, 0.35 * big, { type: 'lowpass', freq: 1800, decay: 0.09 });
      this.tone(dst, 180, 0.09, 0.25 * big, { to: 60 });
      this.noise(dst, 0.05, 0.25, { type: 'highpass', freq: 3000, decay: 0.03 }); // mechanical action
    } else {
      this.noise(dst, 0.05, 0.9, { type: 'highpass', freq: 2500, decay: 0.035, attack: 0.001 }); // crack
      this.noise(dst, 0.25 * big, 0.8 * big, { type: 'lowpass', freq: 900 * (kind === 'shotgun' ? 0.7 : 1), decay: 0.18 * big }); // body
      this.tone(dst, 140 * (kind === 'pistol' ? 1.6 : 1), 0.2 * big, 0.5 * big, { to: 40 });
      if (!own) { // distant echo tail
        const d = pos.distanceTo(this.listener.pos);
        if (d > 40) this.noise(dst, 0.6, 0.35, { type: 'lowpass', freq: 500, decay: 0.5, attack: 0.05 });
      }
    }
  },
  crack(pos) { if (!this.ctx) return; const d = this.out(pos, 4, 30); this.noise(d, 0.06, 0.7, { type: 'highpass', freq: 4000, decay: 0.04 }); },
  impact(pos, mat) {
    if (!this.ctx) return; const d = this.out(pos, 8, 90);
    if (mat === 'metal') { this.tone(d, rnd(900, 1600), 0.12, 0.3, { type: 'triangle', to: 300 }); this.noise(d, 0.08, 0.3, { type: 'bandpass', freq: 3000, q: 2, decay: 0.06 }); }
    else if (mat === 'flesh') { this.noise(d, 0.09, 0.5, { type: 'lowpass', freq: 700, decay: 0.07 }); }
    else if (mat === 'wood') { this.noise(d, 0.08, 0.4, { type: 'bandpass', freq: 800, q: 1, decay: 0.06 }); }
    else { this.noise(d, 0.1, 0.45, { type: 'bandpass', freq: 1500, q: 0.8, decay: 0.08 }); }
  },
  hitmarker() { if (!this.ctx) return; const d = this.out(null); this.noise(d, 0.05, 0.25, { type: 'bandpass', freq: 2500, q: 3, decay: 0.04 }); },
  hurt() { if (!this.ctx) return; const d = this.out(null); this.noise(d, 0.2, 0.7, { type: 'lowpass', freq: 500, decay: 0.15 }); this.tone(d, 90, 0.25, 0.4, { to: 50 }); },
  heartbeat() { if (!this.ctx) return; const d = this.out(null); this.tone(d, 55, 0.12, 0.5, { to: 40 }); setTimeout(() => { if (this.ctx) this.tone(this.out(null), 50, 0.1, 0.35, { to: 38 }); }, 160); },
  click(pos) { if (!this.ctx) return; const d = this.out(pos, 4, 25); this.noise(d, 0.03, 0.35, { type: 'highpass', freq: 3000, decay: 0.02 }); },
  reloadStep(step, pos) { // 0 mag out, 1 mag in, 2 bolt
    if (!this.ctx) return; const d = this.out(pos, 4, 25);
    if (step === 0) { this.noise(d, 0.08, 0.35, { type: 'bandpass', freq: 1200, q: 1.5, decay: 0.06 }); this.tone(d, 400, 0.05, 0.1, { type: 'square', to: 200 }); }
    else if (step === 1) { this.noise(d, 0.06, 0.4, { type: 'bandpass', freq: 900, q: 1, decay: 0.05 }); this.tone(d, 250, 0.06, 0.2, { type: 'triangle', to: 120 }); }
    else { this.noise(d, 0.05, 0.4, { type: 'highpass', freq: 2500, decay: 0.03 }); this.tone(d, 1400, 0.04, 0.15, { type: 'square', to: 600 }); setTimeout(() => this.ctx && this.noise(this.out(pos, 4, 25), 0.05, 0.45, { type: 'bandpass', freq: 1800, q: 2, decay: 0.04 }), 90); }
  },
  step(pos, surf, run, own) {
    if (!this.ctx) return; const d = own ? this.out(null) : this.out(pos, 5, run ? 40 : 22, 1.6);
    const v = (run ? 0.5 : 0.25) * (own ? 0.5 : 1);
    if (surf === 'water') { this.noise(d, 0.25, v * 1.3, { type: 'bandpass', freq: 2500, q: 0.6, decay: 0.2 }); }
    else if (surf === 'metal') { this.tone(d, rnd(300, 500), 0.15, v * 0.5, { type: 'triangle', to: 150 }); this.noise(d, 0.08, v, { type: 'bandpass', freq: 2000, q: 1, decay: 0.06 }); }
    else if (surf === 'concrete') { this.noise(d, 0.07, v, { type: 'bandpass', freq: rnd(1400, 1900), q: 1.2, decay: 0.05 }); }
    else if (surf === 'wood') { this.noise(d, 0.09, v, { type: 'lowpass', freq: 600, decay: 0.07 }); }
    else { this.noise(d, 0.1, v * 0.9, { type: 'bandpass', freq: rnd(700, 1100), q: 0.7, decay: 0.08 }); } // grass / dirt
  },
  pickup() { if (!this.ctx) return; const d = this.out(null); this.noise(d, 0.12, 0.3, { type: 'bandpass', freq: 1200, q: 1, decay: 0.1 }); },
  zipper() { if (!this.ctx) return; const d = this.out(null); this.noise(d, 0.35, 0.25, { type: 'bandpass', freq: 2200, q: 2, decay: 0.3, sweep: 3200 }); },
  door(pos, open) { if (!this.ctx) return; const d = this.out(pos, 5, 40); this.noise(d, 0.35, 0.35, { type: 'bandpass', freq: open ? 400 : 700, q: 1.5, decay: 0.3, sweep: open ? 700 : 300 }); this.tone(d, open ? 180 : 120, 0.2, 0.15, { type: 'triangle', to: 90 }); },
  heal() { if (!this.ctx) return; const d = this.out(null); this.noise(d, 0.5, 0.2, { type: 'bandpass', freq: 3000, q: 0.5, decay: 0.45 }); },
  ui() { if (!this.ctx) return; const d = this.out(null); this.tone(d, 1200, 0.05, 0.08, { type: 'square', to: 900 }); },
  extractTick() { if (!this.ctx) return; const d = this.out(null); this.tone(d, 880, 0.08, 0.12, { to: 660 }); },
  extracted() { if (!this.ctx) return; const d = this.out(null); [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.ctx && this.tone(this.out(null), f, 0.5, 0.18), i * 130)); },
  death() { if (!this.ctx) return; const d = this.out(null); this.tone(d, 200, 1.6, 0.4, { to: 30, type: 'sawtooth' }); this.noise(d, 1.2, 0.4, { type: 'lowpass', freq: 400, decay: 1.0 }); },
  // Scav voice: formant-ish shout using detuned saws through bandpass filters with pitch contour.
  shout(pos, kind) {
    if (!this.ctx) return; const C = this.ctx, d = this.out(pos, 12, 120, 1.3), t = C.currentTime;
    const syll = kind === 'contact' ? [[230, 0.14], [190, 0.22]] : kind === 'hurt' ? [[260, 0.3]] : kind === 'death' ? [[210, 0.5]] : [[170, 0.15], [200, 0.15], [150, 0.25]];
    let tt = t;
    for (const [f0, dur] of syll) {
      const o = C.createOscillator(), o2 = C.createOscillator(); o.type = 'sawtooth'; o2.type = 'sawtooth';
      o.frequency.setValueAtTime(f0 * rnd(0.9, 1.1), tt); o.frequency.linearRampToValueAtTime(f0 * 0.8, tt + dur);
      o2.frequency.setValueAtTime(f0 * 1.007, tt); o2.frequency.linearRampToValueAtTime(f0 * 0.78, tt + dur);
      const f1 = C.createBiquadFilter(), f2 = C.createBiquadFilter(); f1.type = 'bandpass'; f2.type = 'bandpass';
      f1.frequency.value = pick([600, 750, 900]); f1.Q.value = 4; f2.frequency.value = pick([1400, 1800, 2200]); f2.Q.value = 5;
      const g = C.createGain(); g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(0.5, tt + 0.03); g.gain.setValueAtTime(0.45, tt + dur * 0.7); g.gain.linearRampToValueAtTime(0, tt + dur);
      o.connect(f1); o2.connect(f1); o.connect(f2); o2.connect(f2); f1.connect(g); f2.connect(g); g.connect(d);
      o.start(tt); o2.start(tt); o.stop(tt + dur + 0.02); o2.stop(tt + dur + 0.02);
      tt += dur + 0.04;
    }
  },
  startAmbient() {
    if (!this.ctx || this.ambient) return; const C = this.ctx;
    const s = C.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = C.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 350; const g = C.createGain(); g.gain.value = 0.05;
    const lfo = C.createOscillator(); lfo.frequency.value = 0.13; const lg = C.createGain(); lg.gain.value = 0.03; lfo.connect(lg); lg.connect(g.gain);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(); lfo.start();
    this.ambient = { s, lfo, g };
    // sparse distant birds/creaks
    this.ambTimer = setInterval(() => { if (Math.random() < 0.5) { const d = this.out(null); d.gain.value = 0.06; this.tone(d, rnd(1800, 3200), 0.12, 0.3, { to: rnd(1500, 2800) }); } }, 3500);
  },
  stopAmbient() { if (!this.ambient) return; try { this.ambient.s.stop(); this.ambient.lfo.stop(); } catch (e) { } this.ambient = null; clearInterval(this.ambTimer); },
};
