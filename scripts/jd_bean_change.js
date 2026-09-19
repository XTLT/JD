/**
 * jd_bean_change.js（重写版）—— 京东资产统计
 * 查询京豆、优惠券、红包、余额（无需 h5st 的资产接口）。
 */
const { loadCookie, UA } = require('../jd_core.js');

async function assets() {
  const cfg = loadCookie();
  const res = await fetch('https://me-api.jd.com/user_new/info/GetJDUserInfoUnion', {
    headers: { 'Cookie': cfg.cookie, 'User-Agent': UA, 'Referer': 'https://m.jd.com/' },
  });
  const data = await res.json();
  const asset = (data.data || {}).assetInfo || {};
  const user = (data.data || {}).userInfo || {};
  const out = {
    nickname: user.baseInfo && (user.baseInfo.nickname || user.nickname),
    bean: asset.beanNum,
    coupon: asset.couponNum,
    red: asset.redBalance,
    balance: asset.accountBalance,
  };
  console.log(`[bean_change] ${out.nickname}`);
  console.log(`  京豆: ${out.bean} | 优惠券: ${out.coupon}张 | 红包: ${out.red}元 | 余额: ${out.balance}元`);
  return out;
}

if (require.main === module) {
  assets().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { assets };
