/**
 * jd_autock.js（重写版）—— 青龙路飞账密更新工具
 * 本地实现：调用 jd_client.py 通过 adb+root 从手机 WebView 重新读取 cookie。
 * 运行：node scripts/jd_autock.js
 */
const { execSync } = require('child_process');
const path = require('path');

const CLIENT = path.join(__dirname, '..', 'jd_client.py');

function refresh() {
  console.log('[autock] 通过 adb 从手机刷新 cookie...');
  const out = execSync(`python "${CLIENT}" --refresh`, { encoding: 'utf-8', timeout: 60000 });
  console.log(out.trim());
  return out;
}

if (require.main === module) {
  try { refresh(); } catch (e) { console.error('[autock] 失败:', e.message); process.exit(1); }
}
module.exports = { refresh };
