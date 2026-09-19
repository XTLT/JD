/**
 * jd_XinFarm_draw.js（重写版）—— 新东东农场 幸运抽奖任务列表
 * functionId: apTaskList   appid: activities_platform
 * body: {"linkId":"VssYBUKJOen7HZXpC8dRFA"}
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[XinFarm_draw] 账号 ${decodeURIComponent(cfg.pt_pin)}`);
  const r = await callBff('apTaskList', {
    linkId: 'VssYBUKJOen7HZXpC8dRFA',
  }, { appid: 'activities_platform' });

  const code = r.code ?? r.statusCode;
  if (r.success === true || code === '0' || code === 0) {
    const tasks = Array.isArray(r.data) ? r.data : (r.data && (r.data.taskList || r.data.tasks)) || [];
    console.log(`  任务数: ${tasks.length}`);
    tasks.slice(0, 10).forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.taskTitle || t.taskShowTitle || '任务'}  类型=${t.taskType || '?'}  上限=${t.taskLimitTimes || '?'}`);
    });
    console.log('  真实返回 OK, code=0');
  } else {
    console.log('  接口返回:', JSON.stringify(r).slice(0, 400));
  }
  return r;
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
