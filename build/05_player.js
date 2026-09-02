
// ============================================================================
//  PLAYER: movement, health, weapons handling, viewmodel, inventory
// ============================================================================
const PARTS = ['head', 'thorax', 'stomach', 'larm', 'rarm', 'lleg', 'rleg'];
const PART_MAX = { head: 35, thorax: 85, stomach: 70, larm: 60, rarm: 60, lleg: 65, rleg: 65 };
const PART_W = [{ w: 8, p: 'head' }, { w: 34, p: 'thorax' }, { w: 14, p: 'stomach' }, { w: 11, p: 'larm' }, { w: 11, p: 'rarm' }, { w: 11, p: 'lleg' }, { w: 11, p: 'rleg' }];
const BASE_FOV = 75, VM_SCALE = 0.55, VM_LAYER = 1;

const Player = {
  pos: V3(), vel: V3(), yaw: 0, pitch: 0, lean: 0, leanT: 0, crouch: 0, crouchT: 0, r: 0.35, h: 1.8,
  stamina: 100, hp: {}, bleedL: 0, bleedH: 0, fracLeg: false, fracArm: false, pain: 0, dead: false,
  weapons: [null, null], cur: 0, switchT: 0, ads: 0, adsHold: false, fireTimer: 0, reload: null, bolt: 0, heal: null,
  recoilP: 0, recoilY: 0, vmKick: V3(), vmRot: V3(), bob: 0, stepDist: 0, swayT: 0,
  inv: [], gear: { armor: 'none', helmet: 'none', backpack: 'none' }, kills: 0, shotsFired: 0, hits: 0,
  camera: null, vm: null, wmesh: null, flash: null, laser: null, torch: null, torchOn: true, weaponsLowered: 0,
  init(camera) {
    this.camera = camera; this.vm = new THREE.Group(); camera.add(this.vm);
    this.flash = new THREE.PointLight(0xffc070, 0, 12, 2); camera.add(this.flash);
    this.flashMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffd090, transparent: true, opacity: 0.9 })); this.flashMesh.visible = false; this.vm.add(this.flashMesh);
    this.torch = new THREE.SpotLight(0xfff2d0, 0, 45, 0.32, 0.5, 1.2); this.torch.castShadow = false; this.vm.add(this.torch); this.vm.add(this.torch.target);
    const lg = new THREE.BufferGeometry().setFromPoints([V3(), V3(0, 0, -1)]);
    this.laser = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0xff2020, transparent: true, opacity: 0.35 })); this.laser.frustumCulled = false;
    this.laserDot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff3030 }));
  },
  // ------------------------------------------------ raid setup
  spawn(x, z, loadout) {
    this.pos.set(x, 0, z); this.vel.set(0, 0, 0); this.yaw = Math.atan2(x, z); this.pitch = 0; this.dead = false;
    for (const p of PARTS) this.hp[p] = PART_MAX[p];
    this.bleedL = this.bleedH = 0; this.fracLeg = this.fracArm = false; this.pain = 0; this.stamina = 100; this.kills = 0; this.shotsFired = 0; this.hits = 0;
    this.weapons = [loadout.primary || null, loadout.secondary || null]; this.cur = this.weapons[0] ? 0 : 1; this.switchT = 0; this.ads = 0; this.reload = null; this.heal = null; this.bolt = 0;
    for (const w of this.weapons) if (w) { const st = weaponStats(w); w.rt = { mag: st.magSize, reserve: st.magSize * 3, mode: st.modes[0] }; }
    this.gear = { ...loadout.gear }; this.inv = loadout.items.map(i => ({ ...i, uid: uid() }));
    this.recoilP = this.recoilY = 0; this.torchOn = true;
    this.setWeaponMesh();
  },
  get weapon() { return this.weapons[this.cur]; },
  get stats() { const w = this.weapon; if (!w) return null; if (!w._st) w._st = weaponStats(w); return w._st; },
  capacity() { return 4 + (GEAR.backpack.find(b => b.id === this.gear.backpack) || GEAR.backpack[0]).slots; },
  weight() { let w = 0; for (const it of this.inv) w += it.w || 0; for (const wp of this.weapons) if (wp) w += weaponStats(wp).weight; for (const k in this.gear) { const g = GEAR[k].find(x => x.id === this.gear[k]); if (g) w += g.w; } return w; },
  addItem(it) { if (this.inv.length >= this.capacity()) return false; this.inv.push(it); return true; },
  totalHp() { let t = 0; for (const p of PARTS) t += this.hp[p]; return t; },
  setWeaponMesh() {
    if (this.wmesh) { this.vm.remove(this.wmesh); this.wmesh = null; }
    this.laser.parent && this.laser.parent.remove(this.laser); this.laserDot.parent && this.laserDot.parent.remove(this.laserDot); this.torch.intensity = 0;
    const w = this.weapon; if (!w) return;
    w._st = weaponStats(w); this.wmesh = buildWeaponMesh(w); this.wmesh.scale.setScalar(VM_SCALE); this.vm.add(this.wmesh);
    this.wmesh.traverse(o => o.layers.set(VM_LAYER)); this.flashMesh.layers.set(VM_LAYER);
    const ud = this.wmesh.userData;
    if (ud.lightPos) { this.torch.position.copy(ud.lightPos); this.torch.target.position.copy(ud.lightPos).add(V3(0, 0, -5)); this.wmesh.add(this.torch); this.wmesh.add(this.torch.target); this.torch.intensity = this.torchOn ? 60 : 0; }
    if (ud.laserPos) { World.scene.add(this.laser); World.scene.add(this.laserDot); }
  },
  // ------------------------------------------------ per-frame
  update(dt) {
    if (this.dead) return;
    const st = this.stats, cam = this.camera, I = Input;
    // ---- look
    const sens = 0.0022 * (this.ads > 0.5 && st ? 1 / Math.sqrt(st.zoom) : 1);
    this.yaw -= I.mouse.dx * sens; this.pitch -= I.mouse.dy * sens; this.pitch = clamp(this.pitch, -1.5, 1.5);
    // ---- stance
    if (I.hit('KeyC')) this.crouch = this.crouch ? 0 : 1;
    this.crouchT = lerp(this.crouchT, this.crouch, Math.min(1, dt * 10));
    this.leanT = I.key('KeyQ') ? -1 : I.key('KeyE') ? 1 : 0; this.lean = lerp(this.lean, this.leanT, Math.min(1, dt * 8));
    // ---- movement
    const fwd = (I.key('KeyW') ? 1 : 0) - (I.key('KeyS') ? 1 : 0), side = (I.key('KeyD') ? 1 : 0) - (I.key('KeyA') ? 1 : 0);
    const moving = fwd || side, wt = this.weight(), overW = Math.max(0, wt - 22);
    const legsBad = (this.fracLeg && this.pain <= 0) || this.hp.lleg <= 0 || this.hp.rleg <= 0;
    let sprint = I.key('ShiftLeft') && fwd > 0 && this.stamina > 1 && !this.crouch && !legsBad && this.ads < 0.3 && !this.heal;
    let speed = sprint ? 6.4 : 3.9; if (this.crouch) speed = 2.1; if (this.ads > 0.5) speed *= 0.65; if (fwd < 0) speed *= 0.75; if (legsBad) speed *= 0.6; if (this.reload || this.heal) speed *= 0.8;
    speed *= clamp(1 - overW / 50, 0.45, 1); if (World.inWater(this.pos.x, this.pos.z)) speed *= 0.55;
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    let mx = (-sy * fwd + cy * side), mz = (-cy * fwd - sy * side); const ml = Math.hypot(mx, mz) || 1; mx = mx / ml * speed * (moving ? 1 : 0); mz = mz / ml * speed * (moving ? 1 : 0);
    const acc = Math.min(1, dt * 11); this.vel.x = lerp(this.vel.x, mx, acc); this.vel.z = lerp(this.vel.z, mz, acc);
    if (sprint) { this.stamina -= dt * (11 + overW * 0.4); } else this.stamina = Math.min(100, this.stamina + dt * (moving ? 5 : 9) * (1 - overW / 60));
    if (this.stamina < 0) this.stamina = 0;
    this.vel.y -= 17 * dt;
    const wasOn = this.onGround;
    if (I.hit('Space') && this.onGround && this.stamina > 12 && !this.crouch && !legsBad) { this.vel.y = 5.2; this.stamina -= 12; }
    const h = lerp(1.8, 1.2, this.crouchT); this.h = h;
    const res = moveBody(this.pos, this.vel, dt, this.r, h, 0.55); this.onGround = res.onGround; this.surface = res.groundMat;
    if (!wasOn && res.onGround && this.fallV < -9) { const d = (-this.fallV - 9) * 6; this.damage(d, 'lleg', 999, null, true); this.damage(d, 'rleg', 999, null, true); Audio.hurt(); }
    this.fallV = this.vel.y;
    // footsteps
    const hs = Math.hypot(this.vel.x, this.vel.z);
    if (this.onGround && hs > 0.5) { this.stepDist += hs * dt; const stride = sprint ? 2.5 : this.crouch ? 1.4 : 1.9; if (this.stepDist > stride) { this.stepDist = 0; Audio.step(this.pos, this.surface, sprint, true); if (!this.crouch) AI.hear(this.pos, sprint ? 30 : 14, 'step'); } }
    this.bob += hs * dt * (sprint ? 1.6 : 1.3);
    // ---- health ticks
    if (this.bleedL > 0) this.bleedDmg(dt * 0.6 * this.bleedL); if (this.bleedH > 0) this.bleedDmg(dt * 1.7 * this.bleedH);
    if (this.pain > 0) this.pain -= dt;
    if (this.heal) this.updateHeal(dt);
    // ---- weapons
    this.updateWeapon(dt, sprint, moving);
    // ---- camera
    const eye = this.pos.y + lerp(1.65, 1.1, this.crouchT) + Math.sin(this.bob * 2) * 0.02 * Math.min(1, hs);
    const lx = this.lean * 0.32, rx = cy * lx, rz = -sy * lx;
    cam.position.set(this.pos.x + rx, eye, this.pos.z + rz);
    cam.rotation.order = 'YXZ'; cam.rotation.set(this.pitch + this.recoilP, this.yaw + this.recoilY, -this.lean * 0.22);
    Audio.listener.pos.copy(cam.position); Audio.listener.yaw = this.yaw;
    // ---- meds / inventory hotkeys
    if (I.hit('Digit4')) this.useMed('bandage'); if (I.hit('Digit5')) this.useMed('kit'); if (I.hit('Digit6')) this.useMed('pain');
    if (I.hit('KeyL') && this.wmesh && this.wmesh.userData.lightPos) { this.torchOn = !this.torchOn; this.torch.intensity = this.torchOn ? 60 : 0; Audio.click(); }
  },
  bleedDmg(d) { const alive = PARTS.filter(p => this.hp[p] > 0 && p !== 'head'); if (!alive.length) return; const p = pick(alive); this.hp[p] -= d; if (this.hp[p] <= 0) { this.hp[p] = 0; if (p === 'thorax') this.die('bleeding out'); } },
  // ------------------------------------------------ weapons
  updateWeapon(dt, sprint, moving) {
    const I = Input, w = this.weapon, st = this.stats;
    // switching
    if ((I.hit('Digit1') && this.cur !== 0 && this.weapons[0]) || (I.hit('Digit2') && this.cur !== 1 && this.weapons[1]) || (I.mouse.wheel && this.weapons[1 - this.cur])) { if (!this.reload && !this.heal) { this.cur = 1 - this.cur; this.switchT = 0.55; this.reload = null; this.setWeaponMesh(); Audio.reloadStep(1); Game.updateAmmoHud(); } }
    if (this.switchT > 0) this.switchT -= dt;
    this.fireTimer -= dt; if (this.bolt > 0) { this.bolt -= dt; if (this.bolt <= 0 && w) Audio.reloadStep(2); }
    // ADS
    const canAds = w && !sprint && !this.reload && this.switchT <= 0 && !this.heal;
    this.adsHold = I.mouse.r && canAds;
    const adsSpd = st ? 1 / (st.adsTime * (this.fracArm && this.pain <= 0 ? 1.6 : 1)) : 5;
    this.ads = clamp(this.ads + (this.adsHold ? dt * adsSpd : -dt * adsSpd * 1.3), 0, 1);
    const scoped = st && st.flags.scope;
    const fov = scoped ? (this.ads > 0.5 ? lerp(BASE_FOV, BASE_FOV / st.zoom, (this.ads - 0.5) * 2) : BASE_FOV) : lerp(BASE_FOV, 58, this.ads);
    if (Math.abs(this.camera.fov - fov) > 0.01) { this.camera.fov = fov; this.camera.updateProjectionMatrix(); }
    $('scope').style.display = st && st.flags.scope && this.ads > 0.85 ? 'block' : 'none';
    $('xh').className = this.ads > 0.6 ? 'ads' : '';
    // reload
    if (this.reload) {
      this.reload.t += dt; const r = this.reload;
      if (!r.s1 && r.t > r.dur * 0.2) { r.s1 = true; Audio.reloadStep(0); } if (!r.s2 && r.t > r.dur * 0.6) { r.s2 = true; Audio.reloadStep(1); } if (!r.s3 && r.t > r.dur * 0.9) { r.s3 = true; Audio.reloadStep(2); }
      if (r.t >= r.dur) { const need = st.magSize - w.rt.mag, n = Math.min(need, w.rt.reserve); w.rt.mag += n; w.rt.reserve -= n; this.reload = null; Game.updateAmmoHud(); }
    } else if (I.hit('KeyR') && w && w.rt.reserve > 0 && w.rt.mag < st.magSize && this.switchT <= 0 && !this.heal) {
      const base = st.kind === 'pistol' ? 1.7 : st.kind === 'shotgun' ? 0.7 * (st.magSize - w.rt.mag) + 0.5 : st.kind === 'sniper' ? 3.4 : 2.5;
      this.reload = { t: 0, dur: base * lerp(1.35, 0.8, st.ergo / 100) * (this.fracArm && this.pain <= 0 ? 1.5 : 1) * (this.hp.larm <= 0 || this.hp.rarm <= 0 ? 1.4 : 1) };
    }
    if (I.hit('KeyB') && w && st.modes.length > 1) { const i = st.modes.indexOf(w.rt.mode); w.rt.mode = st.modes[(i + 1) % st.modes.length]; Audio.click(); Game.updateAmmoHud(); }
    // fire
    const wantFire = w && (w.rt.mode === 'auto' ? I.mouse.l : I.mouse.lPressed);
    if (wantFire && this.fireTimer <= 0 && !this.reload && this.switchT <= 0 && this.bolt <= 0 && !this.heal && !sprint) {
      if (w.rt.mag > 0) this.fire(); else if (I.mouse.lPressed) { Audio.click(); if (w.rt.reserve > 0) Game.notify('Magazine empty — press R'); else Game.notify('No ammo left for ' + st.name); }
    }
    // recoil recovery
    this.recoilP = lerp(this.recoilP, 0, Math.min(1, dt * 9)); this.recoilY = lerp(this.recoilY, 0, Math.min(1, dt * 9));
    // ---- viewmodel pose
    if (this.wmesh) {
      const ud = this.wmesh.userData, aim = ud.aim;
      const S = VM_SCALE, hip = V3(0.17, -0.19, -0.45), adsP = V3(-aim.x * S, -aim.y * S, -0.24 - aim.z * S);
      this.wmesh.visible = !(scoped && this.ads > 0.85); // full-screen scope view replaces the weapon
      const lower = Math.max(this.switchT > 0 ? Math.min(1, this.switchT / 0.55) : 0, sprint ? 0.5 : 0, this.heal ? 0.8 : 0, this.reload ? 0.25 : 0);
      this.weaponsLowered = lerp(this.weaponsLowered, lower, Math.min(1, dt * 8));
      const p = hip.clone().lerp(adsP, this.ads); p.y -= this.weaponsLowered * 0.25; p.x += this.weaponsLowered * 0.06;
      // sway + bob
      this.swayT += dt * (this.stamina < 20 ? 2.4 : 1.1); const sw = st.sway * (1 - this.ads * 0.7) * (this.fracArm && this.pain <= 0 ? 2 : 1) * 0.006;
      const bobA = Math.min(1, Math.hypot(this.vel.x, this.vel.z) / 4) * (1 - this.ads * 0.8);
      p.x += Math.sin(this.swayT) * sw + Math.sin(this.bob * 1) * 0.012 * bobA; p.y += Math.cos(this.swayT * 1.3) * sw + Math.abs(Math.cos(this.bob * 1)) * 0.01 * bobA;
      p.add(this.vmKick);
      this.wmesh.position.copy(p);
      this.wmesh.rotation.set(this.vmRot.x + this.weaponsLowered * 0.5 - this.ads * 0, lerp(-0.06, 0, this.ads) + this.vmRot.y, lerp(0.02, 0, this.ads) + this.vmRot.z);
      this.vmKick.multiplyScalar(Math.max(0, 1 - dt * 12)); this.vmRot.multiplyScalar(Math.max(0, 1 - dt * 12));
      // muzzle flash decay
      this.flash.intensity *= Math.max(0, 1 - dt * 30); if (this.flash.intensity < 0.5) this.flashMesh.visible = false;
      // laser
      if (ud.laserPos && this.ads < 0.98) {
        const o = this.wmesh.localToWorld(ud.laserPos.clone()), d = V3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const hit = World.raycast(o, d, 80), ah = AI.rayHit(o, d, hit ? hit.dist : 80), L = ah ? ah.dist : hit ? hit.dist : 80;
        const pts = this.laser.geometry.attributes.position; pts.setXYZ(0, o.x, o.y, o.z); const e = o.clone().addScaledVector(d, L); pts.setXYZ(1, e.x, e.y, e.z); pts.needsUpdate = true; this.laser.visible = true; this.laserDot.visible = true; this.laserDot.position.copy(e);
      } else { this.laser.visible = false; this.laserDot.visible = false; }
    }
  },
  fire() {
    const w = this.weapon, st = this.stats, cam = this.camera; w.rt.mag--; this.fireTimer = 60 / st.rpm; this.shotsFired++;
    if (st.modes[0] === 'bolt') this.bolt = 0.9;
    // recoil
    const kick = st.recV * 0.00015 * rnd(0.85, 1.15) * (this.ads > 0.5 ? 0.85 : 1) * (this.crouch ? 0.85 : 1) * (this.hp.larm <= 0 || this.hp.rarm <= 0 ? 1.5 : 1);
    this.recoilP += kick; this.pitch += kick * 0.25; this.recoilY += (Math.random() - 0.5) * st.recH * 0.0002;
    this.vmKick.z += 0.03 + st.recV * 0.0002; this.vmKick.y += 0.004; this.vmRot.x += 0.02 + st.recV * 0.00025; this.vmRot.z += (Math.random() - 0.5) * 0.03;
    // spread
    const hs = Math.hypot(this.vel.x, this.vel.z);
    const moa = st.moa * (Math.PI / 180 / 60), hipS = (0.022 * st.hip + hs * 0.004 + (this.onGround ? 0 : 0.03)) * (1 - this.ads), spread = moa + hipS + (this.fracArm && this.pain <= 0 ? 0.01 : 0);
    const origin = cam.position.clone(), fwd = V3(0, 0, -1).applyQuaternion(cam.quaternion);
    for (let i = 0; i < st.pellets; i++) {
      const s = st.pellets > 1 ? spread + 0.025 : spread;
      const d = fwd.clone(); d.x += (Math.random() - 0.5) * 2 * s; d.y += (Math.random() - 0.5) * 2 * s; d.z += (Math.random() - 0.5) * 2 * s; d.normalize();
      const hit = World.raycast(origin, d, 500), ah = AI.rayHit(origin, d, hit ? hit.dist : 500);
      if (ah) { this.hits++; const falloff = clamp(1 - Math.max(0, ah.dist - 60) / 250, 0.5, 1); AI.damage(ah.scav, st.dmg * falloff, st.pen, ah.part, this, ah.point); Audio.impact(ah.point, 'flesh'); FX.blood(ah.point); }
      else if (hit) { Audio.impact(hit.point, hit.mat); FX.impact(hit.point, hit.normal, hit.mat); if (hit.collider && hit.collider.door && Math.random() < 0.2) { } }
    }
    // audio & flash & noise
    Audio.shot(st.kind, st.flags.sup, null); AI.hear(this.pos, st.noiseRange, 'shot', this);
    if (this.wmesh) { this.flash.intensity = st.flash * 6 * (st.flags.sup ? 0.3 : 1); this.flash.position.copy(this.wmesh.userData.muzzle).applyMatrix4(this.wmesh.matrix); this.flashMesh.position.copy(this.wmesh.userData.muzzle).applyMatrix4(this.wmesh.matrix); this.flashMesh.visible = st.flash > 0.2; this.flashMesh.scale.setScalar(rnd(0.6, 1.3) * st.flash); }
    Game.updateAmmoHud();
  },
  // ------------------------------------------------ damage
  damage(dmg, part, pen, from, silent) {
    if (this.dead) return;
    let cls = 0; if (part === 'thorax' || part === 'stomach') cls = (GEAR.armor.find(a => a.id === this.gear.armor) || {}).cls || 0; if (part === 'head') cls = (GEAR.helmet.find(a => a.id === this.gear.helmet) || {}).cls || 0;
    if (cls > 0) { const need = cls * 10; dmg *= pen >= need ? 0.82 : clamp(0.12 + 0.5 * pen / need, 0.12, 0.65); }
    if (this.hp[part] <= 0) { // blacked: damage spreads
      part = pick(PARTS.filter(p => this.hp[p] > 0 && p !== 'head')) || 'thorax'; dmg *= 1.3;
    }
    this.hp[part] -= dmg;
    if (this.hp[part] <= 0) {
      const over = -this.hp[part]; this.hp[part] = 0;
      if (part === 'head' || part === 'thorax') { this.die(from ? 'Killed by ' + from.name : 'Killed'); return; }
      this.hp.thorax -= over * 0.7; if (this.hp.thorax <= 0) { this.hp.thorax = 0; this.die(from ? 'Killed by ' + from.name : 'Killed'); return; }
      if (part === 'lleg' || part === 'rleg') this.fracLeg = true; if (part === 'larm' || part === 'rarm') this.fracArm = true;
    }
    if (!silent) {
      if (dmg > 8 && Math.random() < 0.35) this.bleedL = Math.min(3, this.bleedL + 1); if (dmg > 28 && Math.random() < 0.15) this.bleedH = Math.min(2, this.bleedH + 1);
      if ((part === 'lleg' || part === 'rleg') && dmg > 22 && Math.random() < 0.3) this.fracLeg = true; if ((part === 'larm' || part === 'rarm') && dmg > 22 && Math.random() < 0.3) this.fracArm = true;
      Audio.hurt(); Game.flashDamage();
    }
    Game.updateHealthHud();
  },
  die(reason) { if (this.dead) return; this.dead = true; Audio.death(); Game.playerDied(reason); },
  // ------------------------------------------------ meds
  useMed(kind) {
    if (this.heal || this.reload || this.dead) return;
    const it = this.inv.find(i => i.kind === 'med' && i.med === kind); if (!it) { Game.notify('No ' + (kind === 'kit' ? 'medkit' : kind === 'pain' ? 'painkillers' : 'bandage') + ' in inventory'); return; }
    if (kind === 'bandage' && this.bleedL <= 0 && this.bleedH <= 0) { Game.notify('Not bleeding'); return; }
    if (kind === 'kit' && this.totalHp() >= 440 && !this.bleedH && !(it.heavy && (this.fracLeg || this.fracArm))) { Game.notify('Health is full'); return; }
    this.heal = { it, t: 0, dur: kind === 'bandage' ? 2.0 : kind === 'pain' ? 1.6 : it.heavy ? 4.0 : 3.0 }; Audio.zipper();
  },
  updateHeal(dt) {
    const h = this.heal; h.t += dt; Game.showProgress(h.t / h.dur, 'USING ' + h.it.name.toUpperCase());
    if (h.t < h.dur) return;
    const it = h.it;
    if (it.med === 'bandage') { if (this.bleedL > 0) this.bleedL--; else if (this.bleedH > 0) this.bleedH--; this.consume(it); }
    else if (it.med === 'pain') { this.pain = 90; this.consume(it); }
    else { // kit: heals worst parts with a pool, fixes heavy bleeds/fractures if heavy kit
      let pool = it.hp; if (it.heavy) { this.bleedH = 0; this.fracLeg = this.fracArm = false; pool -= 30; } this.bleedL = 0;
      const order = PARTS.slice().sort((a, b) => (this.hp[a] / PART_MAX[a]) - (this.hp[b] / PART_MAX[b]));
      for (const p of order) { if (pool <= 0) break; const need = PART_MAX[p] - this.hp[p]; if (need <= 0) continue; const cost = this.hp[p] <= 0 ? 2 : 1; const give = Math.min(need, pool / cost); this.hp[p] += give; pool -= give * cost; }
      it.hp = Math.max(0, pool); if (it.hp < 15) this.consume(it); else it.name = it.name.replace(/ \(\d+\)$/, '') + ` (${Math.round(it.hp)})`;
    }
    Audio.heal(); this.heal = null; Game.hideProgress(); Game.updateHealthHud();
  },
  consume(it) { const i = this.inv.indexOf(it); if (i >= 0) this.inv.splice(i, 1); },
};
