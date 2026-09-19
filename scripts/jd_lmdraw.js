/**
 * jd_lmdraw.js（重写版）—— LM 任务抽奖合集（联名抽奖）
 * functionId: lotteryMachineHome / apTaskList（appid=activities_platform）
 * 流程：遍历内置活动 linkId，查 home 剩余抽奖次数，有次数则尝试抽奖。
 */
const { callBff, loadCookie } = require('../jd_core.js');

// 从 hook 提取到的活动 linkId 列表
const LINK_IDS = [
  'D_OqUfze1a8lImnKcDw90Q',
  'o1dq_pY0KdHVRXDK__QssQ',
  'Eg2j1ir0HO3dA59EXYW-tg',
  'MrKB46kaB3CizIRRqnjB3A',
  'vafhGO6GgYSTi326nAng3g',
  'znGFwn7IE-Lb5XyQzkn3lQ',
  'i2hAixBQewuYEExM8tBUTQ',
];
const APPID = 'activities_platform';

function pickChance(d) {
  if (!d) return 0;
  return d.remainDrawTimes ?? d.remainChance ?? d.lotteryChance ?? d.chance ?? 0;
}

async function drawOne(linkId) {
  // 1) 查 home
  const home = await callBff('lotteryMachineHome', {
    linkId, taskId: '', inviter: '',
  }, { appid: APPID });
  const code = home.code;
  const data = home.data || home.result || {};
  const chance = pickChance(data);
  console.log(`  [${linkId}] home code=${code} 剩余次数=${chance}`);

  // 2) 查任务列表
  try {
    const tasks = await callBff('apTaskList', { linkId }, { appid: APPID });
    const tlist = (tasks && (tasks.data || {}).taskInfoList) || (tasks && (tasks.data || {}).taskList) || [];
    console.log(`  [${linkId}] 任务数=${Array.isArray(tlist) ? tlist.length : 0}`);
  } catch (e) { console.log(`  [${linkId}] 任务查询失败: ${e.message}`); }

  // 3) 有次数才抽奖
  if (chance > 0) {
    try {
      const r = await callBff('lotteryMachineDraw', { linkId, taskId: '' }, { appid: APPID });
      const rd = r.data || r.result || {};
      console.log(`  [${linkId}] 抽奖结果: code=${r.code} ${JSON.stringify(rd).slice(0, 200)}`);
    } catch (e) { console.log(`  [${linkId}] 抽奖失败: ${e.message}`); }
  } else {
    console.log(`  [${linkId}] 无剩余次数，跳过`);
  }
}

async function main() {
  const cfg = loadCookie();
  console.log(`[lmdraw] ${decodeURIComponent(cfg.pt_pin)} 共 ${LINK_IDS.length} 个活动`);
  for (const linkId of LINK_IDS) {
    try { await drawOne(linkId); }
    catch (e) { console.log(`  [${linkId}] 异常: ${e.message}`); }
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log('[lmdraw] 完成');
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
