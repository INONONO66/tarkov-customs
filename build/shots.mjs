// Visual check: renders a few scenes to PNGs
import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', e => { if (!/pointer lock/.test(e.message)) console.log('PAGEERROR', e.message); });
await page.goto('file:///Users/ino/Develop/fable5-1/tarkov/customs.html');
await page.waitForFunction(() => window.__G, null, { timeout: 60000 });
await page.click('#startBtn'); await page.waitForTimeout(400);
await page.evaluate(() => { const { Profile, Menu } = window.__G; const w = Profile.weapon(Profile.data.sel.primary); Menu.installMod(w, 'muzzle', 'sup'); Menu.installMod(w, 'sight', 'holo'); Menu.installMod(w, 'handguard', 'rail'); Menu.installMod(w, 'grip', 'vert'); Menu.installMod(w, 'tactical', 'laser'); });
await page.waitForTimeout(300); await page.screenshot({ path: '/tmp/s_menu.png' });
await page.click('#deploy'); await page.waitForTimeout(300);
await page.evaluate(() => { const G = window.__G; G.Game.loop = () => {}; G.Input.locked = true; for (const s of G.AI.scavs) { s.pos.set(-200, 0, -115); s.state = 'idle'; s.t = 999; } });
const view = async (name, x, y, z, yaw, pitch, extra) => {
  await page.evaluate(([x, y, z, yaw, pitch, extra]) => { const G = window.__G, P = G.Player; P.pos.set(x, y, z); P.yaw = yaw; P.pitch = pitch; P.vel.set(0, 0, 0); if (extra) eval(extra); for (let i = 0; i < 3; i++) { G.Game.updateRaid(1 / 30); G.Input.endFrame(); } G.Game.renderWorld(); }, [x, y, z, yaw, pitch, extra || '']);
  await page.screenshot({ path: `/tmp/s_${name}.png` });
};
await view('gas', 5, 0, 40, -0.6, 0.05);                       // gas station from SW
await view('dorms', 150, 0, -50, Math.PI, 0.1);                // dorms from the south
await view('bigred', -10, 0, -30, 0.9, 0.05);
await view('interior', 150, 0, -75, -Math.PI / 2, 0, 'G.Input.mouse.r = true;');  // dorms corridor
await view('ads', 60, 0, 0, Math.PI / 2, 0, 'G.Input.mouse.r = true; const s = G.AI.spawn(45, 0); s.yaw = -Math.PI/2; for (let i = 0; i < 20; i++) { G.Game.updateRaid(1/30); G.Input.endFrame(); }');
await view('scope', 60, 0, 0, Math.PI / 2, 0, 'G.Player.weapon.mods.sight = "pso"; G.Player.setWeaponMesh(); G.Input.mouse.r = true; for (let i = 0; i < 40; i++) { G.Game.updateRaid(1/30); G.Input.endFrame(); }');
await view('bridge', -70, 0, 6, Math.PI / 2, 0, 'G.Input.mouse.r = false;');
await view('construction', 60, 10.8, -62, 2.3, 0.3);
await browser.close();
