// Headless test: drives the game deterministically (manual fixed-step updates) and checks every raid mechanic.
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
const here = path.dirname(fileURLToPath(import.meta.url));
const url = 'file://' + path.resolve(here, '..', 'customs.html');
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => { if (!/pointer lock/i.test(e.message)) errors.push('PAGEERROR: ' + e.message + '\n' + e.stack); });
await page.goto(url);
await page.waitForFunction(() => window.__G, null, { timeout: 60000 });
const ev = (fn, ...args) => page.evaluate(fn, ...args);
const step = (n, dt = 1 / 30) => ev(([n, dt]) => { const G = window.__G; for (let i = 0; i < n; i++) { G.Game.updateRaid(dt); G.Input.endFrame(); } }, [n, dt]);
const shot = async name => { await ev(() => { const G = window.__G; G.Game.renderer.render(G.Game.scene, G.Game.camera); }); await page.screenshot({ path: `/tmp/t_${name}.png` }); };
let fails = 0; const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };

console.log('world:', await ev(() => { const W = window.__G.World; return { colliders: W.colliders.length, nav: W.navPoints.length, doors: W.doors.length, lootspots: W.containers.length, extracts: W.extracts.length }; }));
await page.click('#startBtn'); await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/t_menu.png' });
// ---- modding
const stats = await ev(() => {
  const { Profile, Menu, weaponStats } = window.__G; const w = Profile.weapon(Profile.data.sel.primary); const before = weaponStats(w);
  Menu.installMod(w, 'muzzle', 'sup'); Menu.installMod(w, 'sight', 'reflex'); Menu.installMod(w, 'handguard', 'rail'); Menu.installMod(w, 'grip', 'vert'); Menu.installMod(w, 'mag', 'ext');
  const after = weaponStats(w); return { before: [before.recV, before.ergo, before.magSize, before.noiseRange], after: [after.recV, after.ergo, after.magSize, after.noiseRange], rub: Profile.data.rubles, mods: w.mods, sup: after.flags.sup };
});
check(stats.after[0] < stats.before[0] && stats.after[2] === 45 && stats.sup && stats.rub < 160000, 'modding changes stats and costs roubles ' + JSON.stringify(stats.after));
// every weapon × every mod combo builds a mesh without throwing
const meshOk = await ev(() => { const { WEAPONS, MODS, newWeapon, buildWeaponMesh, weaponStats } = window.__G; let n = 0; for (const t in WEAPONS) for (const slot in WEAPONS[t].slots) for (const id of WEAPONS[t].slots[slot]) { const w = newWeapon(t); w.mods[slot] = id; if (slot === 'grip') w.mods.handguard = 'rail'; buildWeaponMesh(w); weaponStats(w); n++; } return n; });
check(meshOk > 60, 'built ' + meshOk + ' weapon/mod meshes');
await page.screenshot({ path: '/tmp/t_modded.png' });
await page.click('.tabs button[data-tab="gear"]'); await page.click('.tabs button[data-tab="stash"]'); await page.click('.tabs button[data-tab="weapons"]');
// ---- deploy, then take over the loop
await page.click('#deploy'); await page.waitForTimeout(300);
await ev(() => { const G = window.__G; G.Game.loop = () => {}; G.Input.locked = true; document.exitPointerLock = () => {}; const od = G.Player.die.bind(G.Player); G.Player.die = r => { console.warn('PLAYER DIED:', r, 'hp', JSON.stringify(G.Player.hp), new Error().stack.split('\n').slice(1, 5).join(' | ')); od(r); }; });
page.on('console', m => { if (m.type() === 'warning' && /PLAYER DIED/.test(m.text())) console.log('  >>', m.text()); });
const st = await ev(() => { const G = window.__G; return { state: G.Game.state, pos: G.Player.pos.toArray(), scavs: G.AI.scavs.length, containers: G.World.containers.length, extracts: G.Game.activeExtracts.map(e => e.name), weapon: G.Player.weapon.type, mag: G.Player.weapon.rt.mag }; });
console.log('raid:', JSON.stringify(st));
check(st.state === 'raid' && st.scavs === 15 && st.containers > 100 && st.extracts.length >= 2 && st.mag === 45, 'raid started with scavs, containers, extracts');
// ---- movement: sprint forward 3 s
const p0 = await ev(() => window.__G.Player.pos.toArray());
await ev(() => { const I = window.__G.Input; I.keys['KeyW'] = true; I.keys['ShiftLeft'] = true; });
await step(90);
const p1 = await ev(() => { const G = window.__G; G.Input.keys['ShiftLeft'] = false; G.Input.keys['KeyW'] = false; return { pos: G.Player.pos.toArray(), stam: G.Player.stamina }; });
const moved = Math.hypot(p1.pos[0] - p0[0], p1.pos[2] - p0[2]);
check(moved > 10 && p1.stam < 100, `sprinted ${moved.toFixed(1)} m, stamina ${p1.stam.toFixed(0)}`);
// ---- fire (auto), ADS, reload
await ev(() => { const I = window.__G.Input; I.mouse.l = true; I.mouse.lPressed = true; I.mouse.r = true; });
await step(30);
const f1 = await ev(() => { const G = window.__G; G.Input.mouse.l = false; G.Input.mouse.r = false; return { mag: G.Player.weapon.rt.mag, fired: G.Player.shotsFired, ads: G.Player.ads, fov: G.Game.camera.fov }; });
check(f1.fired > 5 && f1.mag === 45 - f1.fired && f1.ads > 0.9 && f1.fov < 70, 'full-auto fire + ADS ' + JSON.stringify(f1));
await ev(() => { const I = window.__G.Input; I.pressed['KeyR'] = true; });
await step(120);
const f2 = await ev(() => { const G = window.__G; return { mag: G.Player.weapon.rt.mag, res: G.Player.weapon.rt.reserve }; });
check(f2.mag === 45 && f2.res === 135 - f1.fired, 'reload refills mag from reserve ' + JSON.stringify(f2));
// fire mode toggle + weapon switch
await ev(() => { window.__G.Input.pressed['KeyB'] = true; }); await step(1);
const mode = await ev(() => window.__G.Player.weapon.rt.mode);
await ev(() => { window.__G.Input.pressed['Digit2'] = true; }); await step(30);
const sw = await ev(() => window.__G.Player.weapon.type);
await ev(() => { window.__G.Input.pressed['Digit1'] = true; }); await step(30);
check(mode === 'semi' && sw === 'pm', 'fire mode toggle + switch to pistol');
await shot('raid');
// ---- loot a container
const loot = await ev(() => {
  const G = window.__G, P = G.Player, W = G.World; for (const s of G.AI.scavs) { s.dead = true; G.World.scene.remove(s.g); }
  const aimAt = c => { P.pos.set(c.x, c.y, c.z + 1.3); P.yaw = 0; P.pitch = Math.atan2((c.y + c.def.size[1] / 2) - (c.y + 1.65), 1.3); P.vel.set(0, 0, 0); const eye = new G.THREE.Vector3(P.pos.x, P.pos.y + 1.65, P.pos.z), d = new G.THREE.Vector3(0, -Math.sin(-P.pitch), -Math.cos(P.pitch)).normalize(); const h = W.raycast(eye, d, 2.6); return h && h.collider && h.collider.container === c; };
  const c = W.containers.find(c => c.type !== 'corpse' && c.y < 0.5 && Math.abs(c.ry) < 0.1 && c.items.length && W.pointFree(c.x, 0, c.z + 1.3, 0.4) && aimAt(c));
  aimAt(c);
  return { c: c.def.name, items: c.items.map(i => i.name), at: [c.x, c.y, c.z] };
});
await step(2);
const prompt1 = await ev(() => document.getElementById('prompt').innerHTML);
await ev(() => { window.__G.Input.pressed['KeyF'] = true; }); await step(150);
const lootState = await ev(() => { const G = window.__G; return { open: !!G.Game.lootOpen, vis: document.getElementById('loot').style.display }; });
await ev(() => { window.__G.Input.pressed['KeyF'] = true; }); await step(2);
const inv = await ev(() => window.__G.Player.inv.map(i => i.name));
check(/Search/.test(prompt1) && lootState.open && inv.length >= 3 + Math.min(loot.items.length, 1), `loot: prompt "${prompt1.replace(/<[^>]+>/g, '')}", opened=${lootState.open}, inv=${JSON.stringify(inv)} target=${JSON.stringify(loot)}`);
await shot('loot');
// ---- door
const door = await ev(() => { const G = window.__G, d = G.World.doors.find(d => d.along === 'x' && G.World.pointFree(d.x, 0, d.z + 1.3, 0.4)); G.Player.pos.set(d.x, 0, d.z + 1.3); G.Player.yaw = 0; G.Player.pitch = 0; G.Player.vel.set(0, 0, 0); return { d: [d.x, d.z], i: G.World.doors.indexOf(d) }; });
await step(2);
const dprompt = await ev(() => document.getElementById('prompt').innerHTML);
await ev(() => { window.__G.Input.pressed['KeyF'] = true; }); await step(20);
const dopen = await ev(i => window.__G.World.doors[i].open, door.i);
// walk through the open door
await ev(() => { window.__G.Input.keys['KeyW'] = true; }); await step(40);
const dz = await ev(() => { window.__G.Input.keys['KeyW'] = false; return window.__G.Player.pos.z; });
check(/door/i.test(dprompt) && dopen && dz < door.d[1] - 0.5, `door opened and walked through (z ${dz.toFixed(2)} vs door ${door.d[1]}) prompt="${dprompt.replace(/<[^>]+>/g, '')}" open=${dopen} door=${JSON.stringify(door)}`);
// ---- stairs: climb 2-storey dorms
await ev(() => { const P = window.__G.Player; P.pos.set(129.2, 0, -78.5); P.yaw = -Math.PI / 2; P.pitch = 0; P.vel.set(0, 0, 0); window.__G.Input.keys['KeyW'] = true; });
await step(90);
const up = await ev(() => { const G = window.__G; G.Input.keys['KeyW'] = false; return { pos: G.Player.pos.toArray(), onGround: G.Player.onGround }; });
check(up.pos[1] > 3.0 && up.onGround, 'climbed stairs to level 1: ' + JSON.stringify(up.pos.map(v => +v.toFixed(2))));
await shot('stairs');
// ---- combat on the open road
await ev(() => { const G = window.__G, P = G.Player; P.pos.set(60, 0, 0); P.yaw = Math.PI / 2; P.pitch = -0.05; P.vel.set(0, 0, 0); for (const s of G.AI.scavs) { s.dead = true; G.World.scene.remove(s.g); } const s = G.AI.spawn(48, 0); s.yaw = -Math.PI / 2; s.armor = 0; s.helmet = 0; P.weapon.rt.mag = 45; P.weapon.rt.mode = 'auto'; P.hp.thorax = 85; });
await step(3);
await ev(() => { const I = window.__G.Input; I.mouse.l = true; I.mouse.lPressed = true; });
await step(75);
const c2 = await ev(() => { const G = window.__G; G.Input.mouse.l = false; return { kills: G.Player.kills, hits: G.Player.hits, fired: G.Player.shotsFired, corpses: G.AI.corpses.length, php: G.Player.totalHp(), dead: G.Player.dead, corpseItems: G.AI.corpses[0] && G.AI.corpses[0].items.map(i => i.name) }; });
check(c2.kills >= 1 && c2.corpses >= 1 && c2.corpseItems && c2.corpseItems.length >= 1, 'killed a scav, corpse is lootable ' + JSON.stringify(c2));
await shot('combat');
// loot the corpse
await ev(() => { const G = window.__G, c = G.AI.corpses[0]; G.Player.pos.set(c.x, 0, c.z + 1.5); G.Player.yaw = 0; G.Player.pitch = -0.9; G.Player.vel.set(0, 0, 0); });
await step(2); await ev(() => { window.__G.Input.pressed['KeyF'] = true; }); await step(150); await ev(() => { window.__G.Input.pressed['KeyF'] = true; }); await step(2);
const inv2 = await ev(() => window.__G.Player.inv.map(i => i.name));
check(inv2.length > inv.length, 'looted the corpse: ' + JSON.stringify(inv2));
// ---- misc controls: crouch, jump, lean, inventory discard, flashlight, extract list
const misc = await ev(() => { const G = window.__G, P = G.Player, I = G.Input; P.pos.set(60, 0, 0); P.vel.set(0, 0, 0); const out = {};
  I.pressed['KeyC'] = true; for (let i = 0; i < 20; i++) { G.Game.updateRaid(1 / 30); I.endFrame(); } out.crouchH = P.h; I.pressed['KeyC'] = true; for (let i = 0; i < 20; i++) { G.Game.updateRaid(1 / 30); I.endFrame(); } out.standH = P.h;
  I.pressed['Space'] = true; let maxY = 0; for (let i = 0; i < 30; i++) { G.Game.updateRaid(1 / 30); I.endFrame(); maxY = Math.max(maxY, P.pos.y); } out.jumpY = maxY; out.landed = P.pos.y === 0;
  I.keys['KeyQ'] = true; for (let i = 0; i < 20; i++) { G.Game.updateRaid(1 / 30); I.endFrame(); } out.lean = P.lean; I.keys['KeyQ'] = false;
  const n = P.inv.length; I.pressed['Tab'] = true; G.Game.updateRaid(1 / 30); I.endFrame(); out.invOpen = G.Game.invOpen && document.getElementById('inv').style.display === 'block'; I.pressed['Digit1'] = true; G.Game.updateRaid(1 / 30); I.endFrame(); out.discarded = P.inv.length === n - 1; I.pressed['Tab'] = true; G.Game.updateRaid(1 / 30); I.endFrame();
  P.weapon.mods.tactical = 'light'; P.setWeaponMesh(); out.torchOn = P.torch.intensity > 0; I.pressed['KeyL'] = true; G.Game.updateRaid(1 / 30); I.endFrame(); out.torchOff = P.torch.intensity === 0;
  I.pressed['KeyO'] = true; G.Game.updateRaid(1 / 30); I.endFrame(); out.exList = document.getElementById('extracts').style.display; return out; });
check(misc.crouchH < 1.3 && misc.standH > 1.7 && misc.jumpY > 0.5 && misc.landed && misc.lean < -0.9 && misc.invOpen && misc.discarded && misc.torchOn && misc.torchOff, 'crouch/jump/lean/inventory/flashlight/extract list ' + JSON.stringify(misc));
// ---- scav shoots the player: damage, bleed, heal
const dmg = await ev(() => { const G = window.__G, P = G.Player; P.pos.set(60, 0, 0); P.vel.set(0, 0, 0); for (const p of ['head','thorax','stomach','larm','rarm','lleg','rleg']) P.hp[p] = { head: 35, thorax: 85, stomach: 70, larm: 60, rarm: 60, lleg: 65, rleg: 65 }[p]; const before = P.totalHp(); P.damage(40, 'stomach', 30, { name: 'Test' }); P.bleedL = 1; return { before, after: P.totalHp(), bleed: P.bleedL, bandages: P.inv.filter(i => i.med === 'bandage').length }; });
await step(2);
await ev(() => { window.__G.Input.pressed['Digit4'] = true; }); await step(80);
const healed = await ev(() => { const P = window.__G.Player; return { bleed: P.bleedL, bandages: P.inv.filter(i => i.med === 'bandage').length }; });
await ev(() => { window.__G.Input.pressed['Digit5'] = true; }); await step(130);
const healed2 = await ev(() => window.__G.Player.totalHp());
check(dmg.after < dmg.before && healed.bleed === 0 && healed.bandages === dmg.bandages - 1 && healed2 > dmg.after, `damage ${dmg.before}->${dmg.after}, bandage stops bleed, medkit heals to ${healed2.toFixed(0)}`);
// ---- AI perception: scav in the open sees & shoots the player
await ev(() => { const G = window.__G, P = G.Player; P.pos.set(60, 0, 0); P.yaw = Math.PI / 2; P.vel.set(0, 0, 0); P.gear.armor = 'slick'; P.gear.helmet = 'altyn'; for (const p in P.hp) P.hp[p] = { head: 35, thorax: 85, stomach: 70, larm: 60, rarm: 60, lleg: 65, rleg: 65 }[p]; const s = G.AI.spawn(40, 0); s.yaw = -Math.PI / 2; s.armor = 0; });
const hpBefore = await ev(() => window.__G.Player.totalHp());
await step(150);
const ai = await ev(() => { const G = window.__G, s = G.AI.scavs[G.AI.scavs.length - 1]; return { state: s.state, mag: s.mag, magSize: s.st.magSize, php: G.Player.totalHp(), dead: G.Player.dead }; });
check(ai.state === 'combat' && (ai.mag < ai.magSize || ai.php < hpBefore) && !ai.dead, 'scav engaged the player ' + JSON.stringify(ai));
// ---- extraction
await ev(() => { const G = window.__G, e = G.Game.activeExtracts.find(e => !e.cost) || G.Game.activeExtracts[0]; G.Player.pos.set(e.x, 0, e.z); G.Player.vel.set(0, 0, 0); for (const s of G.AI.scavs) { s.dead = true; G.World.scene.remove(s.g); } G.Player.hp.thorax = 85; G.Player.hp.head = 35; });
await step(400);
const end = await ev(() => { const G = window.__G; return { state: G.Game.state, title: document.getElementById('endTitle').textContent, sub: document.getElementById('endSub').textContent, rub: G.Profile.data.rubles, weapons: G.Profile.data.weapons.length, stash: G.Profile.data.stash.length, raids: G.Profile.data.stats.raids }; });
check(end.state === 'end' && end.title === 'SURVIVED' && end.weapons === 3, 'extracted, weapons + loot back in stash ' + JSON.stringify(end));
await page.screenshot({ path: '/tmp/t_end.png' });
await page.click('#endBtn'); await page.waitForTimeout(300);
const menuOk = await ev(() => ({ state: window.__G.Game.state, deploy: document.getElementById('deploy').disabled, stash: document.getElementById('stashList').children.length }));
check(menuOk.state === 'menu' && !menuOk.deploy, 'back in hideout, can deploy again ' + JSON.stringify(menuOk));
// ---- second raid: die, lose gear
await page.click('#deploy'); await page.waitForTimeout(300);
await ev(() => { const G = window.__G; G.Game.loop = () => {}; G.Input.locked = true; G.Player.damage(500, 'thorax', 100, { name: 'Test' }); });
await page.waitForTimeout(2200);
const death = await ev(() => ({ state: window.__G.Game.state, title: document.getElementById('endTitle').textContent, sub: document.getElementById('endSub').textContent, weapons: window.__G.Profile.data.weapons.length }));
check(death.state === 'end' && death.title === 'KILLED IN ACTION' && death.weapons === 1, 'death loses carried weapons ' + JSON.stringify(death));
await page.click('#endBtn'); await page.waitForTimeout(200);
const scavBtn = await ev(() => ({ deploy: document.getElementById('deploy').disabled, scav: document.getElementById('scavRun').disabled }));
check(scavBtn.deploy && !scavBtn.scav, 'no weapons -> deploy disabled, scav run available');
await page.click('#scavRun'); await page.waitForTimeout(300);
const scavRaid = await ev(() => ({ state: window.__G.Game.state, w: window.__G.Player.weapon && window.__G.Player.weapon.type }));
check(scavRaid.state === 'raid' && scavRaid.w, 'scav run started with ' + scavRaid.w);
// long soak: run 3 minutes of game time quickly to shake out AI/physics errors
await ev(() => { const G = window.__G; G.Game.loop = () => {}; G.Input.locked = true; G.Input.keys['KeyW'] = true; });
for (let i = 0; i < 20; i++) { await step(270, 1 / 30); await ev(() => { window.__G.Player.yaw += 1.3; const P = window.__G.Player; P.hp.thorax = 85; P.hp.head = 35; }); }
const soak = await ev(() => { const G = window.__G; return { t: G.Game.time.toFixed(0), scavs: G.AI.scavs.length, corpses: G.AI.corpses.length, spawned: G.AI.spawnedTotal, pos: G.Player.pos.toArray().map(v => +v.toFixed(1)), stuckScavs: G.AI.scavs.filter(s => s.stuck > 0.3).length, states: G.AI.scavs.reduce((a, s) => (a[s.state] = (a[s.state] || 0) + 1, a), {}) }; });
console.log('soak:', JSON.stringify(soak));
check(soak.t > 170, 'soak ran ' + soak.t + 's of game time');
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
console.log(fails ? `${fails} FAILURES` : 'ALL PASS');
await browser.close();
