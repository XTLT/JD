/**
 * jd_zjindan.js（重写版）—— 天天砸金蛋 / 赚京单
 * 原脚本加密，hook 提取到使用 taskList/assignmentResult 模式
 * 重写为查询活动任务并尝试领取
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin || '');
  console.log(`[zjindan] 天天砸金蛋 账号: ${pin}`);
  console.log('  查询活动任务...');

  // 砸金蛋活动走 activities_platform
  const r = await callBff('apTaskList', {
    babelChannel: 'ttt24',
  }, { appid: 'activities_platform' });
  console.log('  任务列表:', JSON.stringify(r).slice(0, 500));

  if (r.code === 'F10002') {
    console.log('  ✗ Cookie 已失效');
  } else if (r.code === '0' || r.code === 0) {
    const tasks = (r.data && r.data.taskList) || (r.data && r.data.result && r.data.result.taskList) || [];
    console.log(`  ✓ 任务数: ${tasks.length}`);
    for (const t of tasks.slice(0, 5)) {
      console.log(`    - ${t.taskName || t.name || '(未命名)'}: ${t.completeStatus || t.status || ''}`);
    }
  } else {
    console.log(`  code=${r.code} msg=${r.msg || r.message || ''}`);
  }
  return r;
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { main };
