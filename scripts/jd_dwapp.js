/**
 * jd_dwapp.js（重写版）—— 积分换话费 / 签到
 * functionId: DATAWALLET_USER_SIGN  (appid=h5-sep)  每日签到
 * 辅助: https://api.m.jd.com/user/color/task/dwList  (appid=txsm-m) 任务列表
 */
const { callBff, loadCookie, UA } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin);
  console.log(`[dwapp] 账号: ${pin}（积分换话费）`);

  // 1. 任务列表（路径式接口，直接带 cookie 请求）
  try {
    const listRes = await fetch('https://api.m.jd.com/user/color/task/dwList', {
      headers: { 'Cookie': cfg.cookie, 'User-Agent': UA, 'Referer': 'https://m.jd.com/' },
    });
    const list = await listRes.json();
    console.log('  任务列表:', JSON.stringify(list).slice(0, 300));
  } catch (e) { console.log('  任务列表查询失败(可忽略):', e.message); }

  // 2. 执行每日签到
  const sign = await callBff('DATAWALLET_USER_SIGN', {}, { appid: 'h5-sep' });
  console.log('  签到返回:', JSON.stringify(sign).slice(0, 400));

  console.log('  完成。');
  return sign;
}

if (require.main === module) main().catch(e => { console.error('脚本异常:', e.message); process.exit(1); });
module.exports = { main };
