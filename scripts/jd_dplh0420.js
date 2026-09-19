/**
 * jd_dplh0420.js（重写版）—— 大牌0420（大牌领火/拼盘）
 *
 * 提取说明：业务 fid 在加密远程配置中，需 isvObfuscator（ISV 云）浏览器签名解密；
 * Node 环境 403/no access，无法提取下游业务 fid。本脚本调用原脚本确认的真实入口。
 */
const { callClient, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin);
  console.log(`[dplh0420] 大牌0420 ${pin}`);
  try {
    const r = await callClient('isvObfuscator', {
      url: 'https://jinggengjcq-isv.isvjcloud.com',
      id: '',
    });
    console.log('  isvObfuscator 返回:', JSON.stringify(r).slice(0, 300));
    console.log('  备注: ISV 入口未放行（403/no access），活动可能已下线或需浏览器签名，业务 fid 无法提取。');
  } catch (e) {
    const msg = e.message || String(e);
    if (/JSON|empty|Unexpected end/i.test(msg)) {
      console.log('  ISV 接口返回空（403/no access）：活动已下线或需浏览器 js_security 签名，业务 fid 无法提取。');
    } else {
      console.log('  请求失败:', msg);
    }
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { main };
