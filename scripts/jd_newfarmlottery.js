/**
 * jd_newfarmlottery.js（重写版）—— 新农场 大抽奖/转盘
 * functionId: wheelsHome   appid: activities_platform
 * 抓包 body: {"linkId":"VssYBUKJOen7HZXpC8dRFA","inviteActId":"","inviterEncryptPin":""}
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[newfarmlottery] 账号 ${decodeURIComponent(cfg.pt_pin)}`);
  let r;
  try {
    r = await callBff('wheelsHome', {
      linkId: 'VssYBUKJOen7HZXpC8dRFA',
      inviteActId: '',
      inviterEncryptPin: '',
    }, { appid: 'activities_platform' });
  } catch (e) {
    console.log('  接口无有效 JSON 返回（可能活动已结束/风控）:', e.message);
    console.log('  真实请求已发出（appid=activities_platform, functionId=wheelsHome）。');
    return null;
  }

  const code = r.code ?? r.statusCode;
  if (code === '0' || code === 0) {
    const d = r.data || r.result || {};
    console.log('  抽奖次数:', d.freeChance || d.chance || d.leftChance || '?');
    console.log('  奖品池:', (Array.isArray(d.awardList) ? d.awardList.length + ' 项' : '?'));
    console.log('  真实返回 OK, code=0');
  } else {
    console.log('  接口返回:', JSON.stringify(r).slice(0, 400));
  }
  return r;
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
