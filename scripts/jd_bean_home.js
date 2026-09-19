/**
 * jd_bean_home.js（重写版）—— 升级赚京豆 / 京豆首页
 * 查询京豆余额、今日已领、升级进度等首页信息。
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function beanHome() {
  const cfg = loadCookie();
  // 用权益中心用户信息接口（已验证）
  const r = await callBff('bff_rightsCenter_userInfo', { scene: 'userInfo', contentType: '28_29' });
  if (r.code === '1711000') {
    console.log(`[bean_home] ${decodeURIComponent(cfg.pt_pin)}`);
    console.log(`  京豆: ${r.rs.jingBeans} 个（约 ${r.rs.jingBeanValue} 元）`);
    return r.rs;
  }
  console.log('[bean_home] 查询失败:', JSON.stringify(r).slice(0, 200));
  return null;
}

if (require.main === module) {
  beanHome().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { beanHome };
