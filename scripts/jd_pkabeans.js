/**
 * jd_pkabeans.js（重写版）—— 京豆 PK / 购物金持有信息查询
 * functionId: personalCenterBuyHolderInfo   appid: mygiftcard
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[pkabeans] 账号 ${decodeURIComponent(cfg.pt_pin)}`);
  const r = await callBff('personalCenterBuyHolderInfo', { type: '2' }, { appid: 'mygiftcard' });
  console.log('  返回:', JSON.stringify(r).slice(0, 600));
  const d = r && (r.data || r.result || r);
  if (d) {
    console.log('  持有信息:', JSON.stringify(d).slice(0, 400));
  }
  return r;
}
if (require.main === module) {
  main().catch(e => { console.error('  错误:', e.message); process.exit(1); });
}
module.exports = { main };
