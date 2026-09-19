/**
 * jd_deliverySign_sign.js（重写版）—— 快递自动签收 / 天天领豆
 * functionId: bean_deliverySign_sign, bean_deliverySign_continue_award
 * appid: signed_wh5_ihub
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin || '');
  console.log(`[deliverySign] 账号: ${pin}`);

  // 1. 签收
  console.log('  执行签收...');
  const signR = await callBff('bean_deliverySign_sign', {
    activityId: '2775',
  }, { appid: 'signed_wh5_ihub' });
  console.log('  签收结果:', JSON.stringify(signR).slice(0, 400));

  // 2. 领取连续签到奖励
  await new Promise(r => setTimeout(r, 1500));
  console.log('  领取连续奖励...');
  const awardR = await callBff('bean_deliverySign_continue_award', {
    activityId: '2775',
  }, { appid: 'signed_wh5_ihub' });
  console.log('  连续奖励:', JSON.stringify(awardR).slice(0, 400));

  return { signR, awardR };
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { main };
