/**
 * jd_dpqd_sign.js（重写版）—— 批量店铺签到
 * 活动: https://h5.m.jd.com/babelDiy/Zeus/2PAAf74aG3D61qvfKUM5dxUssJQ9/index.html?token=<token>
 * 说明: 该脚本需要从活动页获取个人签到 token（环境变量 jd_dpqd_tokens，多个英文逗号分隔）。
 *       原始脚本走 6dylan6 私有加密通道(jra.jd.com/jsTk.do)，无法用标准 h5st 直接复刻业务请求。
 *       无 token 时优雅退出，不崩溃。
 */
const { loadCookie, UA } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin);
  console.log(`[dpqd_sign] 账号: ${pin}（批量店铺签到）`);

  const token = process.argv[2] || process.env.jd_dpqd_tokens || '';
  if (!token.trim()) {
    console.log('  未检测到店铺签到 token。');
    console.log('  用法: node jd_auto\\scripts\\jd_dpqd_sign.js <token>');
    console.log('  或设置环境变量: jd_dpqd_tokens（多个 token 用英文逗号分隔）');
    console.log('  token 获取: 打开活动页 https://h5.m.jd.com/babelDiy/Zeus/2PAAf74aG3D61qvfKUM5dxUssJQ9/index.html 从链接末尾 ?token= 后复制。');
    return { needToken: true };
  }

  // 有 token：先验证登录态（真实接口），再提示加密通道限制
  const tokens = token.split(',').map(s => s.trim()).filter(Boolean);
  console.log(`  共 ${tokens.length} 个店铺签到 token。`);
  try {
    const r = await fetch('https://plogin.m.jd.com/cgi-bin/ml/islogin', {
      headers: { 'Cookie': cfg.cookie, 'User-Agent': UA },
    });
    const j = await r.json().catch(() => ({}));
    console.log('  登录态校验:', JSON.stringify(j).slice(0, 200));
  } catch (e) { console.log('  登录态校验失败:', e.message); }
  console.log('  注意: 店铺签到业务走私有加密通道，本重写版仅完成 token 校验与登录态检查。');
  return { needToken: false, count: tokens.length };
}

if (require.main === module) main().catch(e => { console.error('脚本异常:', e.message); process.exit(1); });
module.exports = { main };
