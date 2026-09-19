/**
 * hook_pass.js — 透传真实请求，只记录 functionId+body，不 mock 响应
 * 用法: node jd_auto\hook_pass.js <script.js>
 */
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');
const Module = require('module');

const origLoad = Module._load;
const stubClass = class {
  constructor() {}
  log() {} info() {} error() {} msg() {} notice() {}
  getEnvs() { return [{ value: process.env.JD_COOKIE }]; }
  getData() { return null; } setData() {} getBool() { return false; }
  getString() { return ''; } getJSON() { return {}; }
};
Module._load = function (request) {
  if (request === 'sharp') return () => ({ metadata: async () => ({}), toBuffer: async () => Buffer.alloc(0) });
  try { return origLoad.apply(this, arguments); } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') return stubClass;
    throw e;
  }
};

global.notify = () => {};
global.$ = class {
  constructor(name) { this.name = name; }
  getEnvs() { return [{ value: process.env.JD_COOKIE }]; }
  getData() { return null; } setData() {} getBool() { return false; } getString() { return ''; } getJSON() { return {}; }
  log() {} info() {} error() {} msg() {}
};
global.Env = global.$;

const seen = [];
function record(urlStr, postBody) {
  try {
    const u = new URL(urlStr);
    const fid = u.searchParams.get('functionId');
    console.log(`[REQ] ${urlStr.slice(0, 160)}`);
    if (!fid) return;
    const appid = u.searchParams.get('appid') || (postBody ? (() => { try { return new URLSearchParams(postBody).get('appid'); } catch { return null; } })() : null);
    let body = null;
    if (postBody) { try { body = new URLSearchParams(postBody).get('body'); } catch { body = postBody.slice(0, 300); } }
    const key = fid + '|' + body;
    if (!seen.find(x => x.key === key)) {
      seen.push({ key, fid, appid, body: body && body.length > 600 ? body.slice(0, 600) + '...(trunc)' : body });
      console.log(`\n[FID] ${fid}  appid=${appid || '?'}`);
      if (body) console.log(`      body=${body}`);
    }
  } catch {}
}

// 透传：包装 https.request 记录 body，但让真实请求发出
const origHttpsReq = https.request;
https.request = function (options, callback) {
  let urlStr, chunks = [];
  if (typeof options === 'string' || options instanceof URL) urlStr = String(options);
  else if (options) urlStr = (options.protocol || 'https:') + '//' + (options.hostname || options.host) + (options.path || '/');
  const req = origHttpsReq.call(https, options, callback);
  const origWrite = req.write.bind(req);
  req.write = (c) => { chunks.push(Buffer.isBuffer(c) ? c.toString() : String(c)); return origWrite(c); };
  const origEnd = req.end.bind(req);
  req.end = function (cb) {
    record(urlStr, chunks.join(''));
    return origEnd(cb);
  };
  return req;
};
const origHttpReq = http.request;
http.request = function (options, callback) {
  let urlStr, chunks = [];
  if (typeof options === 'string' || options instanceof URL) urlStr = String(options);
  else if (options) urlStr = (options.protocol || 'http:') + '//' + (options.hostname || options.host) + (options.path || '/');
  const req = origHttpReq.call(http, options, callback);
  const origWrite = req.write.bind(req);
  req.write = (c) => { chunks.push(Buffer.isBuffer(c) ? c.toString() : String(c)); return origWrite(c); };
  const origEnd = req.end.bind(req);
  req.end = function (cb) { record(urlStr, chunks.join('')); return origEnd(cb); };
  return req;
};

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});
const origExit = process.exit;
process.exit = (code) => { console.log('[EXIT stubbed] code=' + code); };

const cfg = JSON.parse(fs.readFileSync('C:\\Users\\z\\Desktop\\adb\\jd_config.json', 'utf8'));
process.env.JD_COOKIE = cfg.cookie;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const target = process.argv[2];
  const waitSec = parseInt(process.argv[3] || '10');
  console.log('=== loading', target, '(passthrough, wait', waitSec, 's) ===');
  try { require(path.join('C:\\Users\\z\\Desktop\\adb\\faker2', target)); }
  catch (e) { console.error('[REQERR]', (e.stack || e.message || String(e)).slice(0, 500)); }
  await sleep(waitSec * 1000);
  console.log(`\n===== ${target} 共抓到 ${seen.length} 个 functionId =====`);
  for (const s of seen) console.log(`   * ${s.fid} appid=${s.appid}`);
  origExit(0);
})();
