/**
 * jd_vu50.js（重写版）—— V你50超市卡 任务列表查询
 * functionId: apTaskList   appid: activities_platform
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[vu50] 账号 ${decodeURIComponent(cfg.pt_pin)}`);
  const r = await callBff('apTaskList', { linkId: 'ZL3JUxEhWWsbiEIPBLVCLw' }, { appid: 'activities_platform' });
  console.log('  返回:', JSON.stringify(r).slice(0, 800));
  const d = r && (r.data || r.result || {});
  const tasks = d.taskList || d.tasks || (Array.isArray(d) ? d : null);
  if (tasks && tasks.length) {
    console.log(`  任务列表: ${tasks.length} 个`);
    for (const t of tasks.slice(0, 10)) {
      console.log(`    - ${t.taskName || t.name || t.assignmentId || '?'}  进度:${(t.actedNum != null ? t.actedNum + '/' : '') + (t.totalNum || '')}`);
    }
  } else {
    console.log('  结果:', (r && (r.errMsg || r.msg)) || JSON.stringify(d).slice(0, 300));
  }
  return r;
}
if (require.main === module) {
  main().catch(e => { console.error('  错误:', e.message); process.exit(1); });
}
module.exports = { main };
