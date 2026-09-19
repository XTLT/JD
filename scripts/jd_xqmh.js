/**
 * jd_xqmh.js（重写版）—— 新奇盲盒活动
 * 原脚本加密，hook 提取到使用 taskList/taskInfo 模式
 * 重写为查询活动任务状态
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin || '');
  console.log(`[xqmh] 新奇盲盒 账号: ${pin}`);
  console.log('  查询活动任务...');

  // 盲盒活动通常走 activities_platform
  const r = await callBff('apTaskList', {
    babelChannel: 'ttt106',
  }, { appid: 'activities_platform' });
  console.log('  任务列表:', JSON.stringify(r).slice(0, 500));

  if (r.code === 'F10002') {
    console.log('  ✗ Cookie 已失效');
  } else if (r.code === '0' || r.code === 0) {
    const tasks = (r.data && r.data.taskList) || [];
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
