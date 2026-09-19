/**
 * jd_qy_sign.js（重写版）—— 权益中心每日签到
 * functionId: bff_rights_center_index  (appid=plus_business)
 * 流程: 先查签到面板(SIGN_DAILY)，再触发签到动作。
 */
const { callBff, loadCookie } = require('../jd_core.js');

const INDEX_BODY = {
  baseVersion: '2.0.0', modelVersion: '2.0.0',
  queryTypes: 'SIGN_DAILY', scene: 'index',
  otherApis: [{
    api: 'balance_abTest_v3',
    businessParam: { procudtAndExpResultList: JSON.stringify([{ productLine: 'WJQYZX' }]) },
  }],
};

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin);
  console.log(`[qy_sign] 账号: ${pin}`);

  // 1. 查询签到面板
  const idx = await callBff('bff_rights_center_index', INDEX_BODY, { appid: 'plus_business' });
  console.log('  签到面板返回:', JSON.stringify(idx).slice(0, 500));

  // 2. 触发每日签到
  const sign = await callBff('bff_rights_center_index', {
    ...INDEX_BODY, queryTypes: 'SIGN_DAILY', action: 'sign',
  }, { appid: 'plus_business' });
  console.log('  签到动作返回:', JSON.stringify(sign).slice(0, 400));

  console.log('  完成。');
  return { idx, sign };
}

if (require.main === module) main().catch(e => { console.error('脚本异常:', e.message); process.exit(1); });
module.exports = { main };
