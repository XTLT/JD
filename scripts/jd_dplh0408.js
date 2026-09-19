/**
 * jd_dplh0408.js（重写版）—— 大牌0408（大牌领火/拼盘）
 *
 * 提取说明：原脚本 jsjiami v7 + LZString 压缩，业务 functionId 全部在
 *   https://6dy.oss-cn-hangzhou.aliyuncs.com/dplh.json
 * 这份加密远程配置里，需通过 client.action?functionId=isvObfuscator
 * （ISV 云 jinggengjcq-isv.isvjcloud.com）用浏览器 js_security 签名解密。
 * 在 Node 环境无浏览器签名，isvObfuscator 返回 403/no access，
 * 故下游业务 fid 无法在静态环境提取。
 *
 * 本最小脚本调用原脚本确认的真实入口 isvObfuscator，跑通即如实上报。
 */
const { callClient, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin);
  console.log(`[dplh0408] 大牌0408 ${pin}`);
  try {
    const r = await callClient('isvObfuscator', {
      url: 'https://jinggengjcq-isv.isvjcloud.com',
      id: '',
    });
    console.log('  isvObfuscator 返回:', JSON.stringify(r).slice(0, 300));
    if (r && (r.code === '0' || r.code === 0 || r.data)) {
      console.log('  备注: 拿到 ISV 配置后由原脚本继续下发业务任务；本环境仅能确认入口可达性。');
    } else {
      console.log('  备注: ISV 入口未放行（403/no access），该 4 月活动可能已下线或需浏览器签名，业务 fid 无法提取。');
    }
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
