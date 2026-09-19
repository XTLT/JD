/**
 * jd_wduoyu.js（重写版）—— 我的鱼塘 / 养鱼（原"多投多赚"脚本）
 *
 * 说明：
 * 原 faker2/jd_wduoyu.js 经 jsjiami v7 加密，在当前 Node 环境运行即抛
 * "is not a constructor"（混淆器内部字符串数组解包异常），且其 functionId
 * 全部藏在运行时解码的字符串数组里，hook 阶段就崩溃、抓不到任何真实请求。
 * 已探测 fishHome/fish_home/joyFishHome/investIndex/investHome/dtdzIndex
 * 等候选 functionId，京东网关均返回 "the current API does not exist"，
 * 无法在不跑通原脚本的情况下可靠确定该活动的 functionId。
 *
 * 本脚本诚实上报现状，不伪造接口返回。待原脚本可在本机跑通后，
 * 用 hook_one.js 抓到真实 functionId 再补全实际调用。
 */
const { loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[wduoyu] 账号 ${decodeURIComponent(cfg.pt_pin)}`);
  console.log('  原脚本为 jsjiami v7 加密，当前环境运行即报混淆解包错误，');
  console.log('  且活动 functionId 运行时才解码，hook 阶段崩溃无法抓取。');
  console.log('  已探测常见养鱼/投资类 functionId，网关均不存在该 API。');
  console.log('  处理建议：在能正常运行原脚本的环境（青龙/指定 Node 版本）下，');
  console.log('  用 hook_one.js 抓真实 functionId 后再补全本脚本。');
  return { skipped: true, reason: 'obfuscated script cannot run; functionId not extractable' };
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
