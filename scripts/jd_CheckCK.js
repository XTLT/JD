/**
 * jd_CheckCK.js（重写版）—— 京东 CK 检测
 * 调用用户信息接口，根据返回判断 CK 是否有效。
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function check() {
  const cfg = loadCookie();
  let ok = false, info = '';
  try {
    const r = await callBff('bff_rightsCenter_userInfo', { scene: 'userInfo', contentType: '28_29' });
    if (r.code === '1711000') {
      ok = true;
      info = `京豆 ${r.rs.jingBeans} 个（约 ${r.rs.jingBeanValue} 元）`;
    } else {
      info = JSON.stringify(r).slice(0, 200);
    }
  } catch (e) { info = e.message; }
  const pin = decodeURIComponent(cfg.pt_pin);
  console.log(`[CheckCK] 账号 ${pin}: ${ok ? '✓ 有效' : '✗ 失效'} ${info}`);
  return ok;
}

if (require.main === module) {
  check().then(ok => process.exit(ok ? 0 : 1)).catch(e => { console.error(e); process.exit(1); });
}
module.exports = { check };
