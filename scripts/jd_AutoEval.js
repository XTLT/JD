/**
 * jd_AutoEval.js（重写版）—— 带图评价晒单（仅文字评价列表/提交）
 * functionId: getCommentWareList (client.action)
 * 不处理图片，仅拉取待评价订单并输出
 */
const { callClient, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin || '');
  console.log(`[AutoEval] 账号: ${pin}`);
  console.log('  (仅文字评价列表查询，不处理图片)');

  // 拉取待评价商品列表
  console.log('  获取待评价商品列表...');
  const r = await callClient('getCommentWareList', {
    page: 1,
    pageSize: 10,
    needCount: true,
  }, {
    referer: 'https://pro.m.jd.com/',
    extraQuery: { client: 'android', clientVersion: '11.2.2', networkType: 'wifi', ef: '1' },
  });
  console.log('  返回:', JSON.stringify(r).slice(0, 500));

  // 解析待评价商品
  const list = (r && r.commentWareList) || (r && r.data && r.data.commentWareList) || [];
  if (list.length > 0) {
    console.log(`  待评价商品 ${list.length} 个:`);
    for (const item of list.slice(0, 5)) {
      console.log(`    - ${item.wareName || item.skuName || '(未命名)'}`);
    }
  } else if (r.code === 'F10002' || (r.message || '').includes('未登陆')) {
    console.log('  ✗ Cookie 已失效');
  } else {
    console.log('  暂无待评价商品或接口返回为空');
  }
  return r;
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { main };
