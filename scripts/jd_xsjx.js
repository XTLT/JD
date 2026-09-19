/**
 * jd_xsjx.js（重写版）—— 限时京喜 任务查询
 * functionId: apTaskList   appid: activities_platform   linkId: G7sQ92vWSBsTHzk4e953qUGWQJ4
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[xsjx] 账号 ${decodeURIComponent(cfg.pt_pin)}`);
  const r = await callBff('apTaskList', { linkId: 'G7sQ92vWSBsTHzk4e953qUGWQJ4' }, { appid: 'activities_platform' });
  console.log('  返回:', JSON.stringify(r).slice(0, 800));
  const d = r && (r.data || r.result || {});
  const tasks = Array.isArray(d) ? d : (d.taskList || d.tasks || []);
  if (tasks.length) {
    console.log(`  任务列表: ${tasks.length} 个`);
    for (const t of tasks.slice(0, 15)) {
      console.log(`    - ${t.taskTitle || t.taskName || t.name || t.assignmentId || '?'}  已做${t.taskDoTimes ?? t.actedNum ?? '?'}次 完成:${t.taskFinished}`);
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
