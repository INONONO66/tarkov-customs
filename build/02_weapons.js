
// ============================================================================
//  WEAPONS: definitions, mods, ammo, gear, stats, procedural weapon meshes
// ============================================================================
const AMMO = {
  '5.45x39': [
    { id: '545ps', name: '5.45 PS', dmg: 50, pen: 28, price: 60, rec: 1.0 },
    { id: '545hp', name: '5.45 HP', dmg: 74, pen: 11, price: 40, rec: 0.95 },
    { id: '545bt', name: '5.45 BT', dmg: 44, pen: 37, price: 160, rec: 1.05 },
    { id: '545bp', name: '5.45 BP', dmg: 46, pen: 45, price: 320, rec: 1.1 }],
  '7.62x39': [
    { id: '762t', name: '7.62 T-45M', dmg: 62, pen: 25, price: 45, rec: 1.0 },
    { id: '762ps', name: '7.62 PS', dmg: 57, pen: 33, price: 80, rec: 1.0 },
    { id: '762bp', name: '7.62 BP', dmg: 58, pen: 47, price: 420, rec: 1.08 }],
  '5.56x45': [
    { id: '556m856', name: '5.56 M856', dmg: 59, pen: 23, price: 50, rec: 0.95 },
    { id: '556m855', name: '5.56 M855', dmg: 54, pen: 31, price: 100, rec: 1.0 },
    { id: '556a1', name: '5.56 M855A1', dmg: 49, pen: 44, price: 360, rec: 1.05 }],
  '9x19': [
    { id: '9pst', name: '9x19 PST', dmg: 54, pen: 20, price: 50, rec: 1.0 },
    { id: '9rip', name: '9x19 RIP', dmg: 102, pen: 2, price: 130, rec: 0.9 },
    { id: '9ap', name: '9x19 AP 6.3', dmg: 52, pen: 30, price: 220, rec: 1.1 }],
  '9x18': [
    { id: '918pst', name: '9x18 PST', dmg: 50, pen: 12, price: 20, rec: 1.0 },
    { id: '918pbm', name: '9x18 PBM', dmg: 40, pen: 28, price: 90, rec: 1.1 }],
  '7.62x54R': [
    { id: '54lps', name: '7.62 LPS', dmg: 81, pen: 42, price: 200, rec: 1.0 },
    { id: '54t46', name: '7.62 T-46M', dmg: 82, pen: 30, price: 150, rec: 1.0 },
    { id: '54snb', name: '7.62 SNB', dmg: 75, pen: 62, price: 650, rec: 1.05 }],
  '12/70': [
    { id: '12buck', name: '12/70 8.5mm buckshot', dmg: 37, pen: 3, price: 55, rec: 1.0, pellets: 8 },
    { id: '12flech', name: '12/70 flechette', dmg: 25, pen: 31, price: 260, rec: 0.95, pellets: 8 },
    { id: '12ap', name: '12/70 AP-20 slug', dmg: 164, pen: 37, price: 450, rec: 1.15 }],
};
const AMMO_BY_ID = {}; for (const c in AMMO) for (const a of AMMO[c]) { a.cal = c; AMMO_BY_ID[a.id] = a; }

// mods: stat deltas — rec (% recoil), ergo (abs), moa (% spread), w (kg), loud (mult), zoom, ads (mult ADS time)
const MODS = {
  muzzle: {
    none: { name: 'Bare muzzle', price: 0 },
    fh: { name: 'Flash hider', price: 6000, rec: -4, ergo: -1, w: 0.1, flash: 0.4 },
    comp: { name: 'Compensator', price: 18000, rec: -14, ergo: -3, w: 0.15, loud: 1.25 },
    brake: { name: 'Muzzle brake', price: 32000, rec: -20, ergo: -5, w: 0.25, loud: 1.4 },
    sup: { name: 'Suppressor', price: 48000, rec: -8, ergo: -12, moa: -6, w: 0.55, loud: 0.22, flash: 0.05, sup: true },
  },
  sight: {
    iron: { name: 'Iron sights', price: 0, zoom: 1 },
    reflex: { name: 'Reflex sight', price: 14000, ergo: -1, w: 0.1, zoom: 1, ads: 0.9, ret: 'dot' },
    holo: { name: 'Holographic', price: 26000, ergo: -3, w: 0.25, zoom: 1, ads: 0.92, ret: 'ring' },
    acog: { name: '4x ACOG-type', price: 55000, ergo: -8, w: 0.45, zoom: 4, ads: 1.25, scope: true },
    pso: { name: '6x sniper scope', price: 70000, ergo: -12, w: 0.7, zoom: 6, ads: 1.4, scope: true },
  },
  handguard: {
    std: { name: 'Standard', price: 0 },
    rail: { name: 'Railed handguard', price: 22000, rec: -3, ergo: 3, w: 0.05, grips: true },
    heavy: { name: 'Heavy tactical handguard', price: 38000, rec: -7, ergo: -4, w: 0.35, grips: true, tan: true },
  },
  grip: {
    none: { name: 'No foregrip', price: 0 },
    vert: { name: 'Vertical grip', price: 9000, rec: -7, ergo: -1, w: 0.12 },
    angled: { name: 'Angled grip', price: 12000, rec: -3, ergo: 6, w: 0.08 },
    stubby: { name: 'Stubby grip', price: 15000, rec: -5, ergo: 3, w: 0.09 },
  },
  stock: {
    std: { name: 'Standard stock', price: 0 },
    fold: { name: 'Skeleton stock', price: 12000, rec: 4, ergo: 8, w: -0.25 },
    heavy: { name: 'Heavy buffer stock', price: 30000, rec: -12, ergo: -6, w: 0.4, tan: true },
    pad: { name: 'Padded stock', price: 20000, rec: -8, ergo: -2, w: 0.2 },
  },
  mag: {
    std: { name: 'Standard mag', price: 0, cap: 1 },
    quick: { name: 'Short mag', price: 4000, ergo: 4, w: -0.1, cap: 0.67 },
    ext: { name: 'Extended mag', price: 14000, ergo: -6, w: 0.25, cap: 1.5 },
    drum: { name: 'Drum mag', price: 45000, ergo: -16, rec: -2, w: 0.9, cap: 2.5, drum: true },
  },
  tactical: {
    none: { name: 'Nothing', price: 0 },
    light: { name: 'Flashlight', price: 9000, ergo: -2, w: 0.12, light: true },
    laser: { name: 'Laser', price: 16000, ergo: -1, w: 0.08, moa: -5, laser: true, hip: 0.6 },
  },
};
const SLOT_ORDER = ['muzzle', 'sight', 'handguard', 'grip', 'stock', 'mag', 'tactical'];

// weapon definitions. kind: audio class; fam: mesh family
const WEAPONS = {
  pm: { name: 'PM 9x18 pistol', cal: '9x18', kind: 'pistol', fam: 'pm', rpm: 400, modes: ['semi'], recV: 55, recH: 30, ergo: 78, moa: 6, mag: 8, w: 0.73, price: 9000, slot: 'sec',
    slots: { muzzle: ['none', 'sup'], sight: ['iron'], tactical: ['none', 'laser'] } },
  mp5: { name: 'MP5 9x19', cal: '9x19', kind: 'smg', fam: 'mp5', rpm: 800, modes: ['auto', 'semi'], recV: 62, recH: 45, ergo: 62, moa: 5, mag: 30, w: 2.6, price: 34000,
    slots: { muzzle: ['none', 'fh', 'comp', 'sup'], sight: ['iron', 'reflex', 'holo'], handguard: ['std', 'rail'], grip: ['none', 'vert', 'angled', 'stubby'], stock: ['std', 'fold', 'pad'], mag: ['std', 'quick', 'ext', 'drum'], tactical: ['none', 'light', 'laser'] } },
  ak74n: { name: 'AK-74N 5.45x39', cal: '5.45x39', kind: 'rifle', fam: 'ak', rpm: 650, modes: ['auto', 'semi'], recV: 118, recH: 82, ergo: 42, moa: 3.6, mag: 30, w: 3.4, price: 42000,
    slots: { muzzle: ['none', 'fh', 'comp', 'brake', 'sup'], sight: ['iron', 'reflex', 'holo', 'acog', 'pso'], handguard: ['std', 'rail', 'heavy'], grip: ['none', 'vert', 'angled', 'stubby'], stock: ['std', 'fold', 'heavy', 'pad'], mag: ['std', 'quick', 'ext', 'drum'], tactical: ['none', 'light', 'laser'] } },
  akm: { name: 'AKM 7.62x39', cal: '7.62x39', kind: 'rifle', fam: 'ak', wood: true, rpm: 600, modes: ['auto', 'semi'], recV: 145, recH: 95, ergo: 40, moa: 4.0, mag: 30, w: 3.3, price: 48000,
    slots: { muzzle: ['none', 'fh', 'comp', 'brake', 'sup'], sight: ['iron', 'reflex', 'holo', 'acog', 'pso'], handguard: ['std', 'rail', 'heavy'], grip: ['none', 'vert', 'angled', 'stubby'], stock: ['std', 'fold', 'heavy', 'pad'], mag: ['std', 'quick', 'ext', 'drum'], tactical: ['none', 'light', 'laser'] } },
  m4a1: { name: 'M4A1 5.56x45', cal: '5.56x45', kind: 'rifle', fam: 'm4', rpm: 800, modes: ['auto', 'semi'], recV: 95, recH: 70, ergo: 55, moa: 2.8, mag: 30, w: 3.1, price: 78000,
    slots: { muzzle: ['none', 'fh', 'comp', 'brake', 'sup'], sight: ['iron', 'reflex', 'holo', 'acog', 'pso'], handguard: ['std', 'rail', 'heavy'], grip: ['none', 'vert', 'angled', 'stubby'], stock: ['std', 'fold', 'heavy', 'pad'], mag: ['std', 'quick', 'ext', 'drum'], tactical: ['none', 'light', 'laser'] } },
  mp153: { name: 'MP-153 12ga', cal: '12/70', kind: 'shotgun', fam: 'shotgun', rpm: 180, modes: ['semi'], recV: 260, recH: 120, ergo: 45, moa: 8, mag: 6, w: 3.6, price: 30000,
    slots: { muzzle: ['none', 'comp'], sight: ['iron', 'reflex', 'holo'], stock: ['std', 'fold', 'pad'], tactical: ['none', 'light', 'laser'] } },
  mosin: { name: 'Mosin 7.62x54R', cal: '7.62x54R', kind: 'sniper', fam: 'mosin', rpm: 30, modes: ['bolt'], recV: 210, recH: 130, ergo: 32, moa: 1.6, mag: 5, w: 4.0, price: 45000,
    slots: { muzzle: ['none', 'brake', 'sup'], sight: ['iron', 'pso'], stock: ['std', 'pad'], tactical: ['none'] } },
};

const GEAR = {
  armor: [
    { id: 'none', name: 'No armor', price: 0, cls: 0, w: 0 },
    { id: 'paca', name: 'PACA soft armor (cl.2)', price: 22000, cls: 2, w: 3.5 },
    { id: '6b23', name: '6B23-1 (cl.4)', price: 68000, cls: 4, w: 8.5 },
    { id: 'slick', name: 'Slick plate carrier (cl.6)', price: 210000, cls: 6, w: 6.5 }],
  helmet: [
    { id: 'none', name: 'No helmet', price: 0, cls: 0, w: 0 },
    { id: 'ssh', name: 'SSh-68 steel (cl.3)', price: 18000, cls: 3, w: 1.5 },
    { id: 'altyn', name: 'Altyn heavy (cl.5)', price: 140000, cls: 5, w: 4.5 }],
  backpack: [
    { id: 'none', name: 'Pockets only (6 slots)', price: 0, slots: 6, w: 0 },
    { id: 'scavbp', name: 'Scav backpack (14 slots)', price: 14000, slots: 14, w: 0.6 },
    { id: 'berkut', name: 'Berkut (22 slots)', price: 42000, slots: 22, w: 1.0 },
    { id: 'pilgrim', name: 'Pilgrim (36 slots)', price: 95000, slots: 36, w: 2.5 }],
};
const SUPPLIES = [
  { id: 'bandage', name: 'Army bandage', price: 2500, kind: 'med', med: 'bandage', w: 0.1, value: 1500 },
  { id: 'ai2', name: 'AI-2 medkit', price: 4500, kind: 'med', med: 'kit', hp: 100, w: 0.2, value: 3000 },
  { id: 'salewa', name: 'Salewa first aid kit', price: 24000, kind: 'med', med: 'kit', hp: 400, heavy: true, w: 0.6, value: 16000 },
  { id: 'pain', name: 'Analgin painkillers', price: 4000, kind: 'med', med: 'pain', w: 0.05, value: 2500 },
];

// ------------------------------------------------------------------ stats
let _uid = 1;
const uid = () => (_uid++) + '_' + Math.random().toString(36).slice(2, 7);
function newWeapon(type, opts = {}) {
  const d = WEAPONS[type], mods = {};
  for (const s of SLOT_ORDER) if (d.slots[s]) mods[s] = d.slots[s][0];
  Object.assign(mods, opts.mods || {});
  return { id: uid(), type, mods, ammo: opts.ammo || AMMO[d.cal][0].id };
}
function weaponStats(wp) {
  const d = WEAPONS[wp.type], am = AMMO_BY_ID[wp.ammo] || AMMO[d.cal][0];
  let rec = 0, ergo = d.ergo, moa = 0, w = d.w, loud = 1, zoom = 1, ads = 1, cap = 1, flash = 1, hip = 1;
  const flags = {};
  for (const s in wp.mods) {
    const m = MODS[s] && MODS[s][wp.mods[s]]; if (!m) continue;
    rec += m.rec || 0; ergo += m.ergo || 0; moa += m.moa || 0; w += m.w || 0; loud *= m.loud || 1; ads *= m.ads || 1;
    if (m.zoom) zoom = m.zoom; if (m.cap) cap = m.cap; if (m.flash !== undefined) flash = m.flash; if (m.hip) hip = m.hip;
    if (m.sup) flags.sup = true; if (m.scope) flags.scope = true; if (m.light) flags.light = true; if (m.laser) flags.laser = true; if (m.ret) flags.ret = m.ret;
  }
  ergo = clamp(ergo, 5, 100);
  const recMul = (1 + rec / 100) * am.rec;
  return {
    name: d.name, kind: d.kind, cal: d.cal, rpm: d.rpm, modes: d.modes,
    recV: d.recV * recMul, recH: d.recH * recMul, ergo, moa: d.moa * (1 + moa / 100),
    adsTime: lerp(0.5, 0.16, ergo / 100) * ads, sway: lerp(1.7, 0.35, ergo / 100), weight: w,
    loud, noiseRange: (d.kind === 'pistol' ? 120 : d.kind === 'smg' ? 150 : 220) * loud, zoom, flash, hip,
    magSize: Math.max(1, Math.round(d.mag * cap)), dmg: am.dmg, pen: am.pen, pellets: am.pellets || 1, ammo: am, flags,
  };
}
function weaponValue(wp) { const d = WEAPONS[wp.type]; let v = d.price; for (const s in wp.mods) { const m = MODS[s][wp.mods[s]]; if (m) v += m.price; } return v; }
function weaponLabel(wp) { const d = WEAPONS[wp.type]; const extra = SLOT_ORDER.filter(s => wp.mods[s] && wp.mods[s] !== WEAPONS[wp.type].slots[s][0]).length; return d.name + (extra ? ` (+${extra} mods)` : ''); }

// ------------------------------------------------------------------ meshes
const WMAT = {
  metal: new THREE.MeshStandardMaterial({ color: 0x3c3c40, roughness: 0.5, metalness: 0.35 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x1c1c1e, roughness: 0.7, metalness: 0.2 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x6e4425, roughness: 0.75 }),
  poly: new THREE.MeshStandardMaterial({ color: 0x1d1d1f, roughness: 0.85 }),
  plum: new THREE.MeshStandardMaterial({ color: 0x3a2233, roughness: 0.85 }),
  tan: new THREE.MeshStandardMaterial({ color: 0x8a7455, roughness: 0.85 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x4a7a9a, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.55 }),
  red: new THREE.MeshBasicMaterial({ color: 0xff2020 }),
  lens: new THREE.MeshStandardMaterial({ color: 0x0b1522, roughness: 0.05, metalness: 0.7 }),
  light: new THREE.MeshBasicMaterial({ color: 0xffffee }),
};
const _boxGeoCache = {};
function boxGeo(w, h, l) { const k = w + ',' + h + ',' + l; return _boxGeoCache[k] || (_boxGeoCache[k] = new THREE.BoxGeometry(w, h, l)); }
function mBox(g, mat, w, h, l, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(boxGeo(w, h, l), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); g.add(m); return m;
}
function mCyl(g, mat, r, len, x, y, z, axis = 'z', r2) { // cylinder along axis
  const geo = new THREE.CylinderGeometry(r2 === undefined ? r : r2, r, len, 12);
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  if (axis === 'z') m.rotation.x = Math.PI / 2; else if (axis === 'x') m.rotation.z = Math.PI / 2;
  g.add(m); return m;
}

// Builds a weapon mesh. Local space: -Z is muzzle direction, origin at trigger. Returns group with userData:
//  muzzle (Vector3), aim (Vector3: point eye should look through for ADS), lightPos, flags
function buildWeaponMesh(wp) {
  const d = WEAPONS[wp.type], st = weaponStats(wp), g = new THREE.Group(), M = wp.mods;
  const body = d.wood || d.fam === 'ak' && wp.type === 'akm' ? WMAT.wood : d.fam === 'ak' ? WMAT.plum : WMAT.poly;
  let bore = 0.035, muzzleZ = -0.5, hgFrom = -0.22, hgTo = -0.40, railY = 0.07, sightZ = -0.14, stockZ = 0.02, hgMat = body, hasStock = true;
  const ud = g.userData;
  // ---------------- family base geometry
  if (d.fam === 'ak') {
    mBox(g, WMAT.metal, 0.042, 0.075, 0.30, 0, 0.03, -0.11);           // receiver
    mBox(g, WMAT.metal, 0.044, 0.02, 0.28, 0, 0.078, -0.12);           // dust cover
    mBox(g, WMAT.metal, 0.03, 0.03, 0.03, 0, 0.1, -0.06);              // rear sight block
    mCyl(g, WMAT.metal, 0.009, 0.36, 0, bore, -0.44);                  // barrel
    mCyl(g, WMAT.metal, 0.011, 0.19, 0, 0.07, -0.34);                  // gas tube
    mBox(g, WMAT.metal, 0.03, 0.05, 0.04, 0, 0.055, -0.47);            // gas block
    mBox(g, WMAT.metal, 0.025, 0.045, 0.02, 0, 0.075, -0.56);          // front sight base
    mBox(g, WMAT.metal, 0.004, 0.025, 0.004, 0, 0.11, -0.56);          // front sight post
    mBox(g, body, 0.035, 0.09, 0.045, 0, -0.045, 0.02, 0.35);          // pistol grip
    mBox(g, WMAT.metal, 0.02, 0.04, 0.05, 0, -0.03, -0.09);            // trigger guard
    mBox(g, WMAT.metal, 0.006, 0.03, 0.008, 0, -0.02, -0.07, 0.3);     // trigger
    muzzleZ = -0.62; hgFrom = -0.25; hgTo = -0.43; railY = 0.088; sightZ = -0.16; stockZ = 0.04;
    ud.aimIron = V3(0, 0.122, -0.06);
  } else if (d.fam === 'm4') {
    mBox(g, WMAT.metal, 0.04, 0.05, 0.22, 0, 0.055, -0.1);             // upper
    mBox(g, WMAT.metal, 0.04, 0.05, 0.2, 0, 0.01, -0.1);               // lower
    mBox(g, WMAT.metal, 0.012, 0.012, 0.09, 0.03, 0.045, -0.02);       // charging handle side
    mCyl(g, WMAT.metal, 0.009, 0.36, 0, bore, -0.42);                  // barrel
    mBox(g, WMAT.metal, 0.03, 0.05, 0.03, 0, 0.06, -0.44);             // gas block / front sight
    mBox(g, WMAT.metal, 0.004, 0.025, 0.004, 0, 0.1, -0.44);
    mBox(g, WMAT.metal, 0.04, 0.02, 0.22, 0, 0.09, -0.1);              // top rail
    mBox(g, WMAT.metal, 0.024, 0.02, 0.02, 0, 0.11, -0.02);            // rear flip sight
    mBox(g, WMAT.poly, 0.035, 0.09, 0.04, 0, -0.045, 0.02, 0.4);       // pistol grip
    mBox(g, WMAT.metal, 0.02, 0.006, 0.06, 0, -0.03, -0.09);           // trigger guard
    mBox(g, WMAT.metal, 0.006, 0.03, 0.008, 0, -0.02, -0.07, 0.3);
    muzzleZ = -0.6; hgFrom = -0.22; hgTo = -0.42; railY = 0.1; sightZ = -0.14; stockZ = 0.02; hgMat = WMAT.poly;
    ud.aimIron = V3(0, 0.122, -0.02);
  } else if (d.fam === 'mp5') {
    mCyl(g, WMAT.metal, 0.026, 0.26, 0, 0.045, -0.1);                  // tubular receiver
    mBox(g, WMAT.metal, 0.04, 0.05, 0.22, 0, 0.02, -0.08);             // lower receiver
    mCyl(g, WMAT.metal, 0.009, 0.14, 0, bore, -0.3);                   // barrel
    mCyl(g, WMAT.metal, 0.02, 0.03, 0, 0.09, -0.05);                   // rear drum sight
    mBox(g, WMAT.metal, 0.02, 0.04, 0.008, 0, 0.09, -0.35);            // front sight hood
    mBox(g, WMAT.poly, 0.035, 0.09, 0.045, 0, -0.04, 0.02, 0.4);       // pistol grip
    mBox(g, WMAT.metal, 0.006, 0.03, 0.008, 0, -0.02, -0.06, 0.3);
    mBox(g, WMAT.poly, 0.012, 0.012, 0.09, 0.028, 0.07, -0.18);        // charging handle tube
    muzzleZ = -0.38; hgFrom = -0.15; hgTo = -0.32; railY = 0.075; sightZ = -0.12; stockZ = 0.04; hgMat = WMAT.poly;
    ud.aimIron = V3(0, 0.1, -0.05);
  } else if (d.fam === 'mosin') {
    mBox(g, WMAT.wood, 0.045, 0.06, 0.9, 0, -0.005, -0.28);            // full stock
    mBox(g, WMAT.wood, 0.045, 0.05, 0.3, 0, 0.0, 0.14, 0.12);          // butt slope
    mBox(g, WMAT.wood, 0.04, 0.1, 0.05, 0, -0.03, 0.26);               // buttplate
    mBox(g, WMAT.metal, 0.035, 0.035, 0.18, 0, 0.045, -0.05);          // receiver
    mCyl(g, WMAT.metal, 0.012, 0.6, 0, 0.045, -0.44);                  // barrel
    mCyl(g, WMAT.metal, 0.008, 0.1, 0.03, 0.06, -0.02, 'x');           // bolt handle
    mBox(g, WMAT.metal, 0.02, 0.025, 0.06, 0, 0.075, -0.2);            // rear sight
    mBox(g, WMAT.metal, 0.004, 0.03, 0.004, 0, 0.08, -0.7);
    mBox(g, WMAT.metal, 0.006, 0.03, 0.008, 0, -0.03, -0.05, 0.3);
    bore = 0.045; muzzleZ = -0.74; railY = 0.065; sightZ = -0.02; stockZ = 0.3; hasStock = false;
    ud.aimIron = V3(0, 0.095, -0.2);
  } else if (d.fam === 'shotgun') {
    mBox(g, WMAT.metal, 0.04, 0.06, 0.2, 0, 0.03, -0.1);               // receiver
    mCyl(g, WMAT.metal, 0.011, 0.5, 0, 0.045, -0.45);                  // barrel
    mCyl(g, WMAT.metal, 0.014, 0.4, 0, 0.005, -0.4);                   // mag tube
    mBox(g, WMAT.poly, 0.045, 0.055, 0.16, 0, 0.02, -0.38);            // forend
    mBox(g, WMAT.metal, 0.004, 0.006, 0.004, 0, 0.065, -0.68);         // bead
    mBox(g, WMAT.poly, 0.035, 0.09, 0.05, 0, -0.045, 0.02, 0.35);      // grip
    mBox(g, WMAT.metal, 0.006, 0.03, 0.008, 0, -0.02, -0.06, 0.3);
    bore = 0.045; muzzleZ = -0.7; railY = 0.06; sightZ = -0.1; stockZ = 0.04;
    ud.aimIron = V3(0, 0.07, -0.1);
  } else if (d.fam === 'pm') {
    mBox(g, WMAT.metal, 0.025, 0.028, 0.16, 0, 0.03, -0.06);           // slide
    mBox(g, WMAT.metal, 0.024, 0.02, 0.1, 0, 0.012, -0.05);            // frame
    mBox(g, WMAT.plum, 0.026, 0.085, 0.032, 0, -0.04, 0.005, 0.3);     // grip
    mBox(g, WMAT.metal, 0.004, 0.008, 0.004, 0, 0.048, -0.13);         // front sight
    mBox(g, WMAT.metal, 0.012, 0.008, 0.006, 0, 0.048, 0.01);          // rear sight
    mBox(g, WMAT.metal, 0.016, 0.006, 0.03, 0, -0.005, -0.03);         // trigger guard
    mBox(g, WMAT.metal, 0.005, 0.018, 0.006, 0, 0.0, -0.025, 0.3);
    bore = 0.03; muzzleZ = -0.14; hasStock = false; sightZ = 0; railY = 0;
    ud.aimIron = V3(0, 0.052, 0.01);
  }
  // ---------------- handguard
  if (d.slots.handguard) {
    const len = hgFrom - hgTo, zc = (hgFrom + hgTo) / 2, hg = M.handguard;
    if (hg === 'std') {
      mBox(g, hgMat, 0.042, 0.05, len, 0, 0.02, zc);
      if (d.fam === 'ak') mBox(g, hgMat, 0.038, 0.025, len * 0.9, 0, 0.078, zc);
    } else if (hg === 'rail') {
      mBox(g, WMAT.dark, 0.04, 0.055, len, 0, 0.025, zc);
      for (let i = 0; i < 6; i++) mBox(g, WMAT.metal, 0.05, 0.006, 0.006, 0, 0.0, hgFrom - 0.02 - i * (len / 6.5));
      mBox(g, WMAT.metal, 0.03, 0.006, len, 0, 0.056, zc); mBox(g, WMAT.metal, 0.03, 0.006, len, 0, -0.005, zc);
    } else {
      mBox(g, WMAT.tan, 0.05, 0.065, len + 0.06, 0, 0.03, zc - 0.03);
      mBox(g, WMAT.dark, 0.03, 0.008, len + 0.06, 0, 0.066, zc - 0.03); mBox(g, WMAT.dark, 0.03, 0.008, len + 0.06, 0, -0.005, zc - 0.03);
      for (let i = 0; i < 5; i++) mBox(g, WMAT.dark, 0.06, 0.012, 0.012, 0, 0.03, hgFrom - 0.03 - i * (len / 5));
    }
    // foregrip
    const gr = M.grip, gz = hgTo + 0.06;
    if (gr === 'vert') mBox(g, WMAT.dark, 0.026, 0.09, 0.03, 0, -0.05, gz);
    else if (gr === 'angled') mBox(g, WMAT.dark, 0.026, 0.05, 0.07, 0, -0.03, gz, 0.6);
    else if (gr === 'stubby') mBox(g, WMAT.dark, 0.028, 0.055, 0.03, 0, -0.035, gz);
  }
  // ---------------- magazine
  if (d.slots.mag || d.fam === 'pm') {
    const mg = M.mag || 'std', curved = d.fam === 'ak', mz = d.fam === 'mp5' ? -0.16 : -0.15;
    if (d.fam === 'pm') { /* internal */ }
    else if (mg === 'drum') { mCyl(g, WMAT.dark, 0.06, 0.05, 0, -0.08, mz - 0.01, 'x'); mBox(g, WMAT.dark, 0.03, 0.05, 0.06, 0, -0.03, mz); }
    else {
      const h = mg === 'quick' ? 0.11 : mg === 'ext' ? 0.26 : 0.18, mat = mg === 'std' ? (d.fam === 'ak' ? WMAT.plum : WMAT.metal) : WMAT.dark;
      mBox(g, mat, 0.03, h, 0.065, 0, -0.03 - h / 2, mz - (curved ? h * 0.18 : 0), curved ? 0.25 : d.fam === 'mp5' ? 0.15 : 0);
    }
  }
  // ---------------- stock
  if (hasStock) {
    const s = M.stock || 'std';
    if (d.fam === 'pm') { }
    else if (s === 'std') {
      if (d.fam === 'm4') { mCyl(g, WMAT.metal, 0.015, 0.2, 0, 0.045, stockZ + 0.12); mBox(g, WMAT.poly, 0.04, 0.1, 0.16, 0, 0.005, stockZ + 0.2); }
      else mBox(g, body === WMAT.wood ? WMAT.wood : WMAT.poly, 0.04, 0.06, 0.28, 0, 0.02, stockZ + 0.16, 0);
      mBox(g, WMAT.dark, 0.042, 0.11, 0.02, 0, 0.0, stockZ + 0.3);
    } else if (s === 'fold') {
      mBox(g, WMAT.metal, 0.012, 0.012, 0.28, 0.012, 0.06, stockZ + 0.15); mBox(g, WMAT.metal, 0.012, 0.012, 0.28, -0.012, 0.06, stockZ + 0.15);
      mBox(g, WMAT.metal, 0.012, 0.012, 0.25, 0, -0.02, stockZ + 0.16, 0.25);
      mBox(g, WMAT.dark, 0.04, 0.1, 0.02, 0, 0.02, stockZ + 0.29);
    } else if (s === 'heavy') {
      mCyl(g, WMAT.metal, 0.018, 0.16, 0, 0.045, stockZ + 0.1); mBox(g, WMAT.tan, 0.05, 0.11, 0.2, 0, 0.0, stockZ + 0.22); mBox(g, WMAT.dark, 0.052, 0.12, 0.025, 0, 0.0, stockZ + 0.32);
    } else { // padded
      mBox(g, WMAT.poly, 0.04, 0.06, 0.26, 0, 0.02, stockZ + 0.15); mBox(g, WMAT.dark, 0.045, 0.12, 0.04, 0, 0.0, stockZ + 0.3);
    }
  }
  // ---------------- muzzle device
  const mu = M.muzzle || 'none'; let mz = muzzleZ;
  if (mu === 'fh') { mCyl(g, WMAT.dark, 0.012, 0.05, 0, bore, muzzleZ - 0.02); mz -= 0.045; }
  else if (mu === 'comp') { mBox(g, WMAT.dark, 0.026, 0.026, 0.06, 0, bore, muzzleZ - 0.025); mBox(g, WMAT.metal, 0.04, 0.008, 0.02, 0, bore + 0.01, muzzleZ - 0.02); mz -= 0.055; }
  else if (mu === 'brake') { mCyl(g, WMAT.dark, 0.016, 0.075, 0, bore, muzzleZ - 0.03); mBox(g, WMAT.metal, 0.05, 0.012, 0.012, 0, bore, muzzleZ - 0.02); mBox(g, WMAT.metal, 0.05, 0.012, 0.012, 0, bore, muzzleZ - 0.045); mz -= 0.07; }
  else if (mu === 'sup') { const L = d.kind === 'pistol' ? 0.12 : 0.19, r = d.kind === 'pistol' ? 0.014 : 0.021; mCyl(g, WMAT.dark, r, L, 0, bore, muzzleZ - L / 2 + 0.01); mz -= L - 0.01; }
  ud.muzzle = V3(0, bore, mz);
  // ---------------- sight
  const si = M.sight || 'iron'; ud.aim = ud.aimIron.clone();
  if (si === 'reflex') { // small open-frame red dot
    mBox(g, WMAT.dark, 0.025, 0.012, 0.05, 0, railY + 0.006, sightZ); const cy = railY + 0.03, fz = sightZ - 0.02;
    mBox(g, WMAT.dark, 0.004, 0.03, 0.004, -0.014, cy, fz); mBox(g, WMAT.dark, 0.004, 0.03, 0.004, 0.014, cy, fz); mBox(g, WMAT.dark, 0.032, 0.004, 0.004, 0, cy + 0.015, fz); mBox(g, WMAT.dark, 0.032, 0.004, 0.004, 0, cy - 0.013, fz);
    mBox(g, WMAT.glass, 0.024, 0.026, 0.001, 0, cy, fz); mBox(g, WMAT.red, 0.0015, 0.0015, 0.0015, 0, cy, fz + 0.001); ud.aim.set(0, cy, fz); }
  else if (si === 'holo') { // boxy holographic sight: base, hood frame, glass
    mBox(g, WMAT.dark, 0.04, 0.012, 0.09, 0, railY + 0.006, sightZ); const cy = railY + 0.035, fz = sightZ - 0.03;
    mBox(g, WMAT.dark, 0.006, 0.04, 0.05, -0.02, cy, fz + 0.02); mBox(g, WMAT.dark, 0.006, 0.04, 0.05, 0.02, cy, fz + 0.02); mBox(g, WMAT.dark, 0.046, 0.006, 0.05, 0, cy + 0.02, fz + 0.02); mBox(g, WMAT.dark, 0.02, 0.012, 0.03, 0, railY + 0.018, sightZ + 0.02);
    mBox(g, WMAT.glass, 0.034, 0.034, 0.001, 0, cy, fz); mBox(g, WMAT.red, 0.002, 0.002, 0.0015, 0, cy, fz + 0.001); ud.aim.set(0, cy, fz); }
  else if (si === 'acog') { mBox(g, WMAT.dark, 0.03, 0.015, 0.06, 0, railY + 0.008, sightZ); mCyl(g, WMAT.dark, 0.02, 0.12, 0, railY + 0.036, sightZ, 'z', 0.024); mCyl(g, WMAT.lens, 0.018, 0.004, 0, railY + 0.036, sightZ + 0.06); mCyl(g, WMAT.lens, 0.022, 0.004, 0, railY + 0.036, sightZ - 0.06); ud.aim.set(0, railY + 0.036, sightZ + 0.06); }
  else if (si === 'pso') { const sz = sightZ - (d.fam === 'mosin' ? 0.0 : 0.02); mBox(g, WMAT.dark, 0.02, 0.03, 0.05, 0.02, railY + 0.015, sz); mCyl(g, WMAT.dark, 0.018, 0.22, 0, railY + 0.045, sz, 'z', 0.024); mCyl(g, WMAT.dark, 0.026, 0.05, 0, railY + 0.045, sz - 0.1); mCyl(g, WMAT.lens, 0.017, 0.004, 0, railY + 0.045, sz + 0.11); ud.aim.set(0, railY + 0.045, sz + 0.11); }
  // ---------------- tactical
  const ta = M.tactical || 'none', tz = (hgFrom + hgTo) / 2 || -0.1, tx = d.fam === 'pm' ? 0 : 0.032, ty = d.fam === 'pm' ? -0.005 : 0.02;
  if (ta === 'light') { mCyl(g, WMAT.dark, 0.013, 0.07, tx, ty, tz); mCyl(g, WMAT.light, 0.011, 0.004, tx, ty, tz - 0.036); ud.lightPos = V3(tx, ty, tz - 0.04); }
  else if (ta === 'laser') { mBox(g, WMAT.dark, 0.02, 0.02, 0.04, tx, ty, tz); mCyl(g, WMAT.red, 0.003, 0.004, tx, ty, tz - 0.021); ud.laserPos = V3(tx, ty, tz - 0.022); }
  ud.stats = st;
  g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  return g;
}
