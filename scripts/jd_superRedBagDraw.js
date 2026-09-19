/**
 * jd_superRedBagDraw.js（重写版）—— 超级红包抽奖
 * functionId: superRedBagHome（appid=activity_platform_se）
 */
const { callBff, loadCookie } = require('../jd_core.js');
const APPID = 'activity_platform_se';
const LINK_ID = '3uSQA8Fn00J70jWc9Pk0iw';

async function main() {
  const cfg = loadCookie();
  console.log(`[superRedBagDraw] ${decodeURIComponent(cfg.pt_pin)}`);
  try {
    const home = await callBff('superRedBagHome', { linkId: LINK_ID }, { appid: APPID });
    const d = home.data || home.result || {};
    const chance = d.remainDrawTimes ?? d.remainChance ?? d.redBagCount ?? d.chance ?? 0;
    console.log(`  home code=${home.code} 红包/抽奖次数=${chance}`);
    console.log(`  摘要: ${JSON.stringify(home).slice(0, 350)}`);
    if (!(chance > 0)) console.log('  无可用红包次数，跳过');
    return home;
  } catch (e) {
    console.log('  查询失败/活动可能已下线:', e.message);
    console.log('[superRedBagDraw] 完成');
  }
}

if (require.main === module) main();
module.exports = { main };
