/**
 * jd_ksjsb.js（重写版）—— 活动脚本（好耶是男同！）
 * 原脚本依赖 smallfawn 模块和外部 KSConfig，重写为直接查询活动任务
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin || '');
  console.log(`[ksjsb] 账号: ${pin}`);
  console.log('  查询活动任务列表...');

  // 尝试活动平台任务列表
  const r = await callBff('apTaskList', {
    babelChannel: 'ttt24',
  }, { appid: 'activities_platform' });
  console.log('  任务列表:', JSON.stringify(r).slice(0, 500));

  if (r.code === 'F10002') {
    console.log('  ✗ Cookie 已失效，请重新登录');
  } else if (r.code === '0' || r.code === 0) {
    const tasks = (r.data && r.data.taskList) || [];
    console.log(`  ✓ 任务数: ${tasks.length}`);
    for (const t of tasks.slice(0, 5)) {
      console.log(`    - ${t.taskName || t.name || '(未命名)'}: ${t.status || ''}`);
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
