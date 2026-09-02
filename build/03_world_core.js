
// ============================================================================
//  WORLD CORE: procedural textures, merged geometry builder, colliders, raycast
// ============================================================================
function makeTex(kind, S = 256) {
  const cv = document.createElement('canvas'); cv.width = cv.height = S; const c = cv.getContext('2d');
  const noise = (base, amp, n = 4000, sz = 2) => { for (let i = 0; i < n; i++) { const v = base + (Math.random() - .5) * amp; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(Math.random() * S, Math.random() * S, sz, sz); } };
  if (kind === 'concrete') {
    c.fillStyle = '#9a9a96'; c.fillRect(0, 0, S, S); noise(152, 36, 9000, 2); noise(150, 20, 3000, 4);
    c.strokeStyle = 'rgba(40,40,40,.35)'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); let x = Math.random() * S, y = Math.random() * S; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (Math.random() - .5) * 60; y += (Math.random() - .5) * 60; c.lineTo(x, y); } c.stroke(); }
  } else if (kind === 'brick') {
    c.fillStyle = '#6e6a66'; c.fillRect(0, 0, S, S);
    const bw = 32, bh = 16; for (let y = 0; y < S; y += bh) { const off = (y / bh) % 2 ? bw / 2 : 0; for (let x = -bw; x < S; x += bw) { const v = 120 + Math.random() * 60; c.fillStyle = `rgb(${v},${v * 0.55 | 0},${v * 0.42 | 0})`; c.fillRect(x + off + 1, y + 1, bw - 2, bh - 2); } }
    noise(140, 60, 3000, 1);
  } else if (kind === 'metal') {
    c.fillStyle = '#8a8d90'; c.fillRect(0, 0, S, S);
    for (let x = 0; x < S; x += 16) { const g = c.createLinearGradient(x, 0, x + 16, 0); g.addColorStop(0, '#6a6d70'); g.addColorStop(0.5, '#a3a6a9'); g.addColorStop(1, '#6a6d70'); c.fillStyle = g; c.fillRect(x, 0, 16, S); }
    noise(120, 90, 1500, 3); c.fillStyle = 'rgba(120,60,20,.25)'; for (let i = 0; i < 40; i++) c.fillRect(Math.random() * S, Math.random() * S, 3, Math.random() * 40);
  } else if (kind === 'wood') {
    c.fillStyle = '#7a5a36'; c.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y += 32) { const v = 90 + Math.random() * 50; c.fillStyle = `rgb(${v + 30},${v},${v * 0.6 | 0})`; c.fillRect(0, y + 1, S, 30); c.fillStyle = 'rgba(0,0,0,.15)'; for (let k = 0; k < 8; k++) c.fillRect(Math.random() * S, y + Math.random() * 30, 40 + Math.random() * 80, 1); }
  } else if (kind === 'ground') {
    c.fillStyle = '#585c3c'; c.fillRect(0, 0, S, S);
    for (let i = 0; i < S * S / 5; i++) { const g = Math.random(); c.fillStyle = g < 0.55 ? `rgb(${70 + Math.random() * 30},${82 + Math.random() * 30},${40 + Math.random() * 20})` : `rgb(${95 + Math.random() * 30},${82 + Math.random() * 20},${58 + Math.random() * 16})`; c.fillRect(Math.random() * S, Math.random() * S, 1 + Math.random() * 3, 1 + Math.random() * 3); }
    for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(80,70,50,.35)'; c.beginPath(); c.ellipse(Math.random() * S, Math.random() * S, 10 + Math.random() * 40, 5 + Math.random() * 15, Math.random() * 3, 0, 6.3); c.fill(); }
  } else if (kind === 'asphalt') {
    c.fillStyle = '#3c3c3c'; c.fillRect(0, 0, S, S); noise(60, 50, 12000, 2);
    c.fillStyle = 'rgba(200,200,190,.55)'; c.fillRect(S / 2 - 3, 0, 6, S * 0.45);
  } else if (kind === 'gravel') {
    c.fillStyle = '#6a655c'; c.fillRect(0, 0, S, S); noise(104, 50, 10000, 2);
  } else if (kind === 'water') {
    c.fillStyle = '#2d4a4f'; c.fillRect(0, 0, S, S); noise(70, 30, 3000, 4);
  }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.colorSpace = THREE.SRGBColorSpace; return t;
}

const World = {
  colliders: [], doors: [], containers: [], extracts: [], navPoints: [], water: [], decor: [],
  spawns: { west: [], east: [] }, scavSpawns: [], pois: [],
  geo: {}, mats: {}, texScale: { concrete: 4, brick: 3, metal: 3, wood: 2, red: 4, flat: 1 },
  bounds: { x0: -210, x1: 210, z0: -120, z1: 120 }, cell: 10, grid: null, stamp: 1,
  scene: null,
  init(scene) {
    this.scene = scene;
    const tex = { concrete: makeTex('concrete'), brick: makeTex('brick'), metal: makeTex('metal'), wood: makeTex('wood'), red: makeTex('metal') };
    for (const k in tex) { this.mats[k] = new THREE.MeshStandardMaterial({ map: tex[k], vertexColors: true, roughness: 0.92, metalness: k === 'metal' || k === 'red' ? 0.25 : 0 }); this.geo[k] = []; }
    this.mats.flat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }); this.geo.flat = [];
    this.mats.foliage = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }); this.geo.foliage = [];
    this.mats.glass = new THREE.MeshStandardMaterial({ color: 0x8fb0c0, transparent: true, opacity: 0.25, roughness: 0.2, metalness: 0.3, side: THREE.DoubleSide }); this.geo.glass = [];
    this.mats.fence = new THREE.MeshStandardMaterial({ color: 0x777777, transparent: true, opacity: 0.35, roughness: 0.6, side: THREE.DoubleSide }); this.geo.fence = [];
    this.texGround = makeTex('ground', 1024); this.texAsphalt = makeTex('asphalt', 512); this.texGravel = makeTex('gravel'); this.texWater = makeTex('water');
  },
  // AABB collider
  addCollider(x0, y0, z0, x1, y1, z1, mat = 'concrete', extra) {
    const c = { min: V3(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)), max: V3(Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)), mat, id: this.colliders.length, ...extra };
    this.colliders.push(c); return c;
  },
  // box centered at (x, y+h/2, z). colors via vertex color
  box(x, y, z, w, h, d, mat = 'concrete', color = 0xffffff, opts = {}) {
    const g = new THREE.BoxGeometry(w, h, d); const cy = y + h / 2;
    if (opts.ry) g.rotateY(opts.ry);
    g.translate(x, cy, z);
    const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, n = pos.count, col = new Float32Array(n * 3), ts = this.texScale[mat] || 3;
    const c = new THREE.Color(color), shade = opts.shade || 0;
    for (let i = 0; i < n; i++) {
      const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i), nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i));
      if (nx > 0.5) uv.setXY(i, pz / ts, py / ts); else if (ny > 0.5) uv.setXY(i, px / ts, pz / ts); else uv.setXY(i, px / ts, py / ts);
      const k = 1 - shade * Math.random();
      col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.geo[mat].push(g);
    if (opts.collide !== false && !opts.ry) return this.addCollider(x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2, opts.cmat || (mat === 'metal' || mat === 'red' ? 'metal' : mat === 'wood' ? 'wood' : 'concrete'));
    if (opts.collide !== false && opts.ry) { const r = Math.hypot(w, d) / 2 * 0.8; return this.addCollider(x - r, y, z - r, x + r, y + h, z + r, 'concrete'); }
    return null;
  },
  cyl(x, y, z, r, h, mat = 'flat', color = 0xffffff, seg = 10, collide = true, rTop) {
    const g = new THREE.CylinderGeometry(rTop === undefined ? r : rTop, r, h, seg); g.translate(x, y + h / 2, z);
    const n = g.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color(color);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); this.geo[mat].push(g);
    if (collide) return this.addCollider(x - r, y, z - r, x + r, y + h, z + r, mat === 'metal' ? 'metal' : 'concrete');
  },
  plane(x, y, z, w, d, tex, repeat, color = 0xffffff, ry = 0) {
    const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); if (ry) g.rotateY(ry); g.translate(x, y, z);
    const t = tex.clone(); t.needsUpdate = true; t.repeat.set(w / repeat, d / repeat);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: t, color, roughness: 0.95 })); m.receiveShadow = true; this.scene.add(m); return m;
  },
  finalize() {
    for (const k in this.geo) {
      if (!this.geo[k].length) continue;
      const merged = mergeGeometries(this.geo[k], false); const m = new THREE.Mesh(merged, this.mats[k]);
      m.castShadow = k !== 'glass' && k !== 'fence'; m.receiveShadow = true; this.scene.add(m); this.geo[k] = [];
    }
    this.buildGrid();
  },
  // broad-phase uniform grid over XZ
  buildGrid() {
    const b = this.bounds, cs = this.cell; this.gw = Math.ceil((b.x1 - b.x0) / cs) + 1; this.gh = Math.ceil((b.z1 - b.z0) / cs) + 1;
    this.grid = new Array(this.gw * this.gh); for (let i = 0; i < this.grid.length; i++) this.grid[i] = [];
    for (const c of this.colliders) this.gridInsert(c);
  },
  gridInsert(c) {
    const b = this.bounds, cs = this.cell;
    const x0 = clamp(Math.floor((c.min.x - b.x0) / cs), 0, this.gw - 1), x1 = clamp(Math.floor((c.max.x - b.x0) / cs), 0, this.gw - 1);
    const z0 = clamp(Math.floor((c.min.z - b.z0) / cs), 0, this.gh - 1), z1 = clamp(Math.floor((c.max.z - b.z0) / cs), 0, this.gh - 1);
    for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) this.grid[z * this.gw + x].push(c);
  },
  gridRemove(c) { for (const cell of this.grid) { const i = cell.indexOf(c); if (i >= 0) cell.splice(i, 1); } },
  cellsNear(x, z, r, out) {
    const b = this.bounds, cs = this.cell;
    const x0 = clamp(Math.floor((x - r - b.x0) / cs), 0, this.gw - 1), x1 = clamp(Math.floor((x + r - b.x0) / cs), 0, this.gw - 1);
    const z0 = clamp(Math.floor((z - r - b.z0) / cs), 0, this.gh - 1), z1 = clamp(Math.floor((z + r - b.z0) / cs), 0, this.gh - 1);
    const st = ++this.stamp;
    for (let zz = z0; zz <= z1; zz++) for (let xx = x0; xx <= x1; xx++) for (const c of this.grid[zz * this.gw + xx]) if (c._s !== st && !c.disabled) { c._s = st; out.push(c); }
    return out;
  },
  // ray vs AABBs (+ ground). returns {dist, point, normal, collider} or null
  raycast(o, d, maxD, ignoreDoors = false) {
    let best = null, bestT = maxD;
    if (d.y < -1e-6) { const t = -o.y / d.y; if (t < bestT && t > 0) { bestT = t; best = { dist: t, mat: 'ground', normal: V3(0, 1, 0) }; } }
    // walk cells along ray
    const st = ++this.stamp, b = this.bounds, cs = this.cell, steps = Math.ceil(bestT / (cs * 0.5)) + 1;
    for (let i = 0; i <= steps; i++) {
      const t = Math.min(i * cs * 0.5, bestT), px = o.x + d.x * t, pz = o.z + d.z * t;
      const gx = Math.floor((px - b.x0) / cs), gz = Math.floor((pz - b.z0) / cs);
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
        const cx = gx + dx, cz = gz + dz; if (cx < 0 || cz < 0 || cx >= this.gw || cz >= this.gh) continue;
        for (const c of this.grid[cz * this.gw + cx]) {
          if (c._s === st || c.disabled || (ignoreDoors && c.door)) continue; c._s = st;
          const r = rayAABB(o, d, c.min, c.max);
          if (r && r.t < bestT && r.t >= 0) { bestT = r.t; best = { dist: r.t, mat: c.mat, normal: r.n, collider: c }; }
        }
      }
      if (t >= bestT) break;
    }
    if (best) best.point = o.clone().addScaledVector(d, best.dist);
    return best;
  },
  inWater(x, z) { for (const w of this.water) if (x >= w.x0 && x <= w.x1 && z >= w.z0 && z <= w.z1) return true; return false; },
  // is point free (not inside a collider), used for nav sampling
  pointFree(x, y, z, pad = 0.5) {
    const out = this.cellsNear(x, z, pad + 0.1, []);
    for (const c of out) if (x > c.min.x - pad && x < c.max.x + pad && z > c.min.z - pad && z < c.max.z + pad && y + 1.6 > c.min.y && y < c.max.y) return false;
    return true;
  },
};
const _rt = { n: V3() };
function rayAABB(o, d, mn, mx) {
  let tmin = -Infinity, tmax = Infinity, axis = -1, sign = 0;
  for (let i = 0; i < 3; i++) {
    const oi = i === 0 ? o.x : i === 1 ? o.y : o.z, di = i === 0 ? d.x : i === 1 ? d.y : d.z, a = i === 0 ? mn.x : i === 1 ? mn.y : mn.z, b = i === 0 ? mx.x : i === 1 ? mx.y : mx.z;
    if (Math.abs(di) < 1e-9) { if (oi < a || oi > b) return null; continue; }
    let t1 = (a - oi) / di, t2 = (b - oi) / di, s = -1; if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; s = 1; }
    if (t1 > tmin) { tmin = t1; axis = i; sign = s; }
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return null;
  }
  if (tmax < 0) return null;
  const t = tmin < 0 ? tmax : tmin; const n = V3(); if (axis === 0) n.x = sign; else if (axis === 1) n.y = sign; else n.z = sign;
  return { t, n };
}
// Move a vertical capsule/cylinder (pos = feet, radius r, height h) against colliders with step-up. Returns {onGround, groundMat}
function moveBody(pos, vel, dt, r, h, stepH = 0.5) {
  const res = { onGround: false, groundMat: 'grass', hitWall: false };
  const cand = World.cellsNear(pos.x, pos.z, r + Math.abs(vel.x * dt) + Math.abs(vel.z * dt) + 1, []);
  // horizontal move, axis separated with step-up
  for (let axis = 0; axis < 2; axis++) {
    const dv = axis === 0 ? vel.x * dt : vel.z * dt; if (!dv) continue;
    if (axis === 0) pos.x += dv; else pos.z += dv;
    for (const c of cand) {
      if (pos.x + r <= c.min.x || pos.x - r >= c.max.x || pos.z + r <= c.min.z || pos.z - r >= c.max.z) continue;
      if (pos.y + h <= c.min.y || pos.y >= c.max.y) continue;
      // step up?
      if (c.max.y - pos.y <= stepH && c.max.y > pos.y && canStand(pos.x, c.max.y, pos.z, r, h, cand, c, stepH)) { pos.y = c.max.y; res.onGround = true; res.groundMat = c.mat; continue; }
      if (axis === 0) pos.x = dv > 0 ? c.min.x - r : c.max.x + r; else pos.z = dv > 0 ? c.min.z - r : c.max.z + r;
      res.hitWall = true;
    }
  }
  // vertical
  pos.y += vel.y * dt;
  if (pos.y <= 0) { pos.y = 0; res.onGround = true; if (vel.y < 0) vel.y = 0; }
  for (const c of cand) {
    if (pos.x + r <= c.min.x || pos.x - r >= c.max.x || pos.z + r <= c.min.z || pos.z - r >= c.max.z) continue;
    if (pos.y + h <= c.min.y || pos.y >= c.max.y) continue;
    if (vel.y <= 0 && pos.y >= c.max.y - Math.max(0.6, -vel.y * dt + 0.1)) { pos.y = c.max.y; vel.y = 0; res.onGround = true; res.groundMat = c.mat; }
    else if (vel.y > 0 && pos.y + h > c.min.y && pos.y < c.min.y) { pos.y = c.min.y - h; vel.y = 0; }
  }
  if (!res.onGround) { // check ground under feet (standing on top of collider, small tolerance)
    for (const c of cand) {
      if (pos.x + r <= c.min.x || pos.x - r >= c.max.x || pos.z + r <= c.min.z || pos.z - r >= c.max.z) continue;
      if (Math.abs(pos.y - c.max.y) < 0.02 && vel.y <= 0) { res.onGround = true; res.groundMat = c.mat; pos.y = c.max.y; vel.y = 0; }
    }
  }
  if (World.inWater(pos.x, pos.z) && pos.y < 0.3) res.groundMat = 'water';
  return res;
}
function canStand(x, y, z, r, h, cand, skip, stepH = 0.55) {
  for (const c of cand) { if (c === skip) continue; if (x + r <= c.min.x || x - r >= c.max.x || z + r <= c.min.z || z - r >= c.max.z) continue; if (y + h <= c.min.y || y + 0.01 >= c.max.y) continue; if (c.max.y - y <= stepH) continue; /* another steppable box, fine */ return false; }
  return true;
}
