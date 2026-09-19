/**
 * jd_jxfl.js（重写版）—— 京喜福利（秒杀频道任务列表）
 * functionId: common_task_list  appid: SecKill2020
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin);
  console.log(`[jxfl] 京喜福利 ${pin}`);
  const r = await callBff('common_task_list', { channelId: '7' }, { appid: 'SecKill2020' });
  console.log('  返回码:', r.code, r.msg || '');
  try {
    const data = r.data || r;
    const tasks = (data && (data.taskList || data.taskVOS || (data.data && (data.data.taskList || data.data.taskVOS)))) || [];
    if (Array.isArray(tasks) && tasks.length) {
      console.log(`  共 ${tasks.length} 个福利任务:`);
      for (const t of tasks.slice(0, 15)) {
        const name = t.taskName || t.name || t.title || '(无名)';
        const cnt = t.awardBean || t.beanNum || t.award || t.awardAmount || '';
        const status = t.status != null ? (t.status === 1 || t.completeFlag ? '已完成' : '未完成') : '';
        console.log(`   - ${name} ${status} 奖励=${cnt}`);
      }
    } else {
      console.log('  任务数据:', JSON.stringify(r).slice(0, 500));
    }
  } catch (e) {
    console.log('  解析失败:', e.message, '原始:', JSON.stringify(r).slice(0, 400));
  }
  return r;
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { main };
