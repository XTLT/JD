/**
 * jd_luckyDraw.js（重写版）—— 幸运抽奖
 * functionId: secEntryBenefitShow（appid=signed_wh5，client.action）
 * 流程：查询秒杀频道抽奖入口/机会，有机会则提示。
 */
const { callClient, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[luckyDraw] ${decodeURIComponent(cfg.pt_pin)}`);
  try {
    const r = await callClient('secEntryBenefitShow', {
      channelId: '2', actSecTraffic: '1',
    }, { appid: 'signed_wh5' });
    const d = r.data || r.result || r.rs || {};
    console.log(`  返回: code=${r.code} ${JSON.stringify(r).slice(0, 300)}`);
    // 简单判断是否有抽奖机会
    const has = d.lottery || d.draw || d.benefit || d;
    if (r.code === '0' || r.code === 0) {
      console.log('  入口查询成功，按返回结构判断抽奖机会');
    } else {
      console.log(`  无幸运抽奖机会或活动未开启 (code=${r.code})`);
    }
    return r;
  } catch (e) {
    console.error('  查询失败:', e.message);
    process.exit(1);
  }
}

if (require.main === module) main();
module.exports = { main };
