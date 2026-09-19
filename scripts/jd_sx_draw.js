/**
 * jd_sx_draw.js（重写版）—— 抽生肖金币
 * functionId: goldDumplingsHome / goldDumplingsPoll（appid=activities_platform）
 */
const { callBff, loadCookie } = require('../jd_core.js');
const APPID = 'activities_platform';
const LINK_ID = 'tCWe8wh2f-Lll_RNU1J2_g';

function pickChance(d) {
  if (!d) return 0;
  return d.remainDrawTimes ?? d.remainChance ?? d.lotteryChance ?? d.chance ?? 0;
}

async function main() {
  const cfg = loadCookie();
  console.log(`[sx_draw] ${decodeURIComponent(cfg.pt_pin)}`);

  const body = { envType: 1, linkId: LINK_ID, inviter: '', area: '0_0_0_0' };

  // 1) home 查剩余次数
  let chance = 0;
  try {
    const home = await callBff('goldDumplingsHome', body, { appid: APPID });
    const d = home.data || home.result || {};
    chance = pickChance(d);
    console.log(`  home code=${home.code} 剩余次数=${chance}`);
    console.log(`  home 摘要: ${JSON.stringify(home).slice(0, 300)}`);
  } catch (e) { console.log('  home 失败:', e.message); }
  await new Promise(r => setTimeout(r, 1500));

  // 2) 有次数才 poll（抽奖）
  if (chance > 0) {
    try {
      const r = await callBff('goldDumplingsPoll', body, { appid: APPID });
      console.log(`  poll 抽奖结果: code=${r.code} ${JSON.stringify(r).slice(0, 300)}`);
    } catch (e) { console.log('  poll 失败:', e.message); }
  } else {
    console.log('  无剩余次数，跳过抽奖');
  }
  console.log('[sx_draw] 完成');
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
