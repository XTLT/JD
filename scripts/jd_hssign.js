/**
 * jd_hssign.js（重写版）—— 健康（京东健康）每日签到领京豆
 * functionId:
 *   1) jdh_bff_queryTaskList  (appid=laputa)   查询任务列表
 *   2) jdh_msoa_doTaskGw       (appid=JDHAPP)   执行签到任务
 * 辅助接口: jdh_laputa_isLogin / jdh_bm_getKitTask
 */
const { callBff, loadCookie } = require('../jd_core.js');

const ACTIVITY_ID = '37252';
const APP_KEY = '250520900001';
const CHANNEL = 'jdhapp';

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin);
  console.log(`[hssign] 账号: ${pin}`);

  // 1. 查询任务列表
  const qry = await callBff('jdh_bff_queryTaskList', {
    activityId: ACTIVITY_ID, appKey: APP_KEY, channel: CHANNEL,
  }, { appid: 'laputa' });
  console.log('  任务列表返回:', JSON.stringify(qry).slice(0, 200));

  // 2. 从任务列表取出签到任务的 encodeId，逐个执行
  const groups = (qry && qry.result) || [];
  const tasks = [];
  for (const g of groups) {
    for (const t of (g.taskVoList || [])) {
      if (t.encodeId) tasks.push({ group: g.groupName, title: t.auxiliaryTitle || t.title, encodeId: t.encodeId });
    }
  }
  console.log(`  共 ${tasks.length} 个任务待执行`);

  let done;
  for (const t of tasks) {
    console.log(`  执行任务[${t.group}/${t.title}] encodeId=${t.encodeId.slice(0, 16)}...`);
    done = await callBff('jdh_msoa_doTaskGw', {
      appKey: APP_KEY, channel: CHANNEL, encodeId: t.encodeId,
      infoId: new Date().toISOString(),
    }, { appid: 'JDHAPP' });
    console.log('    返回:', JSON.stringify(done).slice(0, 300));
    await new Promise(r => setTimeout(r, 1500));
  }

  // 3. 领取奖励
  try {
    const award = await callBff('jdh_msoa_queryAwardGw', {
      appKey: APP_KEY, activityId: ACTIVITY_ID, channel: CHANNEL, awardType: 2,
    }, { appid: 'laputa' });
    console.log('  奖励查询返回:', JSON.stringify(award).slice(0, 300));
  } catch (e) { console.log('  奖励查询失败(可忽略):', e.message); }

  console.log('  完成。');
  return { qry, done };
}

if (require.main === module) main().catch(e => { console.error('脚本异常:', e.message); process.exit(1); });
module.exports = { main };
