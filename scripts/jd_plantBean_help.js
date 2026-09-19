/**
 * jd_plantBean_help.js（重写版）—— 东东种豆 好友列表 / 助力
 * functionId: plantFriendList   appid: signed_wh5
 * 说明：本脚本先拉取可助力好友列表；对他人助力需对方分享码。
 * 用法：
 *   node jd_plantBean_help.js            # 查看可助力好友列表
 *   node jd_plantBean_help.js <code>    # 对指定好友码助力（预留）
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[plantBean_help] 账号 ${decodeURIComponent(cfg.pt_pin)}`);

  const helpCode = process.argv[2];
  if (helpCode) {
    console.log(`  收到助力码: ${helpCode}`);
    console.log('  注意：对他人种豆助力需调用助力动作接口，当前仅展示好友列表；');
    console.log('  请在 App 内打开好友分享链接完成助力。');
    return;
  }

  const r = await callBff('plantFriendList', {
    version: '9.2.4.6',
    busiVersion: '2',
  }, { appid: 'signed_wh5' });

  const code = r.code ?? r.statusCode;
  if (code === '0' || code === 0) {
    const d = r.data || r.result || {};
    const list = d.friendList || d.helpFriendList || d.list || [];
    console.log(`  可助力好友数: ${Array.isArray(list) ? list.length : '?'}`);
    if (Array.isArray(list)) list.slice(0, 10).forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.remarkName || f.nickName || f.friendName || '好友'}`);
    });
    console.log('  真实返回 OK, code=0');
  } else {
    console.log('  接口返回:', JSON.stringify(r).slice(0, 400));
  }
  return r;
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
