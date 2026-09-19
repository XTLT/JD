/**
 * jd_water_new.js（重写版）—— 东东新农场 快速浇水
 * functionId: farm_water   appid: signed_wh5
 * 说明：对新版农场果树执行一次浇水动作。
 *       脚本先查 farm_home 取水滴，再调 farm_water 浇水。
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[water_new] 账号 ${decodeURIComponent(cfg.pt_pin)}`);

  // 1) 查首页状态
  const home = await callBff('farm_home', {
    version: 21, channelParam: '1', babelChannel: 'ttt118',
  }, { appid: 'signed_wh5' });
  console.log('  farm_home:', JSON.stringify(home).slice(0, 160));

  // 2) 执行浇水
  const r = await callBff('farm_water', {
    version: 21, channelParam: '1', babelChannel: 'ttt118', waterType: 'normal',
  }, { appid: 'signed_wh5' });

  const code = r.code ?? r.statusCode;
  if (code === '0' || code === 0) {
    const d = r.data || r.result || {};
    console.log('  浇水成功! 剩余水滴:', (d.water || d.userWater || '?') + ' g',
      '进度:', (d.progress || d.farmProgress || '?') + '%');
    console.log('  真实返回 OK, code=0');
  } else {
    console.log('  浇水接口返回:', JSON.stringify(r).slice(0, 400));
  }
  return r;
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
