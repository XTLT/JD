// 逐个测试 wduoyu 的依赖是否能正常构造
const tests = [
  ['got', () => require('got')],
  ['tough-cookie', () => require('tough-cookie')],
  ['https-proxy-agent', () => require('https-proxy-agent')],
  ['jsdom', () => require('jsdom')],
  ['./function/dylib', () => require('C:\\Users\\z\\Desktop\\adb\\faker2\\function\\dylib.js')],
  ['./function/dylans', () => require('C:\\Users\\z\\Desktop\\adb\\faker2\\function\\dylans.js')],
  ['./function/proxy', () => require('C:\\Users\\z\\Desktop\\adb\\faker2\\function\\proxy.js')],
];
for (const [name, fn] of tests) {
  try {
    const mod = fn();
    console.log(`[OK] ${name}: exports =`, Object.keys(mod).slice(0, 10).join(','), typeof mod);
  } catch (e) {
    console.log(`[FAIL] ${name}:`, e.message.slice(0, 200));
  }
}
// 测试 tough-cookie CookieJar 构造
try { const { CookieJar } = require('tough-cookie'); const j = new CookieJar(); console.log('[OK] new CookieJar()'); } catch (e) { console.log('[FAIL] new CookieJar():', e.message); }
try { const { HttpsProxyAgent } = require('https-proxy-agent'); console.log('[OK] HttpsProxyAgent is', typeof HttpsProxyAgent); } catch (e) { console.log('[FAIL] HttpsProxyAgent:', e.message); }
