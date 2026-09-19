/**
 * jd_farmnew_ck_help.js（重写版）—— 新农场 CK 助力 / 数据钱包签到
 * functionId: DATAWALLET_USER_SIGN   appid: h5-sep
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[farmnew_ck_help] 账号 ${decodeURIComponent(cfg.pt_pin)}`);
  const body = { t: Date.now(), encStr: '68bf0ce4acbf2a03b589bf7354c7c073' };
  const r = await callBff('DATAWALLET_USER_SIGN', body, { appid: 'h5-sep' });
  console.log('  返回:', JSON.stringify(r).slice(0, 500));
  if (r && (r.code === '0' || r.code === 0 || r.success)) {
    console.log('  结果: 数据钱包签到成功');
  } else {
    console.log('  结果:', (r && r.errMsg) || (r && r.msg) || '未成功');
  }
  return r;
}
if (require.main === module) {
  main().catch(e => { console.error('  错误:', e.message); process.exit(1); });
}
module.exports = { main };
