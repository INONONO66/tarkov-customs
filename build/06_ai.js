
// ============================================================================
//  SCAV AI: perception, patrol, combat, corpses
// ============================================================================
const SCAV_NAMES = ['Vasya', 'Petya', 'Kolya', 'Sanya', 'Dima', 'Zhora', 'Tolik', 'Slava', 'Gena', 'Lyoha', 'Misha', 'Seryoga', 'Vitya', 'Borya', 'Pasha', 'Andrey', 'Igor', 'Ruslan'];
const SCAV_MATS = {
  skin: new THREE.MeshStandardMaterial({ color: 0xc8a080, roughness: 0.9 }),
  jackets: [0x3a4a2a, 0x2a2a30, 0x4a3a2a, 0x2a3a5a, 0x5a5a50, 0x3a2a2a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 })),
  pants: [0x2a2a2a, 0x3a3a48, 0x4a4a3a, 0x2f3a2a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 })),
  hat: [0x1a1a1a, 0x3a2a1a, 0x4a4a2a, 0x2a3a2a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 })),
  gun: new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.6, metalness: 0.5 }),
  vest: new THREE.MeshStandardMaterial({ color: 0x4a4a3a, roughness: 0.9 }),
};
const SCAV_GUNS = [{ w: 15, t: 'pm' }, { w: 16, t: 'mp5' }, { w: 26, t: 'ak74n' }, { w: 20, t: 'akm' }, { w: 12, t: 'mp153' }, { w: 7, t: 'mosin' }, { w: 4, t: 'm4a1' }];

const AI = {
  scavs: [], corpses: [], spawnedTotal: 0, waveTimer: 0, tmp: V3(), tmp2: V3(),
  reset() {
    for (const s of this.scavs) World.scene.remove(s.g); for (const c of this.corpses) { World.scene.remove(c.g); c.collider.disabled = true; }
    this.scavs = []; this.corpses = []; this.spawnedTotal = 0; this.waveTimer = 200;
  },
  spawn(x, z) {
    const s = { name: pick(SCAV_NAMES), pos: V3(x, 0, z), vel: V3(), yaw: rnd(0, 6.28), state: 'idle', t: rnd(1, 4), hp: { ...PART_MAX }, dead: false, home: V3(x, 0, z),
      target: null, lastSeen: V3(), lastSeenT: -99, seeT: 0, react: 0, fireT: 0, burst: 0, pause: 0, alertPos: null, stuck: 0, crouch: false, sightTimer: rnd(0, 0.2), anim: 0, moving: false,
      armor: wpick([{ w: 60, c: 0 }, { w: 25, c: 2 }, { w: 10, c: 3 }, { w: 5, c: 4 }]).c, helmet: Math.random() < 0.3 ? pick([2, 3]) : 0, chatter: rnd(10, 40), strafe: 0, strafeT: 0, wantDist: rnd(12, 28) };
    s.weapon = newWeapon(wpick(SCAV_GUNS).t); s.weapon.mods = randomMods(s.weapon.type, 0.25); s.st = weaponStats(s.weapon); s.mag = s.st.magSize;
    s.g = this.buildMesh(s); World.scene.add(s.g); this.scavs.push(s); this.spawnedTotal++; return s;
  },
  buildMesh(s) {
    const g = new THREE.Group(), J = pick(SCAV_MATS.jackets), P = pick(SCAV_MATS.pants);
    const mk = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
    s.mLegL = mk(boxGeo(0.17, 0.85, 0.2), P, -0.11, 0.85, 0); s.mLegR = mk(boxGeo(0.17, 0.85, 0.2), P, 0.11, 0.85, 0);
    s.mLegL.geometry = boxGeo(0.17, 0.85, 0.2).clone().translate(0, -0.425, 0); s.mLegR.geometry = s.mLegL.geometry; // pivot at hip
    s.mTorso = mk(boxGeo(0.44, 0.6, 0.26), J, 0, 1.15, 0); if (s.armor) mk(boxGeo(0.4, 0.4, 0.3), SCAV_MATS.vest, 0, 1.2, 0);
    s.mHead = mk(boxGeo(0.22, 0.24, 0.24), SCAV_MATS.skin, 0, 1.62, 0); s.mHat = mk(boxGeo(0.25, 0.1, 0.27), pick(SCAV_MATS.hat), 0, 1.72, 0);
    if (s.helmet) s.mHelm = mk(boxGeo(0.27, 0.16, 0.29), SCAV_MATS.gun, 0, 1.7, 0);
    s.mArmL = mk(boxGeo(0.12, 0.55, 0.14), J, -0.29, 1.35, -0.1); s.mArmR = mk(boxGeo(0.12, 0.55, 0.14), J, 0.29, 1.35, -0.1);
    s.mArmL.geometry = boxGeo(0.12, 0.55, 0.14).clone().translate(0, -0.25, 0); s.mArmR.geometry = s.mArmL.geometry;
    s.mArmL.rotation.x = -1.2; s.mArmR.rotation.x = -1.3;
    const gun = new THREE.Group(); gun.position.set(0.05, 1.28, -0.35); gun.add(new THREE.Mesh(boxGeo(0.05, 0.08, 0.5), SCAV_MATS.gun)); const br = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 6), SCAV_MATS.gun); br.rotation.x = Math.PI / 2; br.position.set(0, 0.02, -0.4); gun.add(br);
    const mg = new THREE.Mesh(boxGeo(0.03, 0.18, 0.06), SCAV_MATS.gun); mg.position.set(0, -0.1, 0.05); gun.add(mg); g.add(gun); s.mGun = gun;
    g.position.copy(s.pos); g.rotation.y = s.yaw; return g;
  },
  // ------------------------------------------------ perception
  hear(pos, range, kind, src) {
    for (const s of this.scavs) {
      if (s.dead) continue; const d = s.pos.distanceTo(pos); if (d > range) continue;
      if (kind === 'shot') { if (s.state === 'combat') { s.lastSeen.copy(Player.pos); s.lastSeenT = Game.time; } else if (s.state !== 'alert' || Math.random() < 0.4) { s.state = 'alert'; s.alertPos = pos.clone(); s.t = rnd(8, 15); s.moveTo = null; } }
      else if (d < range && s.state !== 'combat') { if (s.state === 'idle' || s.state === 'patrol') { s.state = 'alert'; s.alertPos = pos.clone(); s.t = rnd(5, 9); s.moveTo = null; } }
    }
  },
  canSee(s, tp, dist) {
    const eye = this.tmp.set(s.pos.x, s.pos.y + (s.crouch ? 1.2 : 1.6), s.pos.z), dir = this.tmp2.copy(tp).sub(eye); const L = dir.length(); dir.multiplyScalar(1 / L);
    const hit = World.raycast(eye, dir, L); return !hit || hit.dist > L - 0.3;
  },
  perceive(s, dt) {
    s.sightTimer -= dt; if (s.sightTimer > 0) return; s.sightTimer = 0.18;
    if (Player.dead) { s.target = null; return; }
    const d = s.pos.distanceTo(Player.pos);
    let view = 85 * (Player.crouch ? 0.65 : 1) * (Math.hypot(Player.vel.x, Player.vel.z) > 5 ? 1.3 : 1) * (Player.torchOn && Player.wmesh && Player.wmesh.userData.lightPos ? 1.4 : 1);
    let seen = false;
    if (d < view) {
      const fx = -Math.sin(s.yaw), fz = -Math.cos(s.yaw), dx = (Player.pos.x - s.pos.x) / d, dz = (Player.pos.z - s.pos.z) / d;
      const cosA = fx * dx + fz * dz, inFov = cosA > (s.state === 'combat' ? -0.2 : 0.25) || d < 4;
      if (inFov) { const chest = V3(Player.pos.x, Player.pos.y + Player.h * 0.7, Player.pos.z); seen = this.canSee(s, chest, d) || this.canSee(s, V3(Player.pos.x, Player.pos.y + Player.h - 0.1, Player.pos.z), d); }
    }
    if (seen) {
      s.lastSeen.copy(Player.pos); s.lastSeenT = Game.time; s.seeT += 0.18;
      if (s.state !== 'combat') { s.state = 'combat'; s.react = clamp(0.35 + d / 120, 0.35, 1.3) * rnd(0.8, 1.3); Audio.shout(s.pos, 'contact'); s.moveTo = null; s.wantDist = rnd(10, 30);
        for (const o of this.scavs) if (o !== s && !o.dead && o.state !== 'combat' && o.pos.distanceTo(s.pos) < 25) { o.state = 'alert'; o.alertPos = Player.pos.clone(); o.t = 10; } }
      s.visible = true;
    } else { s.visible = false; s.seeT = 0; }
  },
  // ------------------------------------------------ update
  update(dt) {
    // waves
    this.waveTimer -= dt;
    if (this.waveTimer <= 0 && this.spawnedTotal < 30 && this.scavs.length < 18) { this.waveTimer = rnd(120, 200); const far = World.scavSpawns.filter(p => Math.hypot(p[0] - Player.pos.x, p[1] - Player.pos.z) > 90); const p = pick(far.length ? far : World.scavSpawns); const n = rndi(2, 3); for (let i = 0; i < n; i++) this.spawn(p[0] + rnd(-4, 4), p[1] + rnd(-4, 4)); }
    for (let i = this.scavs.length - 1; i >= 0; i--) { const s = this.scavs[i]; if (s.dead) { this.scavs.splice(i, 1); continue; } this.updateScav(s, dt); }
  },
  updateScav(s, dt) {
    const dPl = s.pos.distanceTo(Player.pos);
    if (dPl > 260) { // far away: cheap update
      s.t -= dt; if (s.t < 0) { s.t = rnd(4, 10); s.state = 'patrol'; s.moveTo = this.pickNav(s.home, 35); } if (s.moveTo) this.stepTowards(s, s.moveTo, dt, 2.2); this.pose(s, dt); return;
    }
    this.perceive(s, dt);
    s.t -= dt; s.chatter -= dt;
    if (s.chatter < 0 && s.state !== 'combat' && dPl < 45) { s.chatter = rnd(15, 45); Audio.shout(s.pos, 'idle'); }
    let speed = 0;
    if (s.state === 'idle') { if (s.t < 0) { s.state = 'patrol'; s.moveTo = this.pickNav(s.home, 40); s.t = 30; } else if (Math.random() < dt * 0.3) s.yaw += rnd(-1, 1); }
    else if (s.state === 'patrol') { if (!s.moveTo || s.t < 0 || this.arrived(s, s.moveTo, 1.2)) { s.state = 'idle'; s.t = rnd(2, 7); s.moveTo = null; } else speed = 2.0; }
    else if (s.state === 'alert') {
      if (!s.moveTo && s.alertPos) s.moveTo = this.nearestNav(s.alertPos);
      if (s.t < 0 || (s.moveTo && this.arrived(s, s.moveTo, 2))) { if (s.t < 0) { s.state = 'patrol'; s.moveTo = this.pickNav(s.home, 40); s.t = 30; } else { s.moveTo = null; s.alertPos = null; if (Math.random() < dt * 0.6) s.yaw += rnd(-1.5, 1.5); } }
      else speed = 3.6;
    }
    else if (s.state === 'combat') this.combat(s, dt, dPl);
    if (speed > 0 && s.moveTo) this.stepTowards(s, s.moveTo, dt, speed); else if (s.state !== 'combat') { s.vel.x = lerp(s.vel.x, 0, dt * 8); s.vel.z = lerp(s.vel.z, 0, dt * 8); s.moving = false; }
    // physics
    s.vel.y -= 17 * dt; const res = moveBody(s.pos, s.vel, dt, 0.33, 1.75, 0.55); s.onGround = res.onGround;
    if (s.moving && res.onGround) { s.anim += dt * 7; s.stepD = (s.stepD || 0) + Math.hypot(s.vel.x, s.vel.z) * dt; if (s.stepD > 1.8) { s.stepD = 0; Audio.step(s.pos, res.groundMat, Math.hypot(s.vel.x, s.vel.z) > 3, false); } }
    if (res.hitWall && s.moving) { s.stuck += dt; if (s.stuck > 0.4) { this.tryDoor(s); s.stuck = 0; s.sidestep = rnd(-1, 1) > 0 ? 1 : -1; s.sideT = 0.8; if (Math.random() < 0.3) { s.moveTo = this.pickNav(s.pos, 20); } } } else s.stuck = Math.max(0, s.stuck - dt);
    this.pose(s, dt);
  },
  combat(s, dt, d) {
    const sinceSeen = Game.time - s.lastSeenT;
    if (Player.dead) { s.state = 'idle'; s.t = 5; return; }
    if (sinceSeen > 14) { s.state = 'alert'; s.alertPos = s.lastSeen.clone(); s.t = 12; s.moveTo = null; return; }
    if (s.react > 0) { s.react -= dt; this.face(s, Player.pos, dt, 6); return; }
    const aimP = s.visible ? Player.pos : s.lastSeen;
    this.face(s, aimP, dt, s.visible ? 5 : 3);
    // movement decisions
    if (s.visible) {
      s.strafeT -= dt; if (s.strafeT < 0) { s.strafeT = rnd(1, 3); s.strafe = pick([-1, 0, 0, 1]); s.crouch = Math.random() < 0.3 && d > 12; s.wantDist = rnd(8, 30); }
      const fx = -Math.sin(s.yaw), fz = -Math.cos(s.yaw), rx = -fz, rz = fx; let mx = 0, mz = 0;
      if (d > s.wantDist + 4 && !s.crouch) { mx += fx; mz += fz; } else if (d < s.wantDist - 6) { mx -= fx * 0.6; mz -= fz * 0.6; }
      mx += rx * s.strafe * 0.8; mz += rz * s.strafe * 0.8;
      const L = Math.hypot(mx, mz); if (L > 0.1) { const sp = (s.crouch ? 1.4 : 2.6) / L; s.vel.x = lerp(s.vel.x, mx * sp, dt * 6); s.vel.z = lerp(s.vel.z, mz * sp, dt * 6); s.moving = true; } else { s.vel.x = lerp(s.vel.x, 0, dt * 8); s.vel.z = lerp(s.vel.z, 0, dt * 8); s.moving = false; }
      s.moveTo = null;
    } else { // lost sight: move to last seen
      if (!s.moveTo) s.moveTo = this.nearestNav(s.lastSeen);
      if (this.arrived(s, s.moveTo, 2.5)) { s.moveTo = null; s.vel.x *= 0.8; s.vel.z *= 0.8; s.moving = false; } else this.stepTowards(s, s.moveTo, dt, 3.4);
      s.crouch = false;
    }
    // shooting
    s.fireT -= dt;
    if (s.reload > 0) { s.reload -= dt; if (s.reload <= 0) { s.mag = s.st.magSize; Audio.reloadStep(2, s.pos); } return; }
    if (s.mag <= 0) { s.reload = 2.8 + rnd(0, 1); Audio.reloadStep(0, s.pos); return; }
    if (!s.visible || s.fireT > 0) return;
    if (s.pause > 0) { s.pause -= dt; return; }
    if (s.burst <= 0) { s.burst = s.st.modes[0] === 'auto' ? rndi(2, 6) : s.st.modes[0] === 'bolt' ? 1 : rndi(1, 3); s.pause = 0; }
    this.shoot(s, d); s.burst--; s.fireT = Math.max(60 / s.st.rpm, s.st.modes[0] === 'bolt' ? 1.6 : s.st.modes[0] === 'semi' ? rnd(0.25, 0.5) : 60 / s.st.rpm);
    if (s.burst <= 0) s.pause = rnd(0.8, 2.2);
  },
  shoot(s, d) {
    s.mag--;
    const muzzle = this.tmp.set(s.pos.x, s.pos.y + (s.crouch ? 1.05 : 1.35), s.pos.z).addScaledVector(V3(-Math.sin(s.yaw), 0, -Math.cos(s.yaw)), 0.5);
    const aim = V3(Player.pos.x, Player.pos.y + Player.h * 0.62, Player.pos.z);
    const dir = aim.clone().sub(muzzle).normalize();
    const spread = (0.018 + d * 0.0011 + (s.moving ? 0.015 : 0) + (s.crouch ? -0.005 : 0)) * (s.st.moa / 3.5) * Game.difficulty * (1 + 1.5 * Math.max(0, 1 - s.seeT)); // first shots are sloppy
    dir.x += (Math.random() - 0.5) * 2 * spread; dir.y += (Math.random() - 0.5) * 2 * spread; dir.z += (Math.random() - 0.5) * 2 * spread; dir.normalize();
    const L = aim.distanceTo(muzzle);
    for (let p = 0; p < s.st.pellets; p++) {
      const dd = dir.clone(); if (s.st.pellets > 1) { dd.x += (Math.random() - 0.5) * 0.05; dd.y += (Math.random() - 0.5) * 0.05; dd.z += (Math.random() - 0.5) * 0.05; dd.normalize(); }
      const wall = World.raycast(muzzle, dd, 300);
      const ph = rayPlayer(muzzle, dd, wall ? wall.dist : 300);
      if (ph) { Player.damage(s.st.dmg * 0.75 * clamp(1 - Math.max(0, d - 50) / 200, 0.5, 1), ph.part, s.st.pen, s); FX.tracer(muzzle, ph.point); } // scavs run cheap ammo
      else { const end = wall ? wall.point : muzzle.clone().addScaledVector(dd, 300); FX.tracer(muzzle, end); if (wall) { FX.impact(wall.point, wall.normal, wall.mat); Audio.impact(wall.point, wall.mat); } if (end.distanceTo(Player.pos) < 3 || (wall && wall.dist > L)) Audio.crack(Player.camera.position.clone().add(V3(rnd(-1, 1), 0, rnd(-1, 1)))); }
    }
    Audio.shot(s.st.kind, s.st.flags.sup, muzzle);
    FX.flash(muzzle);
    this.hear(s.pos, 60, 'shot', s); // other scavs converge a bit
  },
  // ------------------------------------------------ steering
  face(s, p, dt, k) { const want = Math.atan2(-(p.x - s.pos.x), -(p.z - s.pos.z)); let dy = want - s.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); s.yaw += dy * Math.min(1, dt * k); },
  stepTowards(s, p, dt, speed) {
    let dx = p.x - s.pos.x, dz = p.z - s.pos.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
    if (s.sideT > 0) { s.sideT -= dt; const sx = -dz * s.sidestep, sz = dx * s.sidestep; dx = dx * 0.3 + sx; dz = dz * 0.3 + sz; const l2 = Math.hypot(dx, dz); dx /= l2; dz /= l2; }
    s.vel.x = lerp(s.vel.x, dx * speed, dt * 6); s.vel.z = lerp(s.vel.z, dz * speed, dt * 6); s.moving = true;
    if (s.state !== 'combat') this.face(s, p, dt, 5);
  },
  arrived(s, p, r) { return Math.hypot(p.x - s.pos.x, p.z - s.pos.z) < r; },
  pickNav(from, r) { const c = []; for (let i = 0; i < 40; i++) { const p = pick(World.navPoints); if (Math.hypot(p[0] - from.x, p[1] - from.z) < r) c.push(p); } const p = c.length ? pick(c) : pick(World.navPoints); return V3(p[0], 0, p[1]); },
  nearestNav(p) { let best = null, bd = 1e9; for (let i = 0; i < World.navPoints.length; i += 1) { const n = World.navPoints[i], d = (n[0] - p.x) ** 2 + (n[1] - p.z) ** 2; if (d < bd) { bd = d; best = n; } } return best ? V3(best[0], 0, best[1]) : p.clone(); },
  tryDoor(s) { const fx = -Math.sin(s.yaw), fz = -Math.cos(s.yaw); for (const d of World.doors) { if (d.open || d.anim !== undefined) continue; const dx = d.x - s.pos.x, dz = d.z - s.pos.z; if (dx * dx + dz * dz < 2.5 && dx * fx + dz * fz > 0) { toggleDoor(d, s.pos); return; } } },
  pose(s, dt) {
    s.g.position.copy(s.pos); s.g.rotation.y = s.yaw;
    const sw = s.moving ? Math.sin(s.anim) * 0.6 : 0; s.mLegL.rotation.x = sw; s.mLegR.rotation.x = -sw;
    const cr = s.crouch ? 1 : 0; s.mTorso.position.y = 1.15 - cr * 0.45; s.mHead.position.y = 1.62 - cr * 0.45; s.mArmL.position.y = s.mArmR.position.y = 1.35 - cr * 0.45; s.mGun.position.y = 1.28 - cr * 0.45;
    s.mLegL.position.y = s.mLegR.position.y = 0.85 - cr * 0.3; s.mLegL.scale.y = s.mLegR.scale.y = 1 - cr * 0.35;
    s.mHat.position.y = 1.72 - cr * 0.45; if (s.mHelm) s.mHelm.position.y = 1.7 - cr * 0.45;
  },
  // ------------------------------------------------ hits & damage
  rayHit(o, d, maxD) {
    let best = null;
    for (const s of this.scavs) {
      if (s.dead) continue; const dx = s.pos.x - o.x, dz = s.pos.z - o.z; if (dx * d.x + dz * d.z < -1) continue;
      const cr = s.crouch ? 0.45 : 0, top = s.pos.y + 1.85 - cr;
      const r = rayAABB(o, d, V3(s.pos.x - 0.3, s.pos.y, s.pos.z - 0.3), V3(s.pos.x + 0.3, top, s.pos.z + 0.3));
      if (!r || r.t > maxD || r.t < 0) continue;
      const pt = o.clone().addScaledVector(d, r.t), hy = pt.y - s.pos.y + cr;
      let part = hy > 1.5 ? 'head' : hy > 1.05 ? 'thorax' : hy > 0.85 ? 'stomach' : (Math.random() < 0.5 ? 'lleg' : 'rleg');
      if (part === 'thorax') { const lx = (pt.x - s.pos.x) * Math.cos(s.yaw) - (pt.z - s.pos.z) * Math.sin(s.yaw); if (Math.abs(lx) > 0.19) part = lx < 0 ? 'larm' : 'rarm'; }
      if (part === 'head') { // head is narrower than the body box: re-test a tighter box
        const rh = rayAABB(o, d, V3(s.pos.x - 0.14, s.pos.y + 1.5 - cr, s.pos.z - 0.14), V3(s.pos.x + 0.14, top, s.pos.z + 0.14)); if (!rh) continue;
      }
      if (!best || r.t < best.dist) best = { dist: r.t, scav: s, part, point: pt };
    }
    return best;
  },
  damage(s, dmg, pen, part, from, point) {
    if (s.dead) return;
    let cls = part === 'head' ? s.helmet : (part === 'thorax' || part === 'stomach') ? s.armor : 0;
    if (cls > 0) { const need = cls * 10; dmg *= pen >= need ? 0.85 : clamp(0.12 + 0.5 * pen / need, 0.12, 0.65); }
    if (s.hp[part] <= 0) { part = 'thorax'; dmg *= 0.8; }
    s.hp[part] -= dmg;
    let dead = false;
    if (s.hp[part] <= 0) { const over = -s.hp[part]; s.hp[part] = 0; if (part === 'head' || part === 'thorax') dead = true; else { s.hp.thorax -= over * 0.8; if (s.hp.thorax <= 0) dead = true; } }
    if (dead) { this.kill(s, from); Game.hitmarker(true); return; }
    Game.hitmarker(false);
    if (Math.random() < 0.5) Audio.shout(s.pos, 'hurt');
    if (s.state !== 'combat') { s.state = 'combat'; s.react = rnd(0.2, 0.6); s.lastSeen.copy(Player.pos); s.lastSeenT = Game.time; }
  },
  kill(s, from) {
    s.dead = true; Audio.shout(s.pos, 'death');
    if (from === Player) { Player.kills++; Game.notify(`Killed ${s.name} (Scav) — ${WEAPONS[s.weapon.type].name}`); }
    // corpse: lay the mesh down, make lootable
    const g = s.g; g.rotation.order = 'YXZ'; g.rotation.set(-Math.PI / 2, s.yaw, 0); g.position.y = s.pos.y + 0.16;
    const items = [{ uid: uid(), id: 'weapon', name: weaponLabel(s.weapon), value: Math.round(weaponValue(s.weapon) * 0.55), w: WEAPONS[s.weapon.type].w, kind: 'weapon', weapon: s.weapon }];
    const n = rndi(1, 3); for (let i = 0; i < n; i++) items.push(makeItem(Math.random() < 0.4 ? POOLS.meds() : Math.random() < 0.3 ? 'ammo' : POOLS.duffle()));
    if (s.armor >= 3 && Math.random() < 0.5) items.push({ uid: uid(), id: 'armorpiece', name: `Body armor (class ${s.armor})`, value: 12000 * s.armor, w: 6, kind: 'loot' });
    const c = { type: 'corpse', def: { name: `${s.name}'s body`, time: 3 }, x: s.pos.x, y: s.pos.y, z: s.pos.z, items, searched: false, g, corpse: true };
    c.collider = World.addCollider(s.pos.x - 0.9, s.pos.y, s.pos.z - 0.9, s.pos.x + 0.9, s.pos.y + 0.4, s.pos.z + 0.9, 'flesh', { container: c, corpse: true }); World.gridInsert(c.collider);
    this.corpses.push(c); World.containers.push(c);
  },
};
// ray vs player cylinder (approx as AABB)
function rayPlayer(o, d, maxD) {
  const r = rayAABB(o, d, V3(Player.pos.x - 0.3, Player.pos.y, Player.pos.z - 0.3), V3(Player.pos.x + 0.3, Player.pos.y + Player.h, Player.pos.z + 0.3));
  if (!r || r.t > maxD || r.t < 0) return null;
  const pt = o.clone().addScaledVector(d, r.t), hy = (pt.y - Player.pos.y) / Player.h;
  let part = hy > 0.86 ? 'head' : hy > 0.58 ? 'thorax' : hy > 0.47 ? 'stomach' : (Math.random() < 0.5 ? 'lleg' : 'rleg');
  if (part === 'head' && Math.random() < 0.45) part = 'thorax'; // head box is generous; keep headshot rate sane
  if (part === 'thorax' && Math.random() < 0.3) part = Math.random() < 0.5 ? 'larm' : 'rarm';
  return { dist: r.t, point: pt, part };
}
