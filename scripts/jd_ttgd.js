/**
 * jd_ttgd.js（重写版）—— 天天领豆（京豆互动任务）
 * functionId: bff_rightsCenter_jdInteractTask  appid: plus_business
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin);
  console.log(`[ttgd] 天天领豆 ${pin}`);
  const r = await callBff('bff_rightsCenter_jdInteractTask', {
    taskType: 'beanDailySign_beanDailyPlus_newBeanTask',
    scene: 'jdInteractTask',
    otherApis: [{
      api: 'bff_exec_func',
      businessParam: { firstDomain: 'rightsCenter', secondDomain: 'userInfo', contentType: '27', scene: 'userInfo' }
    }]
  }, { appid: 'plus_business' });
  console.log('  返回码:', r.code, r.msg || '');
  // 尝试解析任务列表与京豆
  try {
    const data = r.data || r;
    const taskList = (data && (data.taskList || data.taskInfoList || (data.data && data.data.taskList))) || [];
    if (Array.isArray(taskList) && taskList.length) {
      console.log(`  共 ${taskList.length} 个任务:`);
      for (const t of taskList.slice(0, 15)) {
        const name = t.taskName || t.name || t.title || '(无名)';
        const done = t.completeFlag != null ? (t.completeFlag ? '已完成' : '未完成') : '';
        const cnt = t.awardBean || t.beanNum || t.award || '';
        console.log(`   - ${name} ${done} 豆=${cnt}`);
      }
    } else {
      console.log('  任务数据:', JSON.stringify(r).slice(0, 500));
    }
    if (data && (data.jingBeanNum != null || data.beanNum != null || (data.userInfo && data.userInfo.jingBeans != null))) {
      const jb = data.jingBeanNum != null ? data.jingBeanNum : (data.beanNum != null ? data.beanNum : data.userInfo.jingBeans);
      console.log(`  当前京豆: ${jb}`);
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
