
// ============================================================================
//  PROFILE (localStorage) + HIDEOUT MENU
// ============================================================================
const Profile = {
  key: 'customs_raid_profile_v1', data: null,
  fresh() {
    const ak = newWeapon('ak74n'), pm = newWeapon('pm');
    return { rubles: 160000, weapons: [ak, pm], modPool: {}, gear: { armor: 'none', helmet: 'none', backpack: 'scavbp' }, stash: [], supplies: { bandage: 2, ai2: 1, salewa: 0, pain: 0 },
      sel: { primary: ak.id, secondary: pm.id, mod: ak.id }, stats: { raids: 0, survived: 0, kills: 0 }, scavAt: 0 };
  },
  load() { try { const d = JSON.parse(localStorage.getItem(this.key)); if (d && d.weapons) { this.data = d; return; } } catch (e) { } this.data = this.fresh(); },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { } },
  reset() { this.data = this.fresh(); this.save(); },
  stashAdd(it) {
    const P = this.data;
    if (it.kind === 'weapon') { P.weapons.push(it.weapon); return; }
    if (it.kind === 'mod') { P.modPool[it.slot + ':' + it.mod] = (P.modPool[it.slot + ':' + it.mod] || 0) + 1; return; }
    if (it.kind === 'med' && it.id && P.supplies[it.id] !== undefined) { P.supplies[it.id]++; return; }
    P.stash.push({ id: it.id, name: it.name, value: it.value, w: it.w, kind: it.kind });
  },
  weapon(id) { return this.data.weapons.find(w => w.id === id); },
};

const Menu = {
  tab: 'weapons',
  init() {
    for (const b of document.querySelectorAll('.tabs button')) b.onclick = () => { this.tab = b.dataset.tab; Audio.ui(); this.render(); };
    $('deploy').onclick = () => this.deploy(false); $('scavRun').onclick = () => this.deploy(true);
    $('resetSave').onclick = () => { if (confirm('Reset profile? All progress is lost.')) { Profile.reset(); this.render(); } };
    $('sellAll').onclick = () => { const P = Profile.data; for (const it of P.stash) P.rubles += it.value; P.stash = []; Audio.pickup(); this.render(); };
    $('endBtn').onclick = () => this.open();
    $('startBtn').onclick = () => { Audio.init(); Audio.resume(); this.open(); };
  },
  open() { Game.state = 'menu'; Game.show('menu'); Input.unlock(); this.render(); },
  render() {
    const P = Profile.data; Profile.save();
    $('rubles').textContent = fmtRub(P.rubles); $('stRaids').textContent = P.stats.raids; $('stSurv').textContent = P.stats.survived; $('stKills').textContent = P.stats.kills; $('stRate').textContent = (P.stats.raids ? Math.round(100 * P.stats.survived / P.stats.raids) : 0) + '%';
    for (const b of document.querySelectorAll('.tabs button')) b.classList.toggle('active', b.dataset.tab === this.tab);
    for (const t of ['weapons', 'gear', 'stash']) $('tab-' + t).style.display = t === this.tab ? 'block' : 'none';
    if (!Profile.weapon(P.sel.primary)) P.sel.primary = null; if (!Profile.weapon(P.sel.secondary)) P.sel.secondary = null; if (!Profile.weapon(P.sel.mod)) P.sel.mod = P.sel.primary || P.sel.secondary || (P.weapons[0] && P.weapons[0].id);
    this.renderWeapons(); this.renderGear(); this.renderStash(); this.renderMods(); this.renderDeploy();
    const cd = Math.max(0, P.scavAt - Date.now()); $('scavTimer').textContent = cd > 0 ? `Scav run available in ${fmtTime(cd / 1000)}` : 'Scav run available'; $('scavRun').disabled = cd > 0;
  },
  renderWeapons() {
    const P = Profile.data, L = $('weaponList'); L.innerHTML = '';
    if (!P.weapons.length) L.innerHTML = '<div class="small">No weapons. Buy one below or do a scav run.</div>';
    for (const w of P.weapons) {
      const d = WEAPONS[w.type], el = document.createElement('div'); el.className = 'item' + (w.id === P.sel.mod ? ' sel' : '');
      const role = w.id === P.sel.primary ? 'PRIMARY' : w.id === P.sel.secondary ? 'SECONDARY' : '';
      el.innerHTML = `<span class="name">${weaponLabel(w)}<br><span class="small">${role || 'in stash'} · ${d.cal}</span></span>`;
      const b1 = document.createElement('button'); b1.textContent = d.slot === 'sec' || d.kind === 'pistol' ? '2nd' : '1st'; b1.title = 'Equip'; b1.style.fontSize = '10px';
      b1.onclick = e => { e.stopPropagation(); Audio.ui(); if (d.kind === 'pistol') { P.sel.secondary = w.id; if (P.sel.primary === w.id) P.sel.primary = null; } else { P.sel.primary = w.id; if (P.sel.secondary === w.id) P.sel.secondary = null; } this.render(); };
      const b2 = document.createElement('button'); b2.textContent = 'Sell ' + fmtRub(Math.round(weaponValue(w) * 0.5)); b2.style.fontSize = '10px';
      b2.onclick = e => { e.stopPropagation(); if (!confirm('Sell ' + weaponLabel(w) + '?')) return; P.rubles += Math.round(weaponValue(w) * 0.5); P.weapons.splice(P.weapons.indexOf(w), 1); Audio.pickup(); this.render(); };
      el.appendChild(b1); el.appendChild(b2); el.onclick = () => { P.sel.mod = w.id; Audio.ui(); this.render(); }; L.appendChild(el);
    }
    const S = $('weaponShop'); S.innerHTML = '';
    for (const t in WEAPONS) { const d = WEAPONS[t], el = document.createElement('div'); el.className = 'item'; el.innerHTML = `<span class="name">${d.name}<br><span class="small">${d.rpm} rpm · ${d.modes.join('/')} · ${d.mag} rnd</span></span><span class="val">${fmtRub(d.price)}</span>`;
      el.onclick = () => { if (P.rubles < d.price) { alert('Not enough roubles'); return; } P.rubles -= d.price; const w = newWeapon(t); P.weapons.push(w); P.sel.mod = w.id; if (d.kind === 'pistol' && !P.sel.secondary) P.sel.secondary = w.id; else if (d.kind !== 'pistol' && !P.sel.primary) P.sel.primary = w.id; Audio.pickup(); this.render(); }; S.appendChild(el); }
  },
  renderGear() {
    const P = Profile.data, G = $('gearList'); G.innerHTML = '';
    for (const cat in GEAR) { const h = document.createElement('h3'); h.textContent = cat; G.appendChild(h);
      for (const g of GEAR[cat]) { const el = document.createElement('div'); el.className = 'item' + (P.gear[cat] === g.id ? ' sel' : ''); el.innerHTML = `<span class="name">${g.name}</span><span class="val">${P.gear[cat] === g.id ? 'equipped' : fmtRub(g.price)}</span>`;
        el.onclick = () => { if (P.gear[cat] === g.id) return; const cur = GEAR[cat].find(x => x.id === P.gear[cat]); const refund = cur ? Math.round(cur.price * 0.5) : 0; if (P.rubles + refund < g.price) { alert('Not enough roubles'); return; } P.rubles += refund - g.price; P.gear[cat] = g.id; Audio.pickup(); this.render(); }; G.appendChild(el); } }
    const S = $('supplyList'); S.innerHTML = '';
    for (const s of SUPPLIES) { const el = document.createElement('div'); el.className = 'item'; const n = P.supplies[s.id] || 0;
      el.innerHTML = `<span class="name">${s.name} <b>x${n}</b><br><span class="small">${s.med === 'bandage' ? 'stops light bleeding' : s.med === 'pain' ? 'ignore fractures 90s' : s.heavy ? `heals ${s.hp} hp, fixes heavy bleed/fractures` : `heals ${s.hp} hp`}</span></span><span class="val">${fmtRub(s.price)}</span>`;
      const minus = document.createElement('button'); minus.textContent = '−'; minus.onclick = e => { e.stopPropagation(); if (n > 0) { P.supplies[s.id]--; P.rubles += Math.round(s.price * 0.7); Audio.ui(); this.render(); } };
      const plus = document.createElement('button'); plus.textContent = '+'; plus.onclick = e => { e.stopPropagation(); if (P.rubles >= s.price) { P.supplies[s.id] = n + 1; P.rubles -= s.price; Audio.ui(); this.render(); } else alert('Not enough roubles'); };
      el.appendChild(minus); el.appendChild(plus); S.appendChild(el); }
  },
  renderStash() {
    const P = Profile.data, L = $('stashList'); L.innerHTML = ''; let total = 0;
    for (const it of P.stash) { total += it.value; const el = document.createElement('div'); el.className = 'item'; el.innerHTML = `<span class="name">${it.name}</span><span class="val">${fmtRub(it.value)}</span>`; el.title = 'Sell'; el.onclick = () => { P.rubles += it.value; P.stash.splice(P.stash.indexOf(it), 1); Audio.pickup(); this.render(); }; L.appendChild(el); }
    const pool = Object.entries(P.modPool).filter(([k, n]) => n > 0);
    if (pool.length) { const h = document.createElement('h3'); h.textContent = 'Loose mods (install for free in Modding)'; L.appendChild(h); for (const [k, n] of pool) { const [slot, id] = k.split(':'); const el = document.createElement('div'); el.className = 'item'; el.innerHTML = `<span class="name">${MODS[slot][id].name} x${n}</span><span class="val">sell ${fmtRub(Math.round(MODS[slot][id].price * 0.5))}</span>`; el.onclick = () => { P.modPool[k]--; P.rubles += Math.round(MODS[slot][id].price * 0.5); Audio.pickup(); this.render(); }; L.appendChild(el); } }
    if (!P.stash.length && !pool.length) L.innerHTML = '<div class="small">Stash is empty. Bring loot back from raids and sell it here.</div>';
    $('stashCount').textContent = P.stash.length ? `(${P.stash.length} items)` : ''; $('stashTotal').textContent = total ? 'Total value ' + fmtRub(total) : '';
  },
  // ------------------------------------------------ modding
  renderMods() {
    const P = Profile.data, w = Profile.weapon(P.sel.mod), R = $('modSlots'); R.innerHTML = ''; $('ammoOpts').innerHTML = ''; $('stats').innerHTML = '';
    Game.mGroup.clear();
    if (!w) { $('modTitle').textContent = 'Modding — select a weapon'; return; }
    const d = WEAPONS[w.type]; $('modTitle').textContent = 'Modding — ' + d.name;
    const mesh = buildWeaponMesh(w); mesh.position.set(0, -0.02, 0); mesh.rotation.y = Math.PI / 2; Game.mGroup.add(mesh);
    const stats = weaponStats(w);
    for (const slot of SLOT_ORDER) {
      if (!d.slots[slot]) continue;
      const box = document.createElement('div'); box.className = 'slot'; box.innerHTML = `<h3>${slot}</h3>`; const opts = document.createElement('div'); opts.className = 'opts';
      for (const id of d.slots[slot]) {
        const m = MODS[slot][id], eq = w.mods[slot] === id, owned = P.modPool[slot + ':' + id] || 0;
        const locked = slot === 'grip' && id !== 'none' && !(MODS.handguard[w.mods.handguard] || {}).grips;
        const o = document.createElement('div'); o.className = 'opt' + (eq ? ' eq' : '') + (locked ? ' locked' : '');
        const fx = []; if (m.rec) fx.push(`${m.rec > 0 ? '+' : ''}${m.rec}% recoil`); if (m.ergo) fx.push(`${m.ergo > 0 ? '+' : ''}${m.ergo} ergo`); if (m.moa) fx.push(`${m.moa}% spread`); if (m.zoom > 1) fx.push(`${m.zoom}x`); if (m.cap && m.cap !== 1) fx.push(`${Math.round(d.mag * m.cap)} rnd`); if (m.loud && m.loud !== 1) fx.push(m.loud < 1 ? 'quiet' : 'louder'); if (m.light) fx.push('L: toggle'); if (m.laser) fx.push('hip-fire +');
        o.innerHTML = `${m.name}${m.price && !eq ? `<span class="p">${owned ? 'owned x' + owned : fmtRub(m.price)}</span>` : ''}${fx.length ? `<div class="small">${fx.join(', ')}</div>` : ''}`;
        o.title = locked ? 'Requires a railed handguard' : '';
        o.onclick = () => { if (eq || locked) return; this.installMod(w, slot, id); };
        opts.appendChild(o);
      }
      box.appendChild(opts); R.appendChild(box);
    }
    for (const a of AMMO[d.cal]) { const o = document.createElement('div'); o.className = 'opt' + (w.ammo === a.id ? ' eq' : ''); o.innerHTML = `${a.name}<span class="p">${a.price}₽/rnd</span><div class="small">dmg ${a.dmg} · pen ${a.pen}${a.pellets ? ' · ' + a.pellets + ' pellets' : ''}</div>`; o.onclick = () => { w.ammo = a.id; Audio.ui(); this.render(); }; $('ammoOpts').appendChild(o); }
    const base = weaponStats(newWeapon(w.type, { ammo: w.ammo }));
    const bar = (label, v, max, bad, fmt, bv) => { const k = clamp(v / max, 0, 1), dv = bv !== undefined ? v - bv : 0; const good = dv === 0 ? '' : (bad ? dv < 0 : dv > 0) ? 'good' : 'bad'; return `<div class="stat"><span class="l">${label}</span><div class="bar"><i class="${bad ? 'bad' : ''}" style="width:${k * 100}%"></i></div><span class="v">${fmt(v)}</span><span class="delta ${good}">${dv ? (dv > 0 ? '+' : '') + fmt(dv) : ''}</span></div>`; };
    $('stats').innerHTML = bar('Vertical recoil', stats.recV, 300, true, v => Math.round(v), base.recV) + bar('Horizontal recoil', stats.recH, 200, true, v => Math.round(v), base.recH) + bar('Ergonomics', stats.ergo, 100, false, v => Math.round(v), base.ergo)
      + bar('Accuracy (MOA)', stats.moa, 10, true, v => v.toFixed(2), base.moa) + bar('ADS time', stats.adsTime, 0.8, true, v => v.toFixed(2) + 's', base.adsTime) + bar('Damage', stats.dmg * stats.pellets, 200, false, v => Math.round(v)) + bar('Penetration', stats.pen, 70, false, v => Math.round(v))
      + bar('Fire rate', stats.rpm, 900, false, v => Math.round(v) + ' rpm') + bar('Magazine', stats.magSize, 75, false, v => v + ' rnd', base.magSize) + bar('Weight', stats.weight, 8, true, v => v.toFixed(2) + ' kg', base.weight) + bar('Loudness', stats.noiseRange, 320, true, v => Math.round(v) + ' m', base.noiseRange)
      + `<div class="small" style="margin-top:6px">Sights: ${stats.zoom > 1 ? stats.zoom + 'x magnified' : stats.flags.ret ? 'collimator' : 'iron'} · ${stats.flags.sup ? 'suppressed' : 'unsuppressed'} · value ${fmtRub(weaponValue(w))}</div>`;
  },
  installMod(w, slot, id) {
    const P = Profile.data, m = MODS[slot][id], cur = w.mods[slot], key = slot + ':' + id;
    if (m.price > 0) { if (P.modPool[key] > 0) P.modPool[key]--; else if (P.rubles >= m.price) P.rubles -= m.price; else { alert('Not enough roubles'); return; } }
    if (cur && MODS[slot][cur].price > 0) P.modPool[slot + ':' + cur] = (P.modPool[slot + ':' + cur] || 0) + 1; // old mod back to the pool
    w.mods[slot] = id;
    if (slot === 'handguard' && !m.grips && w.mods.grip && w.mods.grip !== 'none') { P.modPool['grip:' + w.mods.grip] = (P.modPool['grip:' + w.mods.grip] || 0) + 1; w.mods.grip = 'none'; }
    Audio.reloadStep(1); this.render();
  },
  // ------------------------------------------------ deploy
  ammoCost() { const P = Profile.data; let c = 0; for (const id of [P.sel.primary, P.sel.secondary]) { const w = Profile.weapon(id); if (!w) continue; const st = weaponStats(w); c += st.ammo.price * st.magSize * 4; } return c; },
  renderDeploy() {
    const P = Profile.data, pr = Profile.weapon(P.sel.primary), sc = Profile.weapon(P.sel.secondary), cost = this.ammoCost();
    $('deployInfo').innerHTML = `${pr ? weaponLabel(pr) : '<span style="color:#d86a5a">no primary</span>'} · ${sc ? weaponLabel(sc) : 'no secondary'} · ${GEAR.armor.find(a => a.id === P.gear.armor).name} · ${GEAR.helmet.find(a => a.id === P.gear.helmet).name} · ${GEAR.backpack.find(a => a.id === P.gear.backpack).name}<br>Ammo for 4 magazines per weapon: <span class="rub">${fmtRub(cost)}</span> · raid length ${RAID_LEN / 60} min`;
    $('deploy').disabled = (!pr && !sc) || P.rubles < cost;
  },
  deploy(scav) {
    const P = Profile.data; Audio.init(); Audio.resume();
    let loadout;
    if (scav) {
      if (P.scavAt > Date.now()) return; P.scavAt = Date.now() + 4 * 60 * 1000;
      const t = pick(['pm', 'mp5', 'mp153', 'ak74n', 'akm']), w = newWeapon(t, { mods: randomMods(t, 0.2) });
      loadout = { primary: WEAPONS[t].kind === 'pistol' ? null : w, secondary: WEAPONS[t].kind === 'pistol' ? w : null, gear: { armor: Math.random() < 0.4 ? 'paca' : 'none', helmet: 'none', backpack: 'scavbp' }, items: [{ ...SUPPLIES[0] }, ...(Math.random() < 0.5 ? [{ ...SUPPLIES[1] }] : [])] };
    } else {
      const cost = this.ammoCost(); if (P.rubles < cost) return; P.rubles -= cost;
      const pr = Profile.weapon(P.sel.primary), sc = Profile.weapon(P.sel.secondary);
      // weapons leave the stash while in raid (they come back on extract)
      P.weapons = P.weapons.filter(w => w !== pr && w !== sc);
      const items = []; for (const s of SUPPLIES) for (let i = 0; i < (P.supplies[s.id] || 0); i++) items.push({ ...s }); for (const s of SUPPLIES) P.supplies[s.id] = 0;
      loadout = { primary: pr || null, secondary: sc || null, gear: { ...P.gear }, items };
      P.gear = { armor: 'none', helmet: 'none', backpack: 'none' }; // returned on extract
    }
    Profile.save();
    Game.startRaid(loadout, scav);
  },
};

// ============================================================================
//  BOOT
// ============================================================================
Profile.load(); Game.init(); Menu.init();
window.__G = { Game, Player, World, AI, Profile, Menu, Input, Audio, WEAPONS, MODS, newWeapon, weaponStats, buildWeaponMesh, toggleDoor, THREE };
// start screen renders the preview scene with the current primary weapon
{ const w = Profile.weapon(Profile.data.sel.primary) || Profile.data.weapons[0]; if (w) { const m = buildWeaponMesh(w); m.rotation.y = Math.PI / 2; Game.mGroup.add(m); } }
</script>
</body>
</html>
