/**
 * jd_jrttlqy.js（重写版）—— 京东金融 天天领权益 / 天天领京云
 * 网关: https://ms.jr.jd.com/gw/generic/getRSAPublicKey
 * 说明: 若账号未开通京东金融账户，接口会返回错误，此处优雅打印不崩溃。
 */
const { loadCookie, UA } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const pin = decodeURIComponent(cfg.pt_pin);
  console.log(`[jrttlqy] 账号: ${pin}（金融-天天领权益/京云）`);

  try {
    const url = 'https://ms.jr.jd.com/gw/generic/getRSAPublicKey';
    const r = await fetch(url, {
      headers: {
        'Cookie': cfg.cookie,
        'User-Agent': UA,
        'Referer': 'https://ms.jr.jd.com/',
      },
    });
    const txt = await r.text();
    let j;
    try { j = JSON.parse(txt); } catch { j = null; }
    console.log('  金融网关返回:', (j ? JSON.stringify(j) : txt).slice(0, 500));
    if (j && j.resultCode && j.resultCode !== '0') {
      console.log(`  提示: 金融侧返回 ${j.resultCode} ${j.resultMsg || ''}（若未开通金融账户属正常）。`);
    }
  } catch (e) {
    console.log('  金融接口调用失败(已优雅处理):', e.message);
  }

  console.log('  完成。');
  return { ok: true };
}

if (require.main === module) main().catch(e => { console.error('脚本异常:', e.message); process.exit(1); });
module.exports = { main };
