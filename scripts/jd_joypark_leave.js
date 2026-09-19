/**
 * jd_joypark_leave.js（重写版）—— 京东游乐园（离开/防沉迷校验）
 * functionId: getStaticResource / checkUserIndulge（appid=activities_platform）
 */
const { callBff, loadCookie } = require('../jd_core.js');
const APPID = 'activities_platform';

async function main() {
  const cfg = loadCookie();
  console.log(`[joypark_leave] ${decodeURIComponent(cfg.pt_pin)}`);

  // 1) 静态资源/活动配置
  try {
    const res = await callBff('getStaticResource', { linkId: '99DZNpaCTAv8f4TuKXr0Ew' }, { appid: APPID });
    console.log(`  getStaticResource code=${res.code} ${JSON.stringify(res).slice(0, 300)}`);
  } catch (e) { console.log('  getStaticResource 失败:', e.message); }
  await new Promise(r => setTimeout(r, 1500));

  // 2) 防沉迷校验
  try {
    const r = await callBff('checkUserIndulge', {}, { appid: APPID });
    const d = r.data || r.result || {};
    console.log(`  checkUserIndulge code=${r.code} ${JSON.stringify(r).slice(0, 300)}`);
    if (d && (d.indulge || d.isIndulge || d.needRest)) {
      console.log('  触发防沉迷/休息提示');
    } else {
      console.log('  防沉迷校验通过，可正常离开');
    }
  } catch (e) { console.log('  checkUserIndulge 失败:', e.message); }
  console.log('[joypark_leave] 完成');
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
