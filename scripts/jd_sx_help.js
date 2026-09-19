/**
 * jd_sx_help.js（重写版）—— 抽生肖金币助力
 * 用法: node jd_sx_help.js <生肖助力码(inviterId)>
 */
const { callBff, loadCookie } = require('../jd_core.js');

function usage() {
  console.log('用法: node jd_sx_help.js <生肖金币助力码>');
  console.log('示例: node jd_sx_help.js 88888888');
  console.log('（助力码即 inviterId，从好友生肖金币活动分享中提取）');
}

async function main() {
  const code = process.argv[2];
  if (!code) { usage(); return; }
  const cfg = loadCookie();
  console.log(`[sx_help] 账号 ${decodeURIComponent(cfg.pt_pin)}  助力码(inviterId): ${code}`);
  const body = { inviterId: code, channel: 'sx' };
  const r = await callBff('zodiacCoinAssist', body, { appid: 'signed_wh5' });
  console.log('  返回:', JSON.stringify(r).slice(0, 500));
  const ok = r && (r.code === '0' || r.code === 0 || r.success);
  console.log('  结果:', ok ? '✓ 助力请求已发送' : ((r && (r.errMsg || r.msg || r.echo)) || '未成功（可能已助力过/活动已下线/码无效）'));
  return r;
}
if (require.main === module) {
  main().catch(e => { console.error('  错误:', e.message); process.exit(1); });
}
module.exports = { main };
