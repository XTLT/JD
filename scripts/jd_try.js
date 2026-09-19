/**
 * jd_try.js（重写版）—— 京东试用领取
 * functionId: try_rafflecount (appid=ysas-new), try_apply (appid=newtry)
 * 原脚本依赖外部 H5ST_SERVER，重写后用本地 signer 签名
 */
const { callClient, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin || '');
  console.log(`[jd_try] 账号: ${pin}`);

  // 1. 查询剩余试用次数
  console.log('  查询剩余试用次数...');
  const countR = await callClient('try_rafflecount', {
    previewTime: '',
  }, {
    appid: 'ysas-new',
    referer: 'https://pro.m.jd.com/mall/active/3C751WNneAUaZ8Lw8xYN7cbSE8gm/index.html',
  });
  console.log('  次数查询:', JSON.stringify(countR).slice(0, 400));

  if (countR.code === '0' && countR.data) {
    console.log(`  ${countR.data.promptDesc || '剩余次数'}: ${countR.data.remainingNum}`);
  } else if (countR.code === 'F10002') {
    console.log('  ✗ Cookie 已失效');
    return countR;
  }

  // 2. 列出可申请的试用商品（调用试用列表接口）
  console.log('\n  查询可试用商品列表...');
  const listR = await callClient('qryH5BabelFloors', {
    activityId: '3C751WNneAUaZ8Lw8xYN7cbSE8gm',
    pageId: '5457569',
    uuid: '',
    queryFloorsParam: {
      floorParams: { 115571575: { tabId: 212, page: 1, source: 'lottery', sessionId: '' } },
      type: 2,
    },
    siteClient: 'apple',
    siteClientVersion: '12.4.1',
  }, {
    appid: 'newtry',
    referer: 'https://pro.m.jd.com/mall/active/3C751WNneAUaZ8Lw8xYN7cbSE8gm/index.html',
  });
  console.log('  列表查询:', JSON.stringify(listR).slice(0, 400));

  return { countR, listR };
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { main };
