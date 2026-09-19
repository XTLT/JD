/**
 * jd_signbeanact_.js（重写版）—— 签到领京豆活动（京豆中心每日签到）
 * functionId: bff_rightsCenter_interaction  (appid=signed_wh5)
 * scene=commonDoInteractiveAssignment 直接执行签到任务。
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin);
  console.log(`[signbeanact_] 账号: ${pin}`);

  const r = await callBff('bff_rightsCenter_interaction', {
    scene: 'commonDoInteractiveAssignment',
    activityCode: 'beanDailySign',
    businessScenario: 'jingDouCenter',
    commonScene: 'secKillChannel',
    assignmentId: 'VdbAAQEQ4t6u7ZommctabgaobfW',
  }, { appid: 'signed_wh5' });

  console.log('  签到返回:', JSON.stringify(r).slice(0, 500));
  console.log('  完成。');
  return r;
}

if (require.main === module) main().catch(e => { console.error('脚本异常:', e.message); process.exit(1); });
module.exports = { main };
