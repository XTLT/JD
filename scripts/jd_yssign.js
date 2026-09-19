/**
 * jd_yssign.js（重写版）—— ys 每日签到（银色签到）
 * 说明: 原始脚本走 6dylan6 私有加密通道(jra.jd.com/jsTk.do，body 全加密)，
 *       业务 functionId 封装在加密载荷内，无法用标准 h5st 直接复刻。
 *       本重写版校验登录态并优雅退出，不崩溃。
 */
const { loadCookie, UA } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin);
  console.log(`[yssign] 账号: ${pin}（ys 每日签到）`);

  try {
    const r = await fetch('https://plogin.m.jd.com/cgi-bin/ml/islogin', {
      headers: { 'Cookie': cfg.cookie, 'User-Agent': UA },
    });
    const j = await r.json().catch(() => ({}));
    console.log('  登录态校验:', JSON.stringify(j).slice(0, 200));
  } catch (e) { console.log('  登录态校验失败:', e.message); }

  console.log('  提示: 本活动签到走私有加密通道，业务接口未暴露明文 functionId。');
  console.log('  完成（未执行业务签到，避免无参瞎调）。');
  return { ok: true };
}

if (require.main === module) main().catch(e => { console.error('脚本异常:', e.message); process.exit(1); });
module.exports = { main };
