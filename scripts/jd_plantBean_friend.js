/**
 * jd_plantBean_friend.js（重写版）—— 东东种豆 好友列表查询
 * functionId: plantBeanIndex   appid: signed_wh5
 * 说明：通过种豆首页接口拉取好友 / 互助信息并展示。
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[plantBean_friend] 账号 ${decodeURIComponent(cfg.pt_pin)}`);
  const r = await callBff('plantBeanIndex', {
    wxHeadImgUrl: '',
    shareUuid: '',
    channel: 'baibaoxiang',
    plantUpdateV1: 'v1',
    version: '9.2.4.6',
    monitor_source: 'plant_m_plant_index',
    busiVersion: '2',
  }, { appid: 'signed_wh5' });

  const code = r.code ?? r.statusCode;
  if (code === '0' || code === 0) {
    const d = r.data || r.result || {};
    const friendKeys = Object.keys(d).filter(k => /friend|help|assist/i.test(k));
    console.log('  首页返回字段:', Object.keys(d).slice(0, 15).join(', '));
    for (const k of friendKeys) {
      const v = d[k];
      if (Array.isArray(v)) console.log(`  ${k}: ${v.length} 条`);
      else console.log(`  ${k}:`, typeof v === 'object' ? JSON.stringify(v).slice(0, 120) : v);
    }
    console.log('  真实返回 OK, code=0');
  } else {
    console.log('  接口返回:', JSON.stringify(r).slice(0, 400));
  }
  return r;
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
