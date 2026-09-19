/**
 * jd_fruit_new.js（重写版）—— 东东水果（新版农场）首页查询
 * functionId: farm_home   appid: signed_wh5
 * 抓包 body: {"version":21,"channelParam":"1","babelChannel":"ttt118"}
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[fruit_new] 账号 ${decodeURIComponent(cfg.pt_pin)}`);
  const r = await callBff('farm_home', {
    version: 21,
    channelParam: '1',
    babelChannel: 'ttt118',
  }, { appid: 'signed_wh5' });

  const code = r.code ?? r.statusCode;
  if (code === '0' || code === 0) {
    const d = r.data || r.result || {};
    const user = d.userFarmInfo || d.farmUserInfo || {};
    console.log('  农场名称:', d.farmName || user.farmName || '?');
    console.log('  剩余水滴:', (user.water || d.water || '?') + ' g');
    console.log('  果树等级:', user.farmLevel || d.farmLevel || '?');
    console.log('  成熟进度:', (user.progress || d.progress || '?') + '%');
    console.log('  真实返回 OK, code=0');
  } else {
    console.log('  接口返回:', JSON.stringify(r).slice(0, 400));
  }
  return r;
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
