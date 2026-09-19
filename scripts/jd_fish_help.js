/**
 * jd_fish_help.js（重写版）—— 金融捕鱼助力
 * 用法: node jd_fish_help.js <捕鱼助力码>
 *
 * 说明: 原脚本为 jsjiami v7 加密，助力接口经内置 h5st 签名链调用，
 *       此处用 jd_core 本地签名直连 signed_wh5 捕鱼助力接口。
 */
const { callBff, loadCookie } = require('../jd_core.js');

function usage() {
  console.log('用法: node jd_fish_help.js <金融捕鱼助力码>');
  console.log('示例: node jd_fish_help.js ABCDef123456');
  console.log('（助力码从好友捕鱼游戏分享链接中提取）');
}

async function main() {
  const code = process.argv[2];
  if (!code) { usage(); return; }
  const cfg = loadCookie();
  console.log(`[fish_help] 账号 ${decodeURIComponent(cfg.pt_pin)}  助力码: ${code}`);
  const body = { version: 1, inviteCode: code, channel: 'fish' };
  const r = await callBff('fishGameAssist', body, { appid: 'signed_wh5' });
  console.log('  返回:', JSON.stringify(r).slice(0, 500));
  const ok = r && (r.code === '0' || r.code === 0 || r.success);
  console.log('  结果:', ok ? '✓ 助力请求已发送' : ((r && (r.errMsg || r.msg || r.echo)) || '未成功（可能已助力过/活动已下线/码无效）'));
  return r;
}
if (require.main === module) {
  main().catch(e => { console.error('  错误:', e.message); process.exit(1); });
}
module.exports = { main };
