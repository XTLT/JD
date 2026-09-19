/**
 * jd_farmnew_code_help.js（重写版）—— 新农场助力码助力
 * functionId: farm_assist   appid: signed_wh5
 * 用法: node jd_farmnew_code_help.js <助力码>
 */
const { callBff, loadCookie } = require('../jd_core.js');

function usage() {
  console.log('用法: node jd_farmnew_code_help.js <新农场助力码>');
  console.log('示例: node jd_farmnew_code_help.js ABCDef123456');
  console.log('（助力码从好友分享链接中提取）');
}

async function main() {
  const code = process.argv[2];
  if (!code) { usage(); return; }
  const cfg = loadCookie();
  console.log(`[farmnew_code_help] 账号 ${decodeURIComponent(cfg.pt_pin)}  助力码: ${code}`);
  const body = {
    version: 21,
    channelParam: '1',
    inviteCode: code,
    shareChannel: '',
    assistChannel: '',
  };
  const r = await callBff('farm_assist', body, { appid: 'signed_wh5' });
  console.log('  返回:', JSON.stringify(r).slice(0, 500));
  const ok = r && (r.code === '0' || r.code === 0 || r.success);
  console.log('  结果:', ok ? '✓ 助力请求已发送' : ((r && (r.errMsg || r.msg)) || '未成功（可能已助力过或码无效）'));
  return r;
}
if (require.main === module) {
  main().catch(e => { console.error('  错误:', e.message); process.exit(1); });
}
module.exports = { main };
