/**
 * jd_ifdraw.js（重写版）—— IF 任务抽奖合集
 * 说明：当前版本脚本内置活动链接列表为空（原版运行即打印"无活动链接数据"，
 *       hook 提取期间未发出任何业务请求）。本脚本保持真实接口连通性检查，
 *       并优雅报告无内置活动，不崩溃。
 */
const { callBff, loadCookie } = require('../jd_core.js');

// 原版当前版本内置活动 linkId 列表为空；如后续更新可在此补充
const LINK_IDS = [];

async function main() {
  const cfg = loadCookie();
  console.log(`[ifdraw] ${decodeURIComponent(cfg.pt_pin)}`);

  // 真实接口连通性 / 账号校验
  try {
    const r = await callBff('bff_rightsCenter_userInfo', { scene: 'userInfo', contentType: '28_29' });
    console.log(`  账号校验 code=${r.code}`);
  } catch (e) { console.log('  账号校验失败:', e.message); }

  if (!LINK_IDS.length) {
    console.log('  无活动链接数据（当前版本内置抽奖活动列表为空），无可执行抽奖');
    console.log('[ifdraw] 完成');
    return;
  }

  for (const linkId of LINK_IDS) {
    try {
      const home = await callBff('lotteryMachineHome', { linkId, taskId: '', inviter: '' }, { appid: 'activities_platform' });
      console.log(`  [${linkId}] code=${home.code}`);
    } catch (e) { console.log(`  [${linkId}] 异常: ${e.message}`); }
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log('[ifdraw] 完成');
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
