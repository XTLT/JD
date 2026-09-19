/**
 * jd_XinFarm_water.js（重写版）—— 新东东农场 浇水
 * functionId: farm_water   appid: signed_wh5
 * 说明：新农场指定浇水动作。环境变量 WTNUM_NEW2 控制次数（默认 1 次）。
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function once(cfg) {
  const r = await callBff('farm_water', {
    version: 21, channelParam: '1', babelChannel: 'ttt118', waterType: 'normal',
  }, { appid: 'signed_wh5' });
  return r;
}

async function main() {
  const cfg = loadCookie();
  const times = Math.max(1, parseInt(process.env.WTNUM_NEW2 || '1', 10) || 1);
  console.log(`[XinFarm_water] 账号 ${decodeURIComponent(cfg.pt_pin)} 计划浇水 ${times} 次`);
  let last = null;
  for (let i = 0; i < times; i++) {
    last = await once(cfg);
    console.log(`  第${i + 1}次:`, JSON.stringify(last).slice(0, 200));
    if (i < times - 1) await new Promise(r => setTimeout(r, 1500));
  }
  const code = last && (last.code ?? last.statusCode);
  console.log(code === '0' || code === 0 ? '  浇水动作真实返回 OK, code=0' : '  （见上方真实接口返回）');
  return last;
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
