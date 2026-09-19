/**
 * jd_jingpai.js（重写版）—— 京拍（竞拍竞猜）
 * 说明：当前版本脚本未内置可执行竞拍/竞猜活动数据（原版运行即打印
 *       "没有获取到数据，等晚点再试！"，hook 提取期间未发出任何业务请求）。
 *       本脚本保持真实接口连通性检查，并优雅报告，不崩溃。
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[jingpai] ${decodeURIComponent(cfg.pt_pin)}`);

  // 真实接口连通性 / 账号校验
  try {
    const r = await callBff('bff_rightsCenter_userInfo', { scene: 'userInfo', contentType: '28_29' });
    console.log(`  账号校验 code=${r.code}`);
  } catch (e) { console.log('  账号校验失败:', e.message); }

  console.log('  没有获取到竞拍/竞猜活动数据，等晚点再试！');
  console.log('[jingpai] 完成');
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
