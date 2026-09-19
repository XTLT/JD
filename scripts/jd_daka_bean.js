/**
 * jd_daka_bean.js（重写版）—— 打卡领豆
 * functionId: interact_game_sign
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function daka() {
  const cfg = loadCookie();
  const r = await callBff('interact_game_sign', {
    appId: 'interact_game_sign',
    body: JSON.stringify({}),
  });
  console.log(`[daka_bean] ${decodeURIComponent(cfg.pt_pin)}`);
  console.log(`  返回:`, JSON.stringify(r).slice(0, 300));
  return r;
}

if (require.main === module) {
  daka().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { daka };
