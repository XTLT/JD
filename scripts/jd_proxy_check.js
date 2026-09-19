/**
 * jd_proxy_check.js（重写版）—— 代理/直连检测
 * 检测直连 api.m.jd.com 是否可达，不走代理
 */
const { loadCookie, UA } = require('../jd_core.js');

async function check(url, label) {
  const start = Date.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': UA },
      signal: ctrl.signal,
      // 不走代理
      dispatcher: undefined,
    });
    clearTimeout(timer);
    const ms = Date.now() - start;
    console.log(`  ✓ ${label}: ${r.status} (${ms}ms)`);
    return true;
  } catch (e) {
    const ms = Date.now() - start;
    console.log(`  ✗ ${label}: ${e.message} (${ms}ms)`);
    return false;
  }
}

async function main() {
  console.log('=== 京东接口直连检测 ===');
  // 清除代理环境变量
  delete process.env.http_proxy; delete process.env.https_proxy;
  delete process.env.HTTP_PROXY; delete process.env.HTTPS_PROXY;

  const targets = [
    ['https://api.m.jd.com/', 'api.m.jd.com'],
    ['https://plogin.m.jd.com/cgi-bin/ml/islogin', 'plogin (登录态)'],
    ['https://my.jd.com/', 'my.jd.com'],
  ];
  let ok = 0;
  for (const [url, label] of targets) {
    if (await check(url, label)) ok++;
  }
  console.log(`\n结果: ${ok}/${targets.length} 个接口直连可达`);
  console.log(ok === targets.length ? '✓ 直连正常，无需代理' : '✗ 部分接口不可达，可能需要配置代理');
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { main };
