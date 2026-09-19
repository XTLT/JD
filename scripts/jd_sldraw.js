/**
 * jd_sldraw.js（重写版）—— 抽奖（签到盲盒）
 * functionId: bff_rights_center_index_sign / bff_rights_center_index（appid=plus_business）
 */
const { callBff, loadCookie } = require('../jd_core.js');
const APPID = 'plus_business';

async function main() {
  const cfg = loadCookie();
  console.log(`[sldraw] ${decodeURIComponent(cfg.pt_pin)}`);

  // 1) 签到盲盒日签入口
  try {
    const sign = await callBff('bff_rights_center_index_sign', {
      baseVersion: '2.0.0', scene: 'signBlindDaily', area: '', gcLat: 0, gcLng: 0,
    }, { appid: APPID });
    console.log(`  sign code=${sign.code} ${JSON.stringify(sign).slice(0, 350)}`);
  } catch (e) { console.log('  sign 失败:', e.message); }
  await new Promise(r => setTimeout(r, 1500));

  // 2) 会员权益中心首页（查剩余抽奖/签到状态）
  try {
    const idx = await callBff('bff_rights_center_index', {
      baseVersion: '2.0.0', modelVersion: '2.0.0', queryTypes: 'SIGN_DAILY', scene: 'index',
      otherApis: [{
        api: 'balance_abTest_v3',
        businessParam: { procudtAndExpResultList: '[{"productLine": "WJQYZX","expIdWithDefautExpLabel": {"WJQYZX_78369": "base"}}]' },
      }],
    }, { appid: APPID });
    console.log(`  index code=${idx.code} ${JSON.stringify(idx).slice(0, 350)}`);
  } catch (e) { console.log('  index 失败:', e.message); }
  console.log('[sldraw] 完成');
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
