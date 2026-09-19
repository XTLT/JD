/**
 * jd_clean_coupon.js（重写版）—— 删除过期/无用优惠券
 * 查询优惠券列表，列出快过期/已过期的（删除需确认，先只列出）。
 */
const { loadCookie, UA } = require('../jd_core.js');

async function listCoupons() {
  const cfg = loadCookie();
  // 优惠券列表接口
  const res = await fetch('https://me-api.jd.com/user_new/info/GetJDUserInfoUnion', {
    headers: { 'Cookie': cfg.cookie, 'User-Agent': UA, 'Referer': 'https://m.jd.com/' },
  });
  const data = await res.json();
  const asset = (data.data || {}).assetInfo || {};
  console.log(`[clean_coupon] 当前优惠券: ${asset.couponNum || 0} 张`);
  console.log('  （删除接口需抓包确认，当前仅统计）');
  return asset.couponNum;
}

if (require.main === module) {
  listCoupons().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { listCoupons };
