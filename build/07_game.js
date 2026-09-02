
// ============================================================================
//  FX: particles, tracers, flashes
// ============================================================================
const FX = {
  N: 700, parts: [], tracers: [], flashes: [],
  init(scene) {
    this.geo = new THREE.BufferGeometry(); this.pos = new Float32Array(this.N * 3); this.col = new Float32Array(this.N * 3);
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); this.geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.points = new THREE.Points(this.geo, new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true })); this.points.frustumCulled = false; scene.add(this.points);
    for (let i = 0; i < this.N; i++) this.parts.push({ life: 0, p: V3(), v: V3(), c: new THREE.Color() });
    this.TN = 60; this.tgeo = new THREE.BufferGeometry(); this.tpos = new Float32Array(this.TN * 6); this.tgeo.setAttribute('position', new THREE.BufferAttribute(this.tpos, 3));
    this.lines = new THREE.LineSegments(this.tgeo, new THREE.LineBasicMaterial({ color: 0xffd090, transparent: true, opacity: 0.5 })); this.lines.frustumCulled = false; scene.add(this.lines);
    for (let i = 0; i < this.TN; i++) this.tracers.push({ life: 0 });
    for (let i = 0; i < 3; i++) { const l = new THREE.PointLight(0xffc070, 0, 14, 2); scene.add(l); this.flashes.push(l); }
    this.fi = 0;
  },
  emit(p, v, c, life, spread = 0.5) { const q = this.parts.find(x => x.life <= 0) || this.parts[rndi(0, this.N - 1)]; q.life = life; q.max = life; q.p.copy(p); q.v.set(v.x + rnd(-spread, spread), v.y + rnd(-spread, spread), v.z + rnd(-spread, spread)); q.c.set(c); },
  impact(p, n, mat) { const c = mat === 'metal' ? 0xffe0a0 : mat === 'wood' ? 0x9a7a50 : mat === 'ground' ? 0x6a5a3a : 0xbdbdb0; for (let i = 0; i < 8; i++) this.emit(p, V3(n.x * 2, n.y * 2 + 1, n.z * 2), c, rnd(0.3, 0.7), 1.8); },
  blood(p) { for (let i = 0; i < 10; i++) this.emit(p, V3(0, 0.5, 0), 0x8a0a0a, rnd(0.3, 0.6), 1.5); },
  tracer(a, b) { const t = this.tracers.find(x => x.life <= 0) || this.tracers[0]; const i = this.tracers.indexOf(t); t.life = 0.08; this.tpos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6); this.tgeo.attributes.position.needsUpdate = true; },
  flash(p) { const l = this.flashes[this.fi++ % this.flashes.length]; l.position.copy(p); l.intensity = 8; },
  update(dt) {
    for (let i = 0; i < this.N; i++) { const q = this.parts[i]; if (q.life > 0) { q.life -= dt; q.v.y -= 9 * dt; q.p.addScaledVector(q.v, dt); this.pos[i * 3] = q.p.x; this.pos[i * 3 + 1] = q.p.y; this.pos[i * 3 + 2] = q.p.z; const k = q.life / q.max; this.col[i * 3] = q.c.r * k; this.col[i * 3 + 1] = q.c.g * k; this.col[i * 3 + 2] = q.c.b * k; } else { this.pos[i * 3 + 1] = -100; } }
    this.geo.attributes.position.needsUpdate = true; this.geo.attributes.color.needsUpdate = true;
    for (let i = 0; i < this.TN; i++) { const t = this.tracers[i]; if (t.life > 0) { t.life -= dt; if (t.life <= 0) { this.tpos.fill(0, i * 6, i * 6 + 6); this.tpos[i * 6 + 1] = -100; this.tpos[i * 6 + 4] = -100; this.tgeo.attributes.position.needsUpdate = true; } } }
    for (const l of this.flashes) if (l.intensity > 0) l.intensity = Math.max(0, l.intensity - dt * 120);
  },
};

// ============================================================================
//  GAME: raid loop, HUD, interaction, extraction
// ============================================================================
const RAID_LEN = 20 * 60;
const Game = {
  state: 'start', time: 0, left: RAID_LEN, difficulty: 1, lootOpen: null, search: null, invOpen: false, exOpen: false, hudT: 0, extractT: 0, extractIn: null, fps: 0, frames: 0, fpsT: 0,
  init() {
    const canvas = $('c');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); this.renderer.setSize(innerWidth, innerHeight); this.renderer.setClearColor(0x8d99a6, 1);
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 0.95;
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x8d99a6); this.scene.fog = new THREE.FogExp2(0x8d99a6, 0.0032);
    this.camera = new THREE.PerspectiveCamera(BASE_FOV, innerWidth / innerHeight, 0.03, 700); this.scene.add(this.camera);
    this.hemi = new THREE.HemisphereLight(0xb8c4d0, 0x5a584a, 1.1); this.scene.add(this.hemi); this.amb = new THREE.AmbientLight(0x8a8f96, 0.55); this.scene.add(this.amb);
    this.sun = new THREE.DirectionalLight(0xfff0dc, 1.5); this.sun.position.set(60, 90, 40); this.sun.castShadow = true;
    const sc = this.sun.shadow.camera; sc.left = sc.bottom = -70; sc.right = sc.top = 70; sc.near = 10; sc.far = 300; this.sun.shadow.mapSize.set(2048, 2048); this.sun.shadow.bias = -0.0015; this.sun.shadow.normalBias = 0.03;
    this.scene.add(this.sun); this.scene.add(this.sun.target);
    for (const l of [this.hemi, this.amb, this.sun]) l.layers.enable(1); // also light the viewmodel pass
    // sky dome: vertex-coloured gradient
    { const g = new THREE.SphereGeometry(600, 24, 12), pos = g.attributes.position, col = new Float32Array(pos.count * 3), top = new THREE.Color(0x5f7390), hor = new THREE.Color(0x9aa5b0); for (let i = 0; i < pos.count; i++) { const t = clamp(pos.getY(i) / 600, 0, 1); const c = hor.clone().lerp(top, Math.pow(t, 0.6)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(col, 3)); this.sky = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); this.sky.renderOrder = -1; this.scene.add(this.sky); }
    World.init(this.scene); buildCustoms(); Player.init(this.camera); FX.init(this.scene); Input.init(canvas);
    Player.flash.layers.enable(1); Player.torch.layers.enable(1);
    // menu preview scene
    this.mScene = new THREE.Scene(); this.mScene.background = new THREE.Color(0x0e0e0c); this.mCam = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.01, 10); this.mCam.position.set(0, 0.25, 2.3); this.mCam.lookAt(0, 0.0, 0); this.mScene.background = new THREE.Color(0x15171a);
    this.mScene.add(new THREE.HemisphereLight(0xffffff, 0x404040, 3)); const ml = new THREE.DirectionalLight(0xffeedd, 5); ml.position.set(1, 2, 2); this.mScene.add(ml); const ml2 = new THREE.DirectionalLight(0x8090ff, 2.0); ml2.position.set(-2, 0.5, -1); this.mScene.add(ml2);
    this.mGroup = new THREE.Group(); this.mScene.add(this.mGroup);
    window.addEventListener('resize', () => { this.renderer.setSize(innerWidth, innerHeight); this.camera.aspect = this.mCam.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); this.mCam.updateProjectionMatrix(); });
    this.clock = new THREE.Clock();
    this.compassInit();
    requestAnimationFrame(() => this.loop());
  },
  // ------------------------------------------------ raid lifecycle
  startRaid(loadout, isScavRun) {
    this.isScavRun = isScavRun; this.loadout = loadout;
    AI.reset(); spawnContainers(); for (const d of World.doors) { if (d.open) { d.open = false; d.mesh.rotation.y = 0; d.anim = undefined; setDoorCollider(d); } }
    this.activeExtracts = World.extracts.filter(e => !e.rnd || Math.random() < 0.55); if (this.activeExtracts.length < 3) this.activeExtracts = World.extracts.filter(e => !e.rnd);
    const side = Math.random() < 0.5 ? 'west' : 'east', sp = pick(World.spawns[side]);
    // don't allow extracts on the spawn side to be the only ones… (Tarkov: you extract on the opposite side). Filter: keep extracts farther than 120m from spawn
    const far = this.activeExtracts.filter(e => Math.hypot(e.x - sp[0], e.z - sp[1]) > 110); if (far.length >= 2) this.activeExtracts = far;
    Player.spawn(sp[0] + rnd(-3, 3), sp[1] + rnd(-3, 3), loadout);
    this.left = isScavRun ? rnd(9, 14) * 60 : RAID_LEN; this.time = 0; this.lootOpen = null; this.search = null; this.invOpen = false; this.exOpen = false; this.extractT = 0; this.extractIn = null;
    // scavs: groups at POIs, not too close to the player
    const spots = World.scavSpawns.filter(p => Math.hypot(p[0] - sp[0], p[1] - sp[1]) > 60).sort(() => Math.random() - 0.5);
    let n = 0; for (const p of spots) { const k = rndi(1, 3); for (let i = 0; i < k && n < 15; i++, n++) AI.spawn(p[0] + rnd(-5, 5), p[1] + rnd(-5, 5)); if (n >= 15) break; }
    this.state = 'raid'; this.show('hud'); $('loot').style.display = 'none'; $('inv').style.display = 'none'; $('extracts').style.display = 'block'; this.exOpen = true; setTimeout(() => { if (this.state === 'raid') { this.exOpen = false; $('extracts').style.display = 'none'; } }, 9000);
    this.renderExtractList(); this.updateHealthHud(); this.updateAmmoHud(); $('notify').innerHTML = '';
    this.notify(`Deployed at ${side === 'west' ? 'the western' : 'the eastern'} edge of Customs. ${isScavRun ? 'Scav run: extract with whatever you find.' : 'Find loot, stay alive, extract.'}`);
    Input.lock($('c')); Audio.startAmbient();
    this.camera.fov = BASE_FOV; this.camera.updateProjectionMatrix();
  },
  playerDied(reason) { if (this.state !== 'raid') return; this.deathReason = reason; setTimeout(() => this.endRaid(false), 1800); Input.unlock(); },
  endRaid(survived) {
    if (this.state !== 'raid') return; this.state = 'end'; Input.unlock(); Audio.stopAmbient(); this.hideProgress(); $('scope').style.display = 'none';
    if (survived) Audio.extracted();
    const P = Profile.data; P.stats.raids++; if (survived) P.stats.survived++; P.stats.kills += Player.kills;
    let lootVal = 0; const gained = [];
    if (survived) {
      for (const it of Player.inv) { lootVal += it.value; gained.push(it); Profile.stashAdd(it); }
      if (!this.isScavRun) { for (const w of Player.weapons) if (w) { delete w.rt; delete w._st; P.weapons.push(w); } P.gear = { ...Player.gear }; }
      else { for (const w of Player.weapons) if (w) { delete w.rt; delete w._st; P.weapons.push(w); } }
    } else if (!this.isScavRun) { /* everything on the PMC is lost */ }
    Profile.save();
    $('endTitle').textContent = survived ? 'SURVIVED' : this.isScavRun ? 'SCAV KILLED' : 'KILLED IN ACTION'; $('endTitle').style.color = survived ? '#7fbf6a' : '#c04a3a';
    $('endSub').textContent = survived ? `Extracted via ${this.extractIn ? this.extractIn.name : '—'}` : (this.deathReason || 'Killed') + (this.left <= 0 ? ' — MIA (raid timer expired)' : '');
    const acc = Player.shotsFired ? Math.round(100 * Player.hits / Player.shotsFired) : 0;
    $('endStats').innerHTML = `<span>Time in raid</span><span>${fmtTime(this.time)}</span><span>Kills</span><span>${Player.kills}</span><span>Shots / hits</span><span>${Player.shotsFired} / ${Player.hits} (${acc}%)</span><span>Loot value</span><span class="rub">${fmtRub(lootVal)}</span>` + (!survived && !this.isScavRun ? `<span>Lost</span><span style="color:#c04a3a">${Player.weapons.filter(Boolean).map(w => WEAPONS[w.type].name).join(', ') || 'nothing'} + gear + loot</span>` : '');
    $('endLoot').innerHTML = gained.length ? gained.map(i => `<div>${i.name} <span class="rub">${fmtRub(i.value)}</span></div>`).join('') : (survived ? '<div class="small">No loot brought back.</div>' : '<div class="small">All carried items were lost.</div>');
    this.show('end');
  },
  show(id) { for (const s of document.querySelectorAll('.screen')) s.classList.remove('on'); $(id).classList.add('on'); },
  // ------------------------------------------------ main loop
  loop() {
    requestAnimationFrame(() => this.loop());
    let dt = Math.min(0.05, this.clock.getDelta());
    this.frames++; this.fpsT += dt; if (this.fpsT > 1) { $('fps').textContent = this.frames + ' fps'; this.frames = 0; this.fpsT = 0; }
    if (this.state === 'raid' || this.state === 'end') { if (this.state === 'raid') this.updateRaid(dt); this.renderWorld(); }
    else { this.mGroup.rotation.y += dt * 0.6; this.renderer.render(this.mScene, this.mCam); }
    Input.endFrame();
  },
  // two passes: world, then the viewmodel on its own layer with a cleared depth buffer so the gun never clips into walls
  renderWorld() {
    const r = this.renderer, c = this.camera; this.sky.position.copy(c.position);
    c.layers.set(0); r.autoClear = true; r.render(this.scene, c);
    const bg = this.scene.background; this.scene.background = null; // a Color background forces a clear — disable it for the overlay pass
    r.autoClear = false; r.clearDepth(); c.layers.set(1); r.render(this.scene, c);
    c.layers.set(0); r.autoClear = true; this.scene.background = bg;
  },
  updateRaid(dt) {
    if (this.state !== 'raid') return;
    this.time += dt; this.left -= dt;
    if (Input.hit('Backspace') && !Input.locked) { Player.die('Abandoned the raid'); }
    if (!Input.locked && !Player.dead) { $('paused').style.display = 'block'; } else $('paused').style.display = 'none';
    if (this.left <= 0 && !Player.dead) { this.left = 0; Player.dead = true; this.deathReason = 'Missing in action'; this.endRaid(false); return; }
    // UI toggles
    if (Input.hit('Tab')) { this.invOpen = !this.invOpen; $('inv').style.display = this.invOpen ? 'block' : 'none'; if (this.invOpen) this.renderInv(); Audio.ui(); }
    if (Input.hit('KeyO')) { this.exOpen = !this.exOpen; $('extracts').style.display = this.exOpen ? 'block' : 'none'; }
    if (this.invOpen) { for (let i = 1; i <= 9; i++) if (Input.hit('Digit' + i)) { const it = Player.inv[i - 1]; if (it) { Player.inv.splice(i - 1, 1); this.notify('Discarded ' + it.name); this.renderInv(); } Input.pressed['Digit' + i] = false; } }
    this.updateInteraction(dt);
    if (!Player.dead) Player.update(dt);
    AI.update(dt); updateDoors(dt); FX.update(dt);
    this.updateExtraction(dt);
    // sun shadow follows the player
    this.sun.position.set(Player.pos.x + 60, 90, Player.pos.z + 40); this.sun.target.position.copy(Player.pos); this.sun.target.updateMatrixWorld();
    if (World.waterMesh) World.waterMesh.material.map.offset.x += dt * 0.01;
    // low health heartbeat
    const hp = Player.totalHp(); if (hp < 120 && !Player.dead) { this.hbT = (this.hbT || 0) - dt; if (this.hbT <= 0) { this.hbT = lerp(0.6, 1.2, hp / 120); Audio.heartbeat(); } }
    $('vig').style.opacity = clamp(1 - hp / 200, 0, 0.9); this.dmgO = Math.max(0, (this.dmgO || 0) - dt * 2); $('dmgflash').style.opacity = this.dmgO;
    // HUD 10Hz
    this.hudT -= dt; if (this.hudT <= 0) { this.hudT = 0.1; this.updateHud(); }
    this.updateCompass();
  },
  // ------------------------------------------------ interaction (loot, doors)
  updateInteraction(dt) {
    const cam = this.camera, o = cam.position, d = V3(0, 0, -1).applyQuaternion(cam.quaternion);
    const hit = World.raycast(o, d, 2.6); let prompt = '';
    const target = hit && hit.collider ? hit.collider : null;
    if (this.lootOpen && (Player.pos.distanceTo(V3(this.lootOpen.x, this.lootOpen.y, this.lootOpen.z)) > 3.2 || Player.dead)) this.closeLoot();
    if (this.search && (!target || target.container !== this.search.c)) { this.search = null; this.hideProgress(); }
    if (target && target.container && !Player.dead) {
      const c = target.container;
      if (this.lootOpen === c) { prompt = c.items.length ? '<b>1-9</b> take item &nbsp; <b>F</b> take all' : 'Empty'; }
      else if (this.search && this.search.c === c) { this.search.t += dt; this.showProgress(this.search.t / this.search.dur, 'SEARCHING ' + c.def.name.toUpperCase()); if (this.search.t >= this.search.dur) { c.searched = true; this.search = null; this.hideProgress(); this.openLoot(c); } }
      else { prompt = `<b>F</b> ${c.searched ? 'Open' : 'Search'} ${c.def.name}`; if (Input.hit('KeyF')) { if (c.searched) this.openLoot(c); else { this.search = { c, t: 0, dur: c.def.time * (this.lootOpen ? 0.5 : 1) }; Audio.zipper(); } } }
    } else if (target && target.door && !Player.dead) {
      prompt = `<b>F</b> ${target.door.open ? 'Close' : 'Open'} door`; if (Input.hit('KeyF')) toggleDoor(target.door, Player.pos);
    }
    if (this.lootOpen) {
      const c = this.lootOpen;
      for (let i = 1; i <= 9; i++) if (Input.hit('Digit' + i)) { const it = c.items[i - 1]; if (it) { Input.pressed['Digit' + i] = false; this.takeItem(c, it); } }
      if (Input.hit('KeyF') && !(target && target.container && target.container !== c)) { let took = 0; for (const it of c.items.slice()) { if (this.takeItem(c, it, true)) took++; else break; } if (took) Audio.pickup(); }
      if (Input.hit('KeyX')) this.closeLoot();
    }
    $('prompt').innerHTML = prompt;
  },
  openLoot(c) { this.lootOpen = c; this.renderLoot(); Audio.ui(); },
  closeLoot() { this.lootOpen = null; $('loot').style.display = 'none'; },
  takeItem(c, it, quiet) {
    if (it.kind === 'ammo') { // ammo goes to a matching weapon's reserve, else as an item
      const w = Player.weapons.find(w => w && AMMO_BY_ID[it.ammoId] && AMMO_BY_ID[it.ammoId].cal === WEAPONS[w.type].cal);
      if (w) { w.rt.reserve += it.count; c.items.splice(c.items.indexOf(it), 1); this.notify(`+${it.count} rounds ${AMMO_BY_ID[it.ammoId].name}`); this.renderLoot(); this.updateAmmoHud(); if (!quiet) Audio.pickup(); return true; }
    }
    if (!Player.addItem(it)) { this.notify('Inventory full — Tab, then 1-9 to discard'); return false; }
    c.items.splice(c.items.indexOf(it), 1); this.renderLoot(); if (!quiet) Audio.pickup(); if (this.invOpen) this.renderInv(); return true;
  },
  renderLoot() {
    const c = this.lootOpen; if (!c) return; const L = $('loot'); L.style.display = 'block';
    L.innerHTML = `<h2>${c.def.name}</h2>` + (c.items.length ? c.items.map((it, i) => `<div class="li${Player.inv.length >= Player.capacity() && it.kind !== 'ammo' ? ' full' : ''}"><span class="k">${i < 9 ? i + 1 : ''}</span><span class="n">${it.name}</span><span class="v">${fmtRub(it.value)}</span></div>`).join('') : '<div class="small">Empty.</div>') + `<div class="small" style="margin-top:6px">Inventory ${Player.inv.length}/${Player.capacity()} · <b>F</b> take all · <b>X</b> close</div>`;
  },
  renderInv() {
    const I = $('inv'), wt = Player.weight();
    I.innerHTML = `<h2>Inventory ${Player.inv.length}/${Player.capacity()}</h2><div class="small">Weight ${wt.toFixed(1)} kg${wt > 22 ? ' — <span style="color:#d86a5a">overweight</span>' : ''} · 1-9 discards an item</div>` + Player.inv.map((it, i) => `<div class="li"><span>${i < 9 ? `<span style="color:var(--amber)">${i + 1}</span> ` : ''}${it.name}</span><span class="rub">${fmtRub(it.value)}</span></div>`).join('') + (Player.inv.length ? '' : '<div class="small">Empty.</div>');
    let total = 0; for (const it of Player.inv) total += it.value; I.innerHTML += `<div class="li" style="border-top:1px solid #4a463c;margin-top:4px"><span>Total</span><span class="rub">${fmtRub(total)}</span></div>`;
  },
  // ------------------------------------------------ extraction
  updateExtraction(dt) {
    if (Player.dead) return;
    let inZone = null; for (const e of this.activeExtracts) if (Math.hypot(e.x - Player.pos.x, e.z - Player.pos.z) < e.r) inZone = e;
    if (inZone) {
      if (inZone.cost && Profile.data.rubles < inZone.cost) { this.showProgress(0, `NEED ${fmtRub(inZone.cost)} FOR ${inZone.name.toUpperCase()}`); this.extractIn = null; return; }
      if (this.extractIn !== inZone) { this.extractIn = inZone; this.extractT = 0; this.notify(`Extraction point: ${inZone.name}`); }
      this.extractT += dt; const k = this.extractT / inZone.time;
      this.showProgress(k, `EXTRACTING — ${inZone.name.toUpperCase()} ${Math.ceil(inZone.time - this.extractT)}s`);
      if (Math.floor(this.extractT) !== Math.floor(this.extractT - dt)) Audio.extractTick();
      if (k >= 1) { if (inZone.cost) { Profile.data.rubles -= inZone.cost; } this.endRaid(true); }
    } else if (this.extractIn) { this.extractIn = null; this.extractT = 0; if (!this.search && !Player.heal) this.hideProgress(); }
  },
  renderExtractList() {
    $('exList').innerHTML = World.extracts.map(e => { const on = this.activeExtracts.includes(e); return `<div class="ex${on ? '' : ' closed'}">${e.name}${e.cost && on ? ` <span class="small">(${fmtRub(e.cost)})</span>` : ''}${on ? ` <span class="small" data-ex="${e.name}"></span>` : ''}</div>`; }).join('');
  },
  // ------------------------------------------------ HUD
  notify(msg) { const n = $('notify'), d = document.createElement('div'); d.innerHTML = msg; n.appendChild(d); setTimeout(() => d.remove(), 4000); while (n.children.length > 5) n.firstChild.remove(); },
  showProgress(k, label) { const p = $('pbar'); p.style.display = 'block'; p.firstElementChild.style.width = clamp(k, 0, 1) * 100 + '%'; p.lastElementChild.textContent = label; },
  hideProgress() { $('pbar').style.display = 'none'; },
  hitmarker(kill) { const h = $('hitm'); h.className = kill ? 'kill' : ''; h.style.opacity = 1; clearTimeout(this._hm); this._hm = setTimeout(() => h.style.opacity = 0, kill ? 350 : 120); Audio.hitmarker(); },
  flashDamage() { this.dmgO = 1; },
  updateHealthHud() {
    const P = Player; for (const p of PARTS) { const el = $('p-' + p), k = P.hp[p] / PART_MAX[p]; el.style.background = k <= 0 ? '#222' : `rgb(${Math.round(190 - 110 * k)},${Math.round(60 + 90 * k)},${Math.round(40 + 20 * k)})`; el.textContent = Math.ceil(P.hp[p]); }
    const t = P.totalHp(); $('hpn').textContent = `${Math.ceil(t)}/440`; $('hpbar').firstElementChild.style.width = (t / 440 * 100) + '%';
    const fx = []; if (P.bleedL) fx.push('🩸 Light bleed x' + P.bleedL); if (P.bleedH) fx.push('🩸 HEAVY BLEED x' + P.bleedH); if (P.fracLeg) fx.push('🦴 Leg fracture'); if (P.fracArm) fx.push('🦴 Arm fracture'); if (P.pain > 0) fx.push('💊 Painkillers ' + Math.ceil(P.pain) + 's');
    $('effects').innerHTML = fx.join(' · ');
  },
  updateAmmoHud() { const w = Player.weapon; if (!w) { $('wname').textContent = 'UNARMED'; $('mag').textContent = '-'; $('res').textContent = ''; $('fmode').textContent = ''; return; } const st = weaponStats(w); $('wname').textContent = st.name.toUpperCase() + (st.flags.sup ? ' · SUPPRESSED' : ''); $('mag').textContent = w.rt.mag; $('res').textContent = '/ ' + w.rt.reserve; $('fmode').textContent = (w.rt.mode || '').toUpperCase() + ' · ' + st.ammo.name; },
  updateHud() {
    $('tval').textContent = fmtTime(this.left); $('tval').style.color = this.left < 300 ? '#e05a4a' : '#f0e2b8';
    $('stam').firstElementChild.style.width = Player.stamina + '%'; const wt = Player.weight(); $('wgt').textContent = `${wt.toFixed(1)} kg · ${Player.inv.length}/${Player.capacity()} slots` + (wt > 22 ? ' · OVERWEIGHT' : '');
    if (Player.bleedL || Player.bleedH || Player.pain > 0) this.updateHealthHud();
    if (this.exOpen) for (const el of document.querySelectorAll('#exList [data-ex]')) { const e = World.extracts.find(x => x.name === el.dataset.ex); const d = Math.hypot(e.x - Player.pos.x, e.z - Player.pos.z); el.textContent = `${Math.round(d)} m ${this.bearingName(e)}`; }
  },
  bearingName(e) { const a = Math.atan2(e.x - Player.pos.x, -(e.z - Player.pos.z)) * 180 / Math.PI; const n = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']; return n[Math.round(((a + 360) % 360) / 45) % 8]; },
  compassInit() {
    const s = document.querySelector('#compass .strip'); let h = '';
    for (let rep = -1; rep <= 1; rep++) for (let a = 0; a < 360; a += 15) { const deg = a + rep * 360; const lab = a === 0 ? 'N' : a === 90 ? 'E' : a === 180 ? 'S' : a === 270 ? 'W' : (a % 45 === 0 ? '' : a); h += `<span class="${typeof lab === 'string' && lab ? 'card' : ''}" style="left:${deg * 3}px">${lab || (a % 45 === 0 ? '·' : '')}</span>`; }
    this.exMarks = []; for (let i = 0; i < 7; i++) h += `<span class="exm" data-i="${i}" style="left:-1000px;color:#7fbf6a;font-size:9px;top:15px"></span>`;
    s.innerHTML = h; this.strip = s;
  },
  updateCompass() {
    const heading = ((-Player.yaw * 180 / Math.PI) % 360 + 360) % 360; // 0 = north (-z), clockwise
    this.strip.style.transform = `translateX(${180 - heading * 3}px)`;
    const marks = this.strip.querySelectorAll('.exm'); let i = 0;
    for (const e of this.activeExtracts) { const m = marks[i++]; if (!m) break; const d = Math.hypot(e.x - Player.pos.x, e.z - Player.pos.z); if (d > 160) { m.style.left = '-1000px'; continue; } let a = Math.atan2(e.x - Player.pos.x, -(e.z - Player.pos.z)) * 180 / Math.PI; a = ((a % 360) + 360) % 360; let rel = a - heading; rel = ((rel + 180) % 360 + 360) % 360 - 180; m.style.left = (heading + rel) * 3 + 'px'; m.textContent = '▲' + Math.round(d); }
    for (; i < marks.length; i++) marks[i].style.left = '-1000px';
  },
};
