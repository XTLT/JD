/**
 * jd_plantBean.js（重写版）—— 东东农场种豆首页查询
 * functionId: plantBeanIndex   appid: signed_wh5
 * 抓包 body: {"wxHeadImgUrl":"","shareUuid":"","channel":"baibaoxiang",
 *   "plantUpdateV1":"v1","version":"9.2.4.6","monitor_source":"plant_m_plant_index","busiVersion":"2"}
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[plantBean] 账号 ${decodeURIComponent(cfg.pt_pin)}`);
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
    const user = d.userInfo || d.plantUserInfo || {};
    console.log('  种豆名:', d.plantName || user.plantName || '?');
    console.log('  营养液:', (user.nutrition || d.nutrition || user.nutritionValue || '?'));
    console.log('  成熟进度:', (d.progress || user.progress || '?') + '%');
    console.log('  真实返回 OK, code=0');
  } else {
    console.log('  接口返回:', JSON.stringify(r).slice(0, 400));
  }
  return r;
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
