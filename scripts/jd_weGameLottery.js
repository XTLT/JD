/**
 * jd_weGameLottery.js（重写版）—— 微游戏抽奖
 * functionId: weGameHome / interactGameRewardJudge / interactGameReward
 *   weGameHome(appid=wegame-hub), 其余 appid=activities_platform
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[weGameLottery] ${decodeURIComponent(cfg.pt_pin)}`);

  // 1) 微游戏首页
  try {
    const home = await callBff('weGameHome', {
      envType: 1, linkId: 'MWC_-5cWq-JH1wrPPteH4w', babelChannel: 'ttt106',
    }, { appid: 'wegame-hub' });
    console.log(`  weGameHome code=${home.code} ${JSON.stringify(home).slice(0, 280)}`);
  } catch (e) { console.log('  weGameHome 失败:', e.message); }
  await new Promise(r => setTimeout(r, 1500));

  const rewardBody = { envType: 1, linkId: 'QKltPCgCHnIo52E2yaoM5w', babelChannel: 'ttt106' };

  // 2) 抽奖资格判定
  let canDraw = false;
  try {
    const judge = await callBff('interactGameRewardJudge', rewardBody, { appid: 'activities_platform' });
    console.log(`  Judge code=${judge.code} ${JSON.stringify(judge).slice(0, 280)}`);
    const d = judge.data || judge.result || {};
    canDraw = !!(d.canDraw || d.canReward || (judge.code === '0' && d.remainCount));
  } catch (e) { console.log('  Judge 失败:', e.message); }
  await new Promise(r => setTimeout(r, 1500));

  // 3) 有资格则领奖/抽奖
  if (canDraw) {
    try {
      const r = await callBff('interactGameReward', rewardBody, { appid: 'activities_platform' });
      console.log(`  Reward 结果: code=${r.code} ${JSON.stringify(r).slice(0, 280)}`);
    } catch (e) { console.log('  Reward 失败:', e.message); }
  } else {
    console.log('  当前无可抽奖次数/未达抽奖条件，跳过');
  }
  console.log('[weGameLottery] 完成');
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
