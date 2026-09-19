/**
 * jd_indeps.js（重写版）—— 环境/依赖状态检测
 * 打印当前 cookie 状态、node 版本、关键模块与接口连通性
 */
const { callBff, loadCookie, UA } = require('../jd_core.js');

async function main() {
  console.log('=== 京东脚本环境检测 ===');
  console.log(`Node.js 版本: ${process.version}`);
  console.log(`平台: ${process.platform} ${process.arch}`);
  console.log(`UA: ${UA.slice(0, 60)}...`);

  // 1. Cookie 状态
  let pin = '(读取失败)', cookieOk = false;
  try {
    const cfg = loadCookie();
    const m = (cfg.cookie || '').match(/pt_pin=([^;]+)/);
    pin = m ? decodeURIComponent(m[1]) : '(无 pt_pin)';
    cookieOk = !!(cfg.cookie && cfg.cookie.includes('pt_key=') && cfg.cookie.includes('pt_pin='));
  } catch (e) {
    console.log('Cookie 读取失败:', e.message);
  }
  console.log(`\n[Cookie] pt_pin = ${pin}`);
  console.log(`[Cookie] 字段完整: ${cookieOk ? '✓' : '✗ (缺少 pt_key/pt_pin)'}`);

  // 2. 关键模块
  const mods = ['axios', 'got', 'crypto-js', 'tough-cookie', 'https-proxy-agent', 'moment', 'qs'];
  console.log('\n[模块检测]');
  for (const m of mods) {
    try { require.resolve(m, { paths: ['C:\\Users\\z\\Desktop\\adb\\faker2'] }); console.log(`  ✓ ${m}`); }
    catch { console.log(`  ✗ ${m} (未安装)`); }
  }

  // 3. 接口连通性
  console.log('\n[接口连通性]');
  // islogin
  try {
    const cfg = loadCookie();
    const r = await fetch('https://plogin.m.jd.com/cgi-bin/ml/islogin', {
      headers: { Cookie: cfg.cookie, 'User-Agent': UA },
    });
    const t = await r.text();
    const loggedIn = t.includes('"islogin":"1"');
    console.log(`  islogin: ${loggedIn ? '✓ 已登录' : '✗ 未登录 (' + t.slice(0, 60) + ')'}`);
  } catch (e) {
    console.log(`  islogin: ✗ ${e.message}`);
  }
  // api.m.jd.com
  try {
    const r = await callBff('bff_rightsCenter_userInfo', { scene: 'userInfo', contentType: '28_29' });
    if (r.code === '1711000') {
      console.log(`  api.m.jd.com: ✓ 京豆 ${r.rs.jingBeans} 个`);
    } else {
      console.log(`  api.m.jd.com: code=${r.code} ${r.msg || r.message || ''}`);
    }
  } catch (e) {
    console.log(`  api.m.jd.com: ✗ ${e.message}`);
  }

  console.log('\n=== 检测完成 ===');
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { main };
