/**
 * probe_fid.js — 用真实签名探测候选 functionId 是否存在
 * 用法: node jd_auto\probe_fid.js <fid1> <fid2> ... [--appid xxx] [--body '...']
 */
const { callBff, loadCookie } = require('./jd_core.js');

const args = process.argv.slice(2);
let appid = 'signed_wh5';
let body = '{}';
const fids = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--appid') appid = args[++i];
  else if (args[i] === '--body') body = args[++i];
  else fids.push(args[i]);
}

(async () => {
  const cfg = loadCookie();
  console.log('账号:', decodeURIComponent(cfg.pt_pin), 'appid=', appid, 'body=', body);
  for (const fid of fids) {
    try {
      const r = await callBff(fid, JSON.parse(body), { appid });
      const s = JSON.stringify(r);
      const tag = s.includes('"code":"0"') || s.includes('"code":0') ? '✓' : (s.includes('functionId') || s.includes('not exist') ? '✗nofid' : '?');
      console.log(`\n[${tag}] ${fid}:`, s.slice(0, 300));
    } catch (e) {
      console.log(`\n[ERR] ${fid}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 1500));
  }
})();
