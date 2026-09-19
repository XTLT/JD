/**
 * jd_OnceApply.js（重写版）—— 一键价保申请
 * functionId: mlproprice_skuOnceApply_jsf
 * appid: price_protection
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin || '');
  console.log(`[OnceApply] 账号: ${pin}`);

  console.log('  查询可价保订单并申请...');
  const r = await callBff('mlproprice_skuOnceApply_jsf', {
    onceBatchId: '',
    couponConfirmFlag: null,
    appId: 'cuser',
    uniformBizInfo: {
      data: { language: 'zh_CN', buId: 301, tenantId: 1024 },
    },
    type: '25',
  }, { appid: 'price_protection' });
  console.log('  结果:', JSON.stringify(r).slice(0, 500));

  if (r.code === '0' || r.code === 0) {
    console.log('  ✓ 价保申请已提交');
  } else if (r.code === 'F10002') {
    console.log('  ✗ Cookie 已失效，请重新登录');
  } else {
    console.log(`  code=${r.code} msg=${r.msg || r.message || ''}`);
  }
  return r;
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { main };
