
// ============================================================================
//  CUSTOMS MAP: buildings, roads, river, props, loot containers, extracts
// ============================================================================
const LOOT_ITEMS = [
  { id: 'bolts', name: 'Bolts', value: 9000, w: 0.3, r: 5 }, { id: 'nuts', name: 'Pack of nuts', value: 8000, w: 0.3, r: 5 },
  { id: 'screws', name: 'Screws', value: 5000, w: 0.2, r: 6 }, { id: 'tape', name: 'Duct tape', value: 6000, w: 0.2, r: 5 },
  { id: 'wires', name: 'Wires', value: 6500, w: 0.2, r: 5 }, { id: 'bulb', name: 'Light bulb', value: 4000, w: 0.1, r: 4 },
  { id: 'cord', name: 'Power cord', value: 6000, w: 0.3, r: 4 }, { id: 'caps', name: 'Capacitors', value: 11000, w: 0.2, r: 3 },
  { id: 'pliers', name: 'Pliers', value: 5500, w: 0.3, r: 4 }, { id: 'wrench', name: 'Wrench', value: 6000, w: 0.5, r: 3 },
  { id: 'tools', name: 'Toolset', value: 32000, w: 1.5, r: 1.2 }, { id: 'powder', name: 'Gunpowder "Kite"', value: 26000, w: 0.6, r: 1.2 },
  { id: 'tushonka', name: 'Tushonka beef stew', value: 12000, w: 0.5, r: 3, food: 1 }, { id: 'vodka', name: 'Tarkovskaya vodka', value: 16000, w: 1.0, r: 2 },
  { id: 'water', name: 'Water bottle', value: 8000, w: 0.6, r: 3 }, { id: 'cigs', name: 'Malboro cigarettes', value: 6000, w: 0.1, r: 4 },
  { id: 'chain', name: 'Gold chain', value: 45000, w: 0.1, r: 0.9 }, { id: 'roler', name: 'Roler Submariner watch', value: 130000, w: 0.1, r: 0.35 },
  { id: 'zibbo', name: 'Golden Zibbo lighter', value: 60000, w: 0.1, r: 0.5 }, { id: 'prokill', name: 'Prokill medallion', value: 120000, w: 0.1, r: 0.3 },
  { id: 'btc', name: 'Physical Bitcoin', value: 380000, w: 0.05, r: 0.09 }, { id: 'gpu', name: 'Graphics card', value: 260000, w: 1.0, r: 0.16 },
  { id: 'ledx', name: 'LEDX skin transilluminator', value: 520000, w: 0.3, r: 0.06 }, { id: 'intel', name: 'Intelligence folder', value: 190000, w: 0.5, r: 0.12 },
  { id: 'usd', name: 'Wad of dollars', value: 32000, w: 0.05, r: 1.2 }, { id: 'eur', name: 'Euros', value: 24000, w: 0.05, r: 1.2 },
  { id: 'rub', name: 'Roubles stack', value: 20000, w: 0.05, r: 2 }, { id: 'battery', name: 'Car battery', value: 28000, w: 12, r: 0.8 },
  { id: 'fuel', name: 'Fuel conditioner', value: 42000, w: 1.2, r: 0.8 }, { id: 'ssd', name: 'SSD drive', value: 55000, w: 0.1, r: 0.6 },
  { id: 'phone', name: 'Smartphone', value: 19000, w: 0.1, r: 1.5 }, { id: 'thermo', name: 'Thermometer', value: 15000, w: 0.1, r: 1.2 },
  { id: 'ifak', name: 'IFAK personal tactical kit', value: 22000, w: 0.4, r: 0.7, kind: 'med', med: 'kit', hp: 300, heavy: true },
  { id: 'salewa', name: 'Salewa first aid kit', value: 16000, w: 0.6, r: 0.8, kind: 'med', med: 'kit', hp: 400, heavy: true },
  { id: 'ai2', name: 'AI-2 medkit', value: 3000, w: 0.2, r: 2, kind: 'med', med: 'kit', hp: 100 },
  { id: 'bandage', name: 'Army bandage', value: 1500, w: 0.1, r: 3, kind: 'med', med: 'bandage' },
  { id: 'pain', name: 'Analgin painkillers', value: 2500, w: 0.05, r: 2, kind: 'med', med: 'pain' },
];
const LOOT_BY_ID = {}; for (const i of LOOT_ITEMS) LOOT_BY_ID[i.id] = i;
// container archetypes: pool describes which item classes appear
const CONTAINERS = {
  weaponbox: { name: 'Weapon box', size: [1.1, 0.35, 0.4], mat: 'wood', color: 0x5a6b3a, n: [1, 3], pool: 'weapons', time: 2.5 },
  medbag: { name: 'Medbag SMU06', size: [0.5, 0.3, 0.3], mat: 'flat', color: 0x8a2a2a, n: [1, 3], pool: 'meds', time: 2 },
  medcase: { name: 'Medcase', size: [0.7, 0.4, 0.4], mat: 'flat', color: 0xc8c8c0, n: [2, 4], pool: 'meds', time: 3 },
  jacket: { name: 'Jacket', size: [0.5, 0.9, 0.25], mat: 'flat', color: 0x3a3f2a, n: [1, 2], pool: 'jacket', time: 1.5, hang: true },
  safe: { name: 'Safe', size: [0.5, 0.6, 0.5], mat: 'metal', color: 0x555a60, n: [1, 3], pool: 'safe', time: 3.5 },
  cabinet: { name: 'Filing cabinet', size: [0.5, 1.4, 0.5], mat: 'metal', color: 0x9a9a92, n: [1, 3], pool: 'junk', time: 2.5 },
  duffle: { name: 'Duffle bag', size: [0.7, 0.35, 0.35], mat: 'flat', color: 0x3a3a2a, n: [1, 3], pool: 'duffle', time: 2 },
  toolbox: { name: 'Toolbox', size: [0.6, 0.3, 0.3], mat: 'flat', color: 0xa03020, n: [1, 3], pool: 'tools', time: 2 },
  pc: { name: 'PC block', size: [0.25, 0.5, 0.5], mat: 'flat', color: 0xc0b8a0, n: [1, 2], pool: 'pc', time: 3 },
  crate: { name: 'Wooden crate', size: [0.9, 0.7, 0.9], mat: 'wood', color: 0xb08050, n: [1, 3], pool: 'crate', time: 2.5 },
  cash: { name: 'Cash register', size: [0.4, 0.3, 0.4], mat: 'metal', color: 0x777777, n: [1, 2], pool: 'safe', time: 1.5 },
  drawer: { name: 'Drawer', size: [0.9, 0.7, 0.45], mat: 'wood', color: 0x8a6a4a, n: [1, 3], pool: 'junk', time: 2 },
};
const POOLS = {
  weapons: () => { const r = Math.random(); return r < 0.35 ? { weapon: pick(['pm', 'mp5', 'ak74n', 'akm', 'mp153', 'mosin', 'm4a1']) } : r < 0.7 ? { mod: 1 } : { ammo: 1 }; },
  meds: () => pick(['bandage', 'bandage', 'ai2', 'ai2', 'pain', 'salewa', 'ifak']),
  jacket: () => wpick([{ w: 4, id: 'rub' }, { w: 2, id: 'usd' }, { w: 2, id: 'eur' }, { w: 3, id: 'cigs' }, { w: 1, id: 'chain' }, { w: 0.4, id: 'roler' }, { w: 1.5, id: 'phone' }]).id,
  safe: () => wpick([{ w: 4, id: 'rub' }, { w: 3, id: 'usd' }, { w: 3, id: 'eur' }, { w: 1.5, id: 'chain' }, { w: 0.6, id: 'roler' }, { w: 0.25, id: 'btc' }, { w: 0.5, id: 'zibbo' }, { w: 0.3, id: 'prokill' }, { w: 0.2, id: 'intel' }]).id,
  junk: () => wpick(LOOT_ITEMS.filter(i => !i.kind && i.value < 40000).map(i => ({ w: i.r, id: i.id }))).id,
  duffle: () => Math.random() < 0.25 ? POOLS.meds() : wpick(LOOT_ITEMS.filter(i => !i.kind).map(i => ({ w: i.r, id: i.id }))).id,
  tools: () => wpick([{ w: 4, id: 'bolts' }, { w: 4, id: 'nuts' }, { w: 4, id: 'screws' }, { w: 3, id: 'pliers' }, { w: 3, id: 'wrench' }, { w: 2, id: 'tape' }, { w: 1, id: 'tools' }, { w: 0.8, id: 'powder' }, { w: 0.5, id: 'fuel' }]).id,
  pc: () => wpick([{ w: 4, id: 'caps' }, { w: 4, id: 'wires' }, { w: 3, id: 'cord' }, { w: 1.2, id: 'ssd' }, { w: 0.35, id: 'gpu' }, { w: 2, id: 'bulb' }]).id,
  crate: () => wpick([{ w: 4, id: 'tushonka' }, { w: 3, id: 'water' }, { w: 2, id: 'vodka' }, { w: 3, id: 'bolts' }, { w: 2, id: 'tape' }, { w: 1, id: 'powder' }, { w: 1.5, id: 'battery' }, { w: 1, ammo: 1 }]).id || 'ammo',
};

function makeItem(spec) {
  if (typeof spec === 'string') spec = spec === 'ammo' ? { ammo: 1 } : { id: spec };
  if (spec.id) { const b = LOOT_BY_ID[spec.id]; return { uid: uid(), id: b.id, name: b.name, value: b.value, w: b.w, kind: b.kind || 'loot', med: b.med, hp: b.hp, heavy: b.heavy }; }
  if (spec.weapon) { const w = newWeapon(spec.weapon, { mods: randomMods(spec.weapon, 0.35) }); return { uid: uid(), id: 'weapon', name: weaponLabel(w), value: Math.round(weaponValue(w) * 0.55), w: WEAPONS[spec.weapon].w, kind: 'weapon', weapon: w }; }
  if (spec.mod) { const slot = pick(SLOT_ORDER.filter(s => s !== 'mag')); const ids = Object.keys(MODS[slot]).filter(k => MODS[slot][k].price > 0); const id = pick(ids); const m = MODS[slot][id]; return { uid: uid(), id: 'mod', name: m.name + ' (mod)', value: Math.round(m.price * 0.65), w: m.w || 0.1, kind: 'mod', slot, mod: id }; }
  if (spec.ammo) { const cal = pick(Object.keys(AMMO)); const a = pick(AMMO[cal]); const n = cal === '12/70' ? 10 : cal === '7.62x54R' ? 20 : 30; return { uid: uid(), id: 'ammo', name: `${a.name} x${n}`, value: a.price * n, w: 0.012 * n, kind: 'ammo', ammoId: a.id, count: n }; }
  return makeItem('bolts');
}
function randomMods(type, p) {
  const d = WEAPONS[type], mods = {};
  for (const s in d.slots) { const opts = d.slots[s]; mods[s] = Math.random() < p ? pick(opts) : opts[0]; }
  if (mods.grip && mods.grip !== 'none' && mods.handguard === 'std') mods.grip = 'none';
  return mods;
}
function rollContainer(c) {
  const def = CONTAINERS[c.type], n = rndi(def.n[0], def.n[1]); c.items = [];
  for (let i = 0; i < n; i++) if (Math.random() < 0.8) c.items.push(makeItem(POOLS[def.pool]()));
}

// ---------------------------------------------------------------- doors
function addDoor(x, z, along, hingeSign = 1, mat = 'wood', color = 0x6a4a2a) {
  // along: 'x' -> door spans x (wall runs along x); 'z' -> spans z. (x,z) = center of gap. width 1.1, height 2.1
  const W = 1.05, H = 2.1, T = 0.08;
  const geo = new THREE.BoxGeometry(along === 'x' ? W : T, H, along === 'x' ? T : W); geo.translate(along === 'x' ? hingeSign * W / 2 : 0, H / 2, along === 'x' ? 0 : hingeSign * W / 2);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.8, map: mat === 'metal' ? World.mats.metal.map : World.mats.wood.map }));
  const hx = along === 'x' ? x - hingeSign * W / 2 : x, hz = along === 'x' ? z : z - hingeSign * W / 2;
  mesh.position.set(hx, 0, hz); mesh.castShadow = true; World.scene.add(mesh);
  const handle = new THREE.Mesh(boxGeo(0.03, 0.03, 0.12), WMAT.metal); handle.position.set(along === 'x' ? hingeSign * (W - 0.12) : 0.06, 1.0, along === 'x' ? 0.06 : hingeSign * (W - 0.12)); if (along === 'x') handle.rotation.y = Math.PI / 2; mesh.add(handle);
  const d = { x, z, along, hingeSign, open: false, mesh, hx, hz, W, H, T };
  d.collider = World.addCollider(0, 0, 0, 1, H, 1, mat === 'metal' ? 'metal' : 'wood', { door: d });
  setDoorCollider(d); World.doors.push(d); return d;
}
function setDoorCollider(d) {
  const c = d.collider, e = 0.06;
  if (!d.open) { if (d.along === 'x') { c.min.set(d.hx - (d.hingeSign < 0 ? d.W : 0), 0, d.hz - e); c.max.set(d.hx + (d.hingeSign > 0 ? d.W : 0), d.H, d.hz + e); } else { c.min.set(d.hx - e, 0, d.hz - (d.hingeSign < 0 ? d.W : 0)); c.max.set(d.hx + e, d.H, d.hz + (d.hingeSign > 0 ? d.W : 0)); } }
  else { // rotated 90° outwards (toward +z for 'x' doors, toward +x for 'z' doors)
    if (d.along === 'x') { c.min.set(d.hx - e, 0, d.hz - (d.swing < 0 ? d.W : 0)); c.max.set(d.hx + e, d.H, d.hz + (d.swing > 0 ? d.W : 0)); }
    else { c.min.set(d.hx - (d.swing < 0 ? d.W : 0), 0, d.hz - e); c.max.set(d.hx + (d.swing > 0 ? d.W : 0), d.H, d.hz + e); }
  }
  if (World.grid) { World.gridRemove(c); World.gridInsert(c); }
}
function toggleDoor(d, fromPos) {
  if (d.anim) return;
  if (!d.open) { // swing away from the opener
    const side = d.along === 'x' ? Math.sign(d.z - fromPos.z) || 1 : Math.sign(d.x - fromPos.x) || 1; d.swing = side;
  }
  d.open = !d.open; d.anim = 0; Audio.door(V3(d.x, 1, d.z), d.open);
  // collider becomes open state immediately when opening; when closing, set after anim
  if (d.open) setDoorCollider(d);
}
function updateDoors(dt) {
  for (const d of World.doors) {
    if (d.anim === undefined) continue;
    d.anim += dt * 2.5; const t = Math.min(1, d.anim), k = d.open ? t : 1 - t;
    // rotation direction such that the door swings toward d.swing side
    const dir = d.along === 'x' ? -d.hingeSign * d.swing : d.hingeSign * d.swing;
    d.mesh.rotation.y = dir * k * Math.PI / 2;
    if (t >= 1) { d.anim = undefined; if (!d.open) setDoorCollider(d); }
  }
}

// ---------------------------------------------------------------- walls / buildings
// wall from (x0,z0) to (x1,z1) (axis aligned), base y, height h, gaps: [{at, w, y0, y1}] where at is distance along wall
function wall(x0, z0, x1, z1, y, h, gaps, mat, color, t = 0.3) {
  const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0), len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0), sx = Math.min(x0, x1), sz = Math.min(z0, z1);
  const segs = []; gaps = (gaps || []).filter(g => g.at - g.w / 2 > 0.05 && g.at + g.w / 2 < len - 0.05).sort((a, b) => a.at - b.at);
  let cur = 0;
  const emit = (a, b, y0, y1) => { if (b - a < 0.02 || y1 - y0 < 0.02) return; const m = (a + b) / 2; if (alongX) World.box(sx + m, y + y0, sz, b - a, y1 - y0, t, mat, color); else World.box(sx, y + y0, sz + m, t, y1 - y0, b - a, mat, color); };
  for (const g of gaps) { const a = g.at - g.w / 2, b = g.at + g.w / 2; emit(cur, a, 0, h); emit(a, b, 0, g.y0 || 0); emit(a, b, g.y1, h); cur = b; }
  emit(cur, len, 0, h);
}
// slab with optional rectangular hole [hx0,hz0,hx1,hz1] (absolute)
function slab(x0, z0, x1, z1, y, th, mat, color, hole) {
  if (!hole) { World.box((x0 + x1) / 2, y, (z0 + z1) / 2, x1 - x0, th, z1 - z0, mat, color); return; }
  const [hx0, hz0, hx1, hz1] = hole;
  slab(x0, z0, x1, hz0, y, th, mat, color); slab(x0, hz1, x1, z1, y, th, mat, color);
  slab(x0, hz0, hx0, hz1, y, th, mat, color); slab(hx1, hz0, x1, hz1, y, th, mat, color);
}
// Stairwell: landings at both ends along `axis`, straight flights alternating direction and side.
// Flight f (0-based) climbs from level f to f+1 on half (f%2); slab above needs a hole over it. Returns holes[level].
const STAIR_LEN = 6.9;
function stairwell(sw, floors, fh, axis, mat = 'concrete', color = 0xa8a8a0) {
  const [x0, z0, x1, z1] = sw, land = 1.5, holes = [null];
  const len = axis === 'x' ? x1 - x0 : z1 - z0, wid = axis === 'x' ? z1 - z0 : x1 - x0, fl = len - 2 * land, steps = 13, run = fl / steps, half = wid / 2;
  for (let f = 0; f < floors - 1; f++) {
    const y = f * fh, rise = fh / steps, up = f % 2 === 0, hz = up ? 0 : half;
    for (let i = 0; i < steps; i++) {
      const h = rise * (i + 1), a = land + (up ? run * (i + 0.5) : fl - run * (i + 0.5));
      if (axis === 'x') World.box(x0 + a, y, z0 + hz + half / 2, run + 0.01, h, half, mat, color); else World.box(x0 + hz + half / 2, y, z0 + a, half, h, run + 0.01, mat, color);
    }
    holes.push(axis === 'x' ? [x0 + land, z0 + hz, x0 + land + fl, z0 + hz + half] : [x0 + hz, z0 + land, x0 + hz + half, z0 + land + fl]);
    const ry = (f + 1) * fh; // railing between the hole and the walkable half
    if (axis === 'x') World.box(x0 + land + fl / 2, ry, z0 + half, fl, 1.0, 0.06, 'metal', 0x444444); else World.box(x0 + half, ry, z0 + land + fl / 2, 0.06, 1.0, fl, 'metal', 0x444444);
  }
  return holes;
}
const LOOTSPOTS = []; // {x,y,z, types:[], indoor:true, wall?:{along, side}}
function lootSpot(x, y, z, types, ry = 0) { LOOTSPOTS.push({ x, y, z, types, ry }); }

// Generic multi-storey building
function building(cfg) {
  const { x, z, w, d, floors = 1, fh = 3.1, mat = 'brick', color = 0xffffff, layout = 'open', doors = [], name = '' } = cfg;
  const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2, T = 0.3, H = floors * fh, longX = w >= d;
  const gapsFor = side => { const g = []; const len = side === 'n' || side === 's' ? w : d;
    for (const dr of doors) if (dr.side === side) g.push({ at: dr.at !== undefined ? dr.at : len / 2, w: 1.15, y0: 0, y1: 2.15 });
    if (cfg.windows !== false) for (let f = 0; f < floors; f++) for (let a = 2.2; a < len - 1.5; a += 3.2) if (!g.some(gg => Math.abs(gg.at - a) < 1.6 && f === 0) && !(cfg.win2 && f === 0 && side === cfg.win2)) g.push({ at: a, w: 1.2, y0: f * fh + 1.0, y1: f * fh + 2.1 });
    return g; };
  wall(x0, z0, x1, z0, 0, H, gapsFor('n'), mat, color, T); wall(x0, z1, x1, z1, 0, H, gapsFor('s'), mat, color, T);
  wall(x0, z0, x0, z1, 0, H, gapsFor('w'), mat, color, T); wall(x1, z0, x1, z1, 0, H, gapsFor('e'), mat, color, T);
  for (const dr of doors) { const len = dr.side === 'n' || dr.side === 's' ? w : d, at = dr.at !== undefined ? dr.at : len / 2;
    if (dr.side === 'n') addDoor(x0 + at, z0, 'x', 1, dr.metal ? 'metal' : 'wood'); else if (dr.side === 's') addDoor(x0 + at, z1, 'x', -1, dr.metal ? 'metal' : 'wood');
    else if (dr.side === 'w') addDoor(x0, z0 + at, 'z', 1, dr.metal ? 'metal' : 'wood'); else addDoor(x1, z0 + at, 'z', -1, dr.metal ? 'metal' : 'wood'); }
  // stairwell at one end (the -axis end) if multi-storey
  let sw = null, holes = [];
  if (floors > 1) {
    sw = longX ? [x0 + T, z0 + T, x0 + T + STAIR_LEN, z1 - T] : [x0 + T, z0 + T, x1 - T, z0 + T + STAIR_LEN];
    holes = stairwell(sw, floors, fh, longX ? 'x' : 'z');
  }
  for (let f = 1; f <= floors; f++) { const th = 0.25; slab(x0 - 0.05, z0 - 0.05, x1 + 0.05, z1 + 0.05, f * fh - (f === floors ? 0 : th), th, 'concrete', 0xa8a49c, f < floors && sw ? holes[f] : null); }
  // interior
  const inner = [x0 + T / 2, z0 + T / 2, x1 - T / 2, z1 - T / 2];
  const extX = doors.filter(dr => dr.side === 'n' || dr.side === 's').map(dr => x0 + (dr.at !== undefined ? dr.at : w / 2)), extZ = doors.filter(dr => dr.side === 'w' || dr.side === 'e').map(dr => z0 + (dr.at !== undefined ? dr.at : d / 2));
  const nearDoorX = (a, b) => extX.some(dx => dx > a - 0.8 && dx < b + 0.8), nearDoorZ = (a, b) => extZ.some(dz => dz > a - 0.8 && dz < b + 0.8);
  for (let f = 0; f < floors; f++) {
    const y = f * fh, startA = sw ? (longX ? sw[2] : sw[3]) : (longX ? inner[0] : inner[1]);
    if (layout === 'corridor') {
      const cw = 2.2, rw = 4.0;
      if (longX) {
        const cz0 = z - cw / 2, cz1 = z + cw / 2, len = inner[2] - startA, nRooms = Math.floor(len / rw), rl = len / nRooms;
        for (let s = 0; s < 2; s++) {
          const wz = s === 0 ? cz0 : cz1, rz0 = s === 0 ? inner[1] : cz1, rz1 = s === 0 ? cz0 : inner[3];
          const gaps = []; for (let i = 0; i < nRooms; i++) gaps.push({ at: startA - inner[0] + rl * (i + 0.5), w: 1.1, y0: 0, y1: 2.1 });
          wall(startA, wz, inner[2], wz, y, fh, gaps.map(g => ({ ...g, at: g.at - (startA - inner[0]) })), 'concrete', 0xd8d4c8, 0.15);
          for (let i = 0; i < nRooms; i++) { const rx = startA + rl * (i + 0.5);
            if (i > 0) World.box(startA + rl * i, y, (rz0 + rz1) / 2, 0.15, fh, rz1 - rz0, 'concrete', 0xd8d4c8);
            addDoor(rx, wz, 'x', 1);
            if (!nearDoorX(rx - rl / 2 + 0.1, rx - rl / 2 + 1.3)) lootSpot(rx - rl / 2 + 0.7, y, s === 0 ? rz0 + 0.5 : rz1 - 0.5, ['cabinet', 'drawer', 'duffle', 'jacket', 'weaponbox', 'medbag', 'safe', 'pc']);
            if (Math.random() < 0.6) lootSpot(rx - rl / 2 + 0.7, y, s === 0 ? rz1 - 0.5 : rz0 + 0.5, ['duffle', 'jacket', 'crate', 'toolbox', 'medcase', 'drawer']);
            // furniture: bed (not in front of an exterior door)
            if (!nearDoorX(rx + rl / 2 - 2.2, rx + rl / 2 - 0.2)) World.box(rx + rl / 2 - 1.2, y, s === 0 ? rz0 + 0.55 : rz1 - 0.55, 2.0, 0.5, 0.9, 'wood', 0x7a6a5a);
          }
        }
        if (sw) { // stairwell wall separating from corridor with a door
          const sx = sw[2]; wall(sx, inner[1], sx, inner[3], y, fh, [{ at: z - inner[1], w: 1.15, y0: 0, y1: 2.15 }], 'concrete', 0xd8d4c8, 0.15); addDoor(sx, z, 'z', 1);
        }
      } else {
        const cx0 = x - cw / 2, cx1 = x + cw / 2, len = inner[3] - startA, nRooms = Math.floor(len / rw), rl = len / nRooms;
        for (let s = 0; s < 2; s++) {
          const wx = s === 0 ? cx0 : cx1, rx0 = s === 0 ? inner[0] : cx1, rx1 = s === 0 ? cx0 : inner[2];
          const gaps = []; for (let i = 0; i < nRooms; i++) gaps.push({ at: rl * (i + 0.5), w: 1.1, y0: 0, y1: 2.1 });
          wall(wx, startA, wx, inner[3], y, fh, gaps, 'concrete', 0xd8d4c8, 0.15);
          for (let i = 0; i < nRooms; i++) { const rz = startA + rl * (i + 0.5);
            if (i > 0) World.box((rx0 + rx1) / 2, y, startA + rl * i, rx1 - rx0, fh, 0.15, 'concrete', 0xd8d4c8);
            addDoor(wx, rz, 'z', 1);
            if (!nearDoorZ(rz - rl / 2 + 0.1, rz - rl / 2 + 1.3)) lootSpot(s === 0 ? rx0 + 0.5 : rx1 - 0.5, y, rz - rl / 2 + 0.7, ['cabinet', 'drawer', 'duffle', 'jacket', 'weaponbox', 'medbag', 'safe', 'pc'], Math.PI / 2);
            if (!nearDoorZ(rz + rl / 2 - 2.2, rz + rl / 2 - 0.2)) World.box(s === 0 ? rx0 + 0.55 : rx1 - 0.55, y, rz + rl / 2 - 1.2, 0.9, 0.5, 2.0, 'wood', 0x7a6a5a);
          }
        }
        if (sw) { const sz = sw[3]; wall(inner[0], sz, inner[2], sz, y, fh, [{ at: x - inner[0], w: 1.15, y0: 0, y1: 2.15 }], 'concrete', 0xd8d4c8, 0.15); addDoor(x, sz, 'x', 1); }
      }
    } else if (layout === 'split') {
      if (longX) { const mx = (startA + inner[2]) / 2; wall(mx, inner[1], mx, inner[3], y, fh, [{ at: (inner[3] - inner[1]) * 0.3, w: 1.15, y0: 0, y1: 2.15 }], 'concrete', 0xd8d4c8, 0.15); addDoor(mx, inner[1] + (inner[3] - inner[1]) * 0.3, 'z', 1);
        lootSpot(startA + 1, y, inner[1] + 0.6, ['weaponbox', 'safe', 'cabinet', 'crate']); lootSpot(inner[2] - 1, y, inner[3] - 0.6, ['duffle', 'medcase', 'toolbox', 'pc', 'jacket']); lootSpot(mx + 1.5, y, inner[1] + 0.6, ['drawer', 'cabinet', 'weaponbox']); }
      else { const mz = (startA + inner[3]) / 2; wall(inner[0], mz, inner[2], mz, y, fh, [{ at: (inner[2] - inner[0]) * 0.3, w: 1.15, y0: 0, y1: 2.15 }], 'concrete', 0xd8d4c8, 0.15); addDoor(inner[0] + (inner[2] - inner[0]) * 0.3, mz, 'x', 1);
        lootSpot(inner[0] + 0.6, y, startA + 1, ['weaponbox', 'safe', 'cabinet', 'crate'], Math.PI / 2); lootSpot(inner[2] - 0.6, y, inner[3] - 1, ['duffle', 'medcase', 'toolbox', 'pc', 'jacket'], Math.PI / 2); }
      if (sw) { if (longX) { wall(sw[2], inner[1], sw[2], inner[3], y, fh, [{ at: z - inner[1], w: 1.15, y0: 0, y1: 2.15 }], 'concrete', 0xd8d4c8, 0.15); addDoor(sw[2], z, 'z', 1); } else { wall(inner[0], sw[3], inner[2], sw[3], y, fh, [{ at: x - inner[0], w: 1.15, y0: 0, y1: 2.15 }], 'concrete', 0xd8d4c8, 0.15); addDoor(x, sw[3], 'x', 1); } }
    } else { // open
      const spots = cfg.spots || 3;
      for (let i = 0; i < spots; i++) { const sx = longX ? rnd(startA + 1, inner[2] - 1) : pick([inner[0] + 0.6, inner[2] - 0.6]), sz = longX ? pick([inner[1] + 0.6, inner[3] - 0.6]) : rnd(startA + 1, inner[3] - 1); if (nearDoorX(sx - 0.6, sx + 0.6) || nearDoorZ(sz - 0.6, sz + 0.6)) continue; lootSpot(sx, y, sz, cfg.loot || ['crate', 'weaponbox', 'duffle', 'toolbox', 'cabinet', 'medbag']); }
    }
  }
  World.pois.push({ name, x, z, r: Math.max(w, d) * 0.9 + 8 });
}

function warehouse(x, z, w, d, h, color, mat = 'metal', doorSides = ['s']) {
  const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2;
  const g = side => { const len = side === 'n' || side === 's' ? w : d; const gaps = []; if (doorSides.includes(side)) gaps.push({ at: len / 2, w: 4.5, y0: 0, y1: 4 }); if (doorSides.includes(side + '2')) gaps.push({ at: len * 0.2, w: 1.2, y0: 0, y1: 2.2 }); for (let a = 3; a < len - 2; a += 6) gaps.push({ at: a, w: 1.6, y0: h - 2.2, y1: h - 1 }); return gaps; };
  wall(x0, z0, x1, z0, 0, h, g('n'), mat, color, 0.25); wall(x0, z1, x1, z1, 0, h, g('s'), mat, color, 0.25); wall(x0, z0, x0, z1, 0, h, g('w'), mat, color, 0.25); wall(x1, z0, x1, z1, 0, h, g('e'), mat, color, 0.25);
  slab(x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3, h, 0.3, 'metal', 0x777a7c);
  // pillars & shelving
  for (let px = x0 + 4; px < x1 - 2; px += 8) { World.box(px, 0, z0 + 1.5, 0.4, h, 0.4, 'concrete', 0x9a9a92); World.box(px, 0, z1 - 1.5, 0.4, h, 0.4, 'concrete', 0x9a9a92); }
  const nShelf = Math.floor((w - 6) / 7);
  for (let i = 0; i < nShelf; i++) { const sx = x0 + 4 + i * 7; World.box(sx, 0, z, 1.2, 2.4, d * 0.5, 'metal', 0x6a6c70); lootSpot(sx + 1.0, 0, z - d * 0.15, ['crate', 'toolbox', 'weaponbox', 'duffle'], Math.PI / 2); lootSpot(sx - 1.0, 0, z + d * 0.2, ['crate', 'weaponbox', 'cabinet', 'toolbox'], Math.PI / 2); }
  lootSpot(x0 + 1.2, 0, z0 + 3, ['weaponbox', 'crate'], Math.PI / 2); lootSpot(x1 - 1.2, 0, z1 - 3, ['duffle', 'medcase'], Math.PI / 2);
  World.pois.push({ name: 'Warehouse', x, z, r: Math.max(w, d) * 0.9 + 6 });
}
function container20(x, z, ry, color, open) { // shipping container (6.1 x 2.6 x 2.4)
  const L = 6.1, W = 2.44, H = 2.6, cs = Math.cos(ry), sn = Math.sin(ry);
  if (Math.abs(sn) < 0.01 || Math.abs(cs) < 0.01) { // axis aligned: build enterable
    const alongX = Math.abs(cs) > 0.5, l = alongX ? L : W, w = alongX ? W : L;
    World.box(x, H - 0.1, z, l, 0.1, w, 'red', color); World.box(x, 0, z, l, 0.1, w, 'metal', 0x555555);
    if (alongX) { World.box(x, 0, z - w / 2, l, H, 0.08, 'red', color); World.box(x, 0, z + w / 2, l, H, 0.08, 'red', color); World.box(x - l / 2, 0, z, 0.08, H, w, 'red', color); if (!open) World.box(x + l / 2, 0, z, 0.08, H, w, 'red', color); }
    else { World.box(x - l / 2, 0, z, 0.08, H, w, 'red', color); World.box(x + l / 2, 0, z, 0.08, H, w, 'red', color); World.box(x, 0, z - w / 2, l, H, 0.08, 'red', color); if (!open) World.box(x, 0, z + w / 2, l, H, 0.08, 'red', color); }
    if (open) lootSpot(x + (alongX ? -l / 2 + 1 : 0), 0.1, z + (alongX ? 0 : -w / 2 + 1), ['crate', 'weaponbox', 'duffle', 'toolbox']);
  } else World.box(x, 0, z, L, H, W, 'red', color, { ry });
}
function car(x, z, ry, color) {
  World.box(x, 0.3, z, 4.2, 0.7, 1.8, 'flat', color, { ry, shade: 0.2 }); World.box(x - 0.3 * Math.cos(ry), 1.0, z + 0.3 * Math.sin(ry), 2.0, 0.6, 1.7, 'glass', 0x333333, { ry, collide: false });
  World.box(x, 0.98, z, 2.2, 0.66, 1.8, 'flat', color, { ry, collide: false });
  for (const s of [-1, 1]) for (const t of [-1.3, 1.3]) { const cx = x + t * Math.cos(ry) - s * 0.9 * Math.sin(ry), cz = z - t * Math.sin(ry) - s * 0.9 * Math.cos(ry); World.box(cx, 0, cz, 0.6, 0.6, 0.25, 'flat', 0x111111, { ry, collide: false }); }
}
function bus(x, z, ry) { World.box(x, 0.4, z, 11, 2.6, 2.5, 'metal', 0xb0a060, { ry, shade: 0.1 }); World.box(x, 1.4, z, 10.5, 1.0, 2.55, 'glass', 0x222222, { ry, collide: false }); }
function tree(x, z, s = 1) {
  if (!World.pointFreeStatic(x, z, 1.5) || World.inWater(x, z)) return;
  const h = 6 * s; World.cyl(x, 0, z, 0.25 * s, h * 0.5, 'flat', 0x4a3a28, 6, true);
  World.cyl(x, h * 0.3, z, 2.4 * s, h * 0.45, 'foliage', 0x2c4a22, 7, false, 0.9 * s); World.cyl(x, h * 0.55, z, 1.8 * s, h * 0.4, 'foliage', 0x33552a, 7, false, 0.3 * s);
}
function bush(x, z, s = 1) { World.cyl(x, 0, z, 0.9 * s, 0.9 * s, 'foliage', 0x3c5a2e, 6, false, 0.5 * s); World.decor.push({ x, z, r: 1 * s }); }
function fence(x0, z0, x1, z1, h = 2.2) { // chain link with posts
  const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0), len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0), sx = Math.min(x0, x1), sz = Math.min(z0, z1);
  if (alongX) World.box(sx + len / 2, 0, sz, len, h, 0.04, 'fence', 0xffffff, { collide: true, cmat: 'metal' }); else World.box(sx, 0, sz + len / 2, 0.04, h, len, 'fence', 0xffffff, { collide: true, cmat: 'metal' });
  for (let a = 0; a <= len; a += 4) World.box(alongX ? sx + a : sx, 0, alongX ? sz : sz + a, 0.1, h + 0.1, 0.1, 'metal', 0x666666, { collide: false });
}
function concreteWall(x0, z0, x1, z1, h = 3) { wall(x0, z0, x1, z1, 0, h, [], 'concrete', 0xa8a49c, 0.3); const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0); World.box((x0 + x1) / 2, h, (z0 + z1) / 2, alongX ? Math.abs(x1 - x0) : 0.1, 0.1, alongX ? 0.1 : Math.abs(z1 - z0), 'metal', 0x444444, { collide: false }); }
function lamp(x, z) { World.cyl(x, 0, z, 0.12, 7, 'metal', 0x555555, 6, true); World.box(x, 7, z + 0.6, 0.3, 0.2, 1.4, 'metal', 0x555555, { collide: false }); }
function pallets(x, z) { for (let i = 0; i < 3; i++) World.box(x + rnd(-0.5, 0.5), 0, z + rnd(-0.5, 0.5), 1.2, 0.15, 1.0, 'wood', 0xa08050, { ry: rnd(-0.3, 0.3), collide: false }); World.box(x, 0, z, 1.2, 0.5, 1.0, 'wood', 0xa08050, { collide: true }); }
function sandbags(x, z, len, alongX) { for (let i = 0; i < 2; i++) World.box(x, i * 0.4, z, alongX ? len : 0.8, 0.4, alongX ? 0.8 : len, 'flat', 0x8a7a55, { shade: 0.15 }); }
function tank(x, z, r, h) { World.cyl(x, 0, z, r, h, 'metal', 0x8a8a80, 16, true); World.cyl(x, h, z, r, 0.6, 'metal', 0x6a6a60, 16, false, r * 0.5); World.pois.push({ name: 'Tanks', x, z, r: r + 8 }); }
function trailer(x, z, ry) { World.box(x, 0.9, z, 8, 2.6, 2.5, 'metal', pick([0xc8c8c0, 0xb0b8b0, 0xd0c0a0]), { ry, shade: 0.1 }); World.box(x, 0, z, 6, 0.9, 1.6, 'metal', 0x333333, { ry, collide: true }); }

// ---------------------------------------------------------------- the map
function buildCustoms() {
  const W = World, B = W.bounds;
  // ground & sky props
  W.plane(0, 0, 0, B.x1 - B.x0 + 40, B.z1 - B.z0 + 40, W.texGround, 12, 0xffffff);
  // roads (y slightly above ground)
  const road = (x, z, w, d) => W.plane(x, 0.02, z, w, d, W.texAsphalt, 8, 0xffffff, w > d ? Math.PI / 2 : 0);
  road(0, 0, 420, 8);                 // main east-west road
  road(40, 0, 8, 240);                // north-south road (crossroads)
  road(150, 30, 8, 70);               // dorms/gas connector
  road(-140, 40, 8, 80);              // customs yard
  road(100, -45, 120, 6);             // north track
  W.plane(-60, 0.015, -30, 60, 60, W.texGravel, 6);  // gravel yard near big red
  W.plane(150, 0.015, -60, 90, 60, W.texGravel, 6);  // dorms yard
  W.plane(-150, 0.015, -20, 70, 50, W.texGravel, 6); // customs yard
  // river
  W.water.push({ x0: -100, x1: -84, z0: -130, z1: 130 });
  const wm = new THREE.Mesh(new THREE.PlaneGeometry(16, 260), new THREE.MeshStandardMaterial({ map: W.texWater, color: 0x6a8a90, transparent: true, opacity: 0.85, roughness: 0.15, metalness: 0.3 }));
  wm.material.map.repeat.set(2, 30); wm.rotation.x = -Math.PI / 2; wm.position.set(-92, 0.03, 0); W.scene.add(wm); W.waterMesh = wm;
  for (const z of [-110, -60, -30, 30, 60, 110]) { W.box(-101, 0, z, 2, 0.35, 20, 'concrete', 0x8a8a80); W.box(-83, 0, z, 2, 0.35, 20, 'concrete', 0x8a8a80); }
  // bridge
  W.box(-92, 0, 0, 22, 0.4, 9, 'concrete', 0x9a9a92); W.box(-92, 0.4, -4.4, 22, 1.0, 0.2, 'metal', 0x556655); W.box(-92, 0.4, 4.4, 22, 1.0, 0.2, 'metal', 0x556655);
  for (const x of [-101, -92, -83]) { W.cyl(x, -0.5, -3, 0.6, 1, 'concrete', 0x777777, 8, false); W.cyl(x, -0.5, 3, 0.6, 1, 'concrete', 0x777777, 8, false); }
  W.pois.push({ name: 'Bridge', x: -92, z: 0, r: 20 });

  // ---- perimeter: concrete wall with wire
  concreteWall(B.x0, B.z0, B.x1, B.z0, 3.5); concreteWall(B.x0, B.z1, B.x1, B.z1, 3.5); concreteWall(B.x0, B.z0, B.x0, B.z1, 3.5); concreteWall(B.x1, B.z0, B.x1, B.z1, 3.5);

  // ---- WEST: Trailer park + Customs building + tanks
  for (let i = 0; i < 6; i++) trailer(-180 + (i % 3) * 11, 62 + Math.floor(i / 3) * 12, (i % 2) * 0.1);
  for (let i = 0; i < 5; i++) { lootSpot(-186 + i * 8, 0, 82, ['duffle', 'crate', 'toolbox', 'weaponbox']); }
  car(-160, 90, 0.4, 0x6a3a2a); car(-150, 78, 1.9, 0x3a4a6a); W.pois.push({ name: 'Trailer park', x: -170, z: 70, r: 30 });
  fence(-195, 50, -140, 50); fence(-140, 50, -140, 100);
  building({ name: 'Customs office', x: -140, z: -10, w: 46, d: 14, floors: 2, mat: 'brick', color: 0xd0c8b8, layout: 'corridor', doors: [{ side: 's', at: 23 }, { side: 'n', at: 10 }, { side: 'e' }] });
  tank(-165, -50, 6, 9); tank(-150, -52, 6, 9); tank(-135, -50, 6, 9);
  W.box(-150, 0, -40, 40, 1.2, 0.3, 'concrete', 0x9a9a92); // low wall in front of tanks
  for (let i = 0; i < 4; i++) container20(-120 + i * 3.2, 25 + (i % 2) * 7, 0, pick([0x8a2a22, 0x2a4a7a, 0x4a6a3a, 0xa08030]), i === 1);
  building({ name: 'Customs checkpoint', x: -110, z: 15, w: 8, d: 6, floors: 1, mat: 'concrete', color: 0xb0b0a8, layout: 'open', doors: [{ side: 'e' }], spots: 2, loot: ['weaponbox', 'cabinet', 'duffle'] });
  sandbags(-105, 5, 6, true); sandbags(-105, -5, 6, true);
  for (let i = 0; i < 8; i++) tree(-190 + rnd(0, 40), -100 + rnd(0, 30), rnd(0.8, 1.3)); for (let i = 0; i < 10; i++) tree(-200 + rnd(0, 60), 100 + rnd(-10, 12), rnd(0.8, 1.2));
  for (let i = 0; i < 12; i++) tree(-180 + rnd(0, 70), rnd(-90, -60), rnd(0.9, 1.4));

  // ---- CENTRE-WEST: Big Red warehouse + yard
  warehouse(-45, -55, 44, 26, 10, 0x8a2320, 'red', ['s', 'e', 'n2']); W.pois[W.pois.length - 1].name = 'Big Red';
  for (let i = 0; i < 5; i++) container20(-70 + i * 3.3, -20, 0, pick([0x8a2a22, 0x2a4a7a, 0x4a6a3a]), i === 2); container20(-30, -25, Math.PI / 2, 0x4a6a3a, true); container20(-30, -31.5, Math.PI / 2, 0x2a4a7a, false);
  pallets(-50, -30); pallets(-40, -35); lamp(-40, -12); bus(-60, 12, 0.05);
  fence(-75, -75, -75, -15); fence(-75, -75, -10, -75);
  building({ name: 'Gate house', x: -12, z: -25, w: 7, d: 7, floors: 1, mat: 'brick', color: 0xd8d0c0, layout: 'open', doors: [{ side: 'w' }], spots: 2, loot: ['safe', 'cabinet', 'weaponbox', 'medbag'] });

  // ---- CENTRE: Gas station + Crossroads
  building({ name: 'Gas station', x: 22, z: 22, w: 18, d: 10, floors: 1, fh: 3.5, mat: 'concrete', color: 0xd8d8d0, layout: 'open', doors: [{ side: 'n', at: 9 }, { side: 'e', at: 5 }], spots: 4, loot: ['cash', 'safe', 'medbag', 'crate', 'duffle', 'cabinet'], win2: 'n' });
  W.box(22, 4.6, 8, 24, 0.5, 12, 'concrete', 0xe0e0d8); for (const px of [12, 32]) for (const pz of [3, 13]) W.box(px, 0, pz, 0.5, 4.6, 0.5, 'concrete', 0xc8c8c0);
  for (const px of [16, 22, 28]) { W.box(px, 0, 8, 0.8, 1.7, 0.5, 'metal', 0xc84a30); W.box(px, 0, 8, 1.6, 0.15, 1.2, 'concrete', 0xa0a098); }
  car(4, 12, 0.1, 0x8a8a8a); car(34, 30, 1.2, 0x3a3a3a); lamp(0, 5); lamp(80, -5);
  W.pois.push({ name: 'Crossroads', x: 40, z: 90, r: 25 }); bus(52, 96, 1.57); car(30, 88, 0.3, 0x5a2a1a); sandbags(46, 80, 5, true);
  // warehouses south of gas station
  warehouse(0, 60, 26, 16, 7, 0xa0a8a8, 'metal', ['n', 'w2']); warehouse(-30, 62, 24, 16, 7, 0x7a8a7a, 'metal', ['n']);
  building({ name: 'Repair shop', x: -60, z: 60, w: 14, d: 10, floors: 1, mat: 'brick', color: 0xc8b8a0, layout: 'open', doors: [{ side: 'n' }], spots: 3, loot: ['toolbox', 'toolbox', 'crate', 'weaponbox'] });
  fence(-75, 45, 15, 45, 2.2); fence(15, 45, 15, 75);
  for (let i = 0; i < 14; i++) tree(-70 + rnd(0, 90), 95 + rnd(0, 18), rnd(0.8, 1.3));

  // ---- NORTH-CENTRE: Construction site
  {
    const cx = 60, cz = -62, w = 24, d = 16, fh = 3.6;
    const csw = [cx - w / 2 + 0.2, cz - d / 2 + 0.2, cx - w / 2 + 5.2, cz - d / 2 + 0.2 + STAIR_LEN], choles = stairwell(csw, 4, fh, 'z');
    for (let f = 1; f <= 3; f++) slab(cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2, f * fh - 0.3, 0.3, 'concrete', 0x9a9a92, choles[f]);
    for (let px = cx - w / 2 + 6; px <= cx + w / 2; px += 6) for (let pz = cz - d / 2 + 0.4; pz <= cz + d / 2; pz += 7.6) W.box(px, 0, pz, 0.5, 3 * fh, 0.5, 'concrete', 0x9a9a92);
    wall(cx - w / 2 + 4, cz - d / 2, cx + w / 2, cz - d / 2, 0, fh, [{ at: 6, w: 3, y0: 1, y1: 2.2 }], 'brick', 0xd0c0b0, 0.2);
    wall(cx - w / 2 + 4, cz - d / 2, cx + w / 2, cz - d / 2, fh, fh, [{ at: 5, w: 2, y0: 1, y1: 2.2 }, { at: 12, w: 2, y0: 1, y1: 2.2 }], 'brick', 0xd0c0b0, 0.2);
    wall(cx + w / 2, cz - d / 2, cx + w / 2, cz + d / 2, 0, 2 * fh, [], 'brick', 0xd0c0b0, 0.2);
    for (let f = 0; f < 3; f++) { W.box(cx, f * fh, cz + d / 2 - 0.2, w - 4, 1.1, 0.15, 'concrete', 0x9a9a92); lootSpot(cx + rnd(-8, 8), f * fh, cz + rnd(-5, 5), ['crate', 'toolbox', 'weaponbox', 'duffle']); }
    for (let i = 0; i < 6; i++) W.box(cx + 18, 0, cz - 8 + i * 3, 0.6, 1.2, 0.6, 'flat', 0xb0a080); pallets(cx + 16, cz + 6); pallets(cx - 16, cz - 2);
    W.pois.push({ name: 'Construction', x: cx, z: cz, r: 26 });
  }
  // ---- rail line along the north
  W.plane(0, 0.01, -100, 400, 6, W.texGravel, 5); W.box(0, 0.05, -101, 400, 0.15, 0.12, 'metal', 0x555555, { collide: false }); W.box(0, 0.05, -99, 400, 0.15, 0.12, 'metal', 0x555555, { collide: false });
  for (let i = 0; i < 5; i++) { const tx = -20 + i * 14; W.box(tx, 0.9, -100, 13, 2.8, 2.8, 'metal', pick([0x6a3a2a, 0x3a4a3a, 0x5a5a5a]), { shade: 0.15 }); W.box(tx, 0, -100, 10, 0.9, 2.0, 'metal', 0x222222); }
  for (let i = 0; i < 8; i++) tree(120 + rnd(0, 80), -115 + rnd(0, 12), rnd(0.9, 1.3)); for (let i = 0; i < 8; i++) tree(-180 + rnd(0, 120), -116 + rnd(0, 10), rnd(0.9, 1.3));
  W.pois.push({ name: 'RUAF Roadblock', x: 100, z: -108, r: 18 }); sandbags(94, -104, 6, true); sandbags(106, -104, 6, true); car(100, -96, 1.5, 0x4a5a3a);

  // ---- EAST-CENTRE: Fortress + old gas
  building({ name: 'Fortress', x: 100, z: -30, w: 28, d: 18, floors: 3, fh: 3.4, mat: 'concrete', color: 0xb8b0a0, layout: 'split', doors: [{ side: 's', at: 14, metal: true }, { side: 'w', at: 9, metal: true }] });
  concreteWall(78, -50, 122, -50, 2.6); concreteWall(78, -50, 78, -10, 2.6); concreteWall(122, -50, 122, -22, 2.6); concreteWall(122, -14, 122, -10, 2.6); concreteWall(78, -10, 96, -10, 2.6); concreteWall(104, -10, 122, -10, 2.6);
  for (let i = 0; i < 3; i++) container20(85 + i * 3.2, -44, 0, pick([0x8a2a22, 0x2a4a7a]), i === 0); car(110, -16, 0.2, 0x2a2a2a);
  building({ name: 'Old gas station', x: 150, z: 82, w: 14, d: 9, floors: 1, mat: 'brick', color: 0xd0c0a0, layout: 'open', doors: [{ side: 'n', at: 7 }], spots: 3, loot: ['cash', 'medbag', 'crate', 'duffle', 'cabinet'] });
  W.box(150, 4.2, 70, 18, 0.4, 10, 'concrete', 0xd8d8d0); for (const px of [142, 158]) for (const pz of [66, 74]) W.box(px, 0, pz, 0.45, 4.2, 0.45, 'concrete', 0xc8c8c0);
  W.box(146, 0, 70, 0.8, 1.7, 0.5, 'metal', 0x9a4a30); W.box(154, 0, 70, 0.8, 1.7, 0.5, 'metal', 0x9a4a30); car(168, 78, 0.9, 0x7a6a3a);
  W.pois.push({ name: 'ZB-1011', x: 200, z: 60, r: 14 });
  fence(160, 100, 200, 100); for (let i = 0; i < 12; i++) tree(120 + rnd(0, 80), 104 + rnd(0, 12), rnd(0.8, 1.3));

  // ---- EAST: Dorms
  building({ name: 'Dorms (2-storey)', x: 150, z: -75, w: 44, d: 12, floors: 2, fh: 3.1, mat: 'brick', color: 0xe0d8c8, layout: 'corridor', doors: [{ side: 's', at: 3.6 }, { side: 's', at: 30 }, { side: 'n', at: 22 }] });
  building({ name: 'Dorms (3-storey)', x: 175, z: -35, w: 12, d: 44, floors: 3, fh: 3.1, mat: 'brick', color: 0xe8e0d0, layout: 'corridor', doors: [{ side: 'w', at: 3.6 }, { side: 'w', at: 30 }, { side: 'e', at: 22 }] });
  concreteWall(120, -95, 200, -95, 2.6); concreteWall(200, -95, 200, -60, 2.6); car(140, -55, 0.1, 0x4a3a6a); car(165, -60, 1.6, 0x8a8a7a); bus(130, -50, 0.02); lamp(150, -60); lamp(175, -62);
  for (let i = 0; i < 4; i++) W.box(128 + i * 0.5, 0, -62 + i * 4, 0.6, 0.9, 1.0, 'flat', 0x6a6a5a); // dumpsters
  W.box(162, 0, -55, 1.2, 1.5, 1.0, 'metal', 0x3a5a3a);
  // east field, trees
  for (let i = 0; i < 25; i++) tree(60 + rnd(0, 140), rnd(10, 60), rnd(0.7, 1.4));
  for (let i = 0; i < 20; i++) bush(rnd(-200, 200), rnd(-115, 115), rnd(0.8, 1.5));
  for (let i = 0; i < 25; i++) tree(-70 + rnd(0, 60), rnd(-95, -80), rnd(0.8, 1.3));
  for (let i = 0; i < 18; i++) tree(-20 + rnd(0, 60), rnd(25, 45), rnd(0.7, 1.1));
  for (let i = 0; i < 16; i++) { const x = rnd(-200, 200), z = rnd(-115, 115); if (Math.abs(z) > 12 && Math.abs(x - 40) > 12 && !(x > -105 && x < -78) && W.pointFreeStatic(x, z, 6)) W.box(x, 0, z, rnd(1, 2.5), rnd(0.6, 1.4), rnd(1, 2), 'flat', 0x777770, { ry: rnd(0, 3), shade: 0.2 }); } // rocks
  // scaffold near dorms & random loose loot crates in the open
  for (let i = 0; i < 10; i++) { const x = rnd(-190, 190), z = rnd(-110, 110); if (W.pointFreeStatic(x, z, 3) && !W.inWater(x, z)) lootSpot(x, 0, z, ['crate', 'duffle', 'toolbox']); }

  // ---- extracts (Tarkov-like set; a couple close randomly per raid)
  W.extracts = [
    { name: 'Trailer Park', x: -195, z: 85, r: 7, time: 8 },
    { name: 'Crossroads', x: 40, z: 112, r: 7, time: 8 },
    { name: 'RUAF Roadblock', x: 100, z: -112, r: 7, time: 8, rnd: true },
    { name: 'ZB-1011', x: 203, z: 60, r: 6, time: 10 },
    { name: 'Old Gas Station', x: 140, z: 112, r: 7, time: 8, rnd: true },
    { name: 'Dorms V-Ex (car)', x: 192, z: -80, r: 6, time: 6, cost: 5000 },
    { name: 'Smuggler\'s Boat', x: -92, z: -114, r: 7, time: 10, rnd: true },
  ];
  W.spawns.west = [[-190, -30], [-185, 20], [-175, -75], [-165, 95], [-120, 95], [-120, -95]];
  W.spawns.east = [[195, -20], [190, 30], [185, 90], [120, 70], [170, 100], [195, -105]];
  W.scavSpawns = [[-140, 12], [-150, -35], [-170, 60], [-50, -30], [-40, 5], [20, 10], [40, 60], [-10, 75], [45, -40], [100, -35], [150, 75], [150, -58], [170, -10], [95, -95], [60, -95], [-100, 60], [10, -60], [130, 20]];
  W.finalize();
  // nav points: open grid points (outdoors, ground level)
  for (let x = B.x0 + 5; x < B.x1 - 5; x += 5) for (let z = B.z0 + 5; z < B.z1 - 5; z += 5) if (W.pointFree(x, 0, z, 0.8) && !W.inWater(x, z)) W.navPoints.push([x, z]);
}
// quick static overlap check used during construction (before grid exists)
World.pointFreeStatic = function (x, z, pad) { for (const c of this.colliders) if (x > c.min.x - pad && x < c.max.x + pad && z > c.min.z - pad && z < c.max.z + pad) return false; return true; };

// ---------------------------------------------------------------- containers (per raid)
function spawnContainers() {
  // remove old
  for (const c of World.containers) { if (c.mesh) { World.scene.remove(c.mesh); } if (c.collider) { c.collider.disabled = true; } }
  World.containers = [];
  const spots = LOOTSPOTS.slice().sort(() => Math.random() - 0.5); const n = Math.floor(spots.length * 0.75);
  for (let i = 0; i < n; i++) {
    const s = spots[i], type = pick(s.types), def = CONTAINERS[type];
    const c = { type, def, x: s.x, y: s.y + (def.hang ? 1.0 : 0), z: s.z, items: [], searched: false, ry: s.ry };
    const geo = new THREE.BoxGeometry(def.size[0], def.size[1], def.size[2]); geo.translate(0, def.size[1] / 2, 0);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.85, map: def.mat === 'wood' ? World.mats.wood.map : def.mat === 'metal' ? World.mats.metal.map : null }));
    mesh.position.set(c.x, c.y, c.z); mesh.rotation.y = s.ry; mesh.castShadow = true; World.scene.add(mesh); c.mesh = mesh;
    const rx = Math.abs(Math.cos(s.ry)) > 0.5 ? def.size[0] : def.size[2], rz = Math.abs(Math.cos(s.ry)) > 0.5 ? def.size[2] : def.size[0];
    c.collider = World.addCollider(c.x - rx / 2, c.y, c.z - rz / 2, c.x + rx / 2, c.y + def.size[1], c.z + rz / 2, def.mat === 'metal' ? 'metal' : 'wood', { container: c });
    if (def.hang) c.collider.min.y = c.y - 0.2;
    World.gridInsert(c.collider);
    rollContainer(c); World.containers.push(c);
  }
}
