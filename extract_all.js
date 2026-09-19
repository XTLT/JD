/**
 * extract_all.js — 批量提取所有脚本的 functionId + body + appid（异步顺序版）
 * 输出: jd_auto/fid_map.json
 */
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');
const { EventEmitter } = require('events');
const Module = require('module');

// ===== stub 掉非关键原生模块 =====
const origLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'sharp') return () => ({ metadata: async () => ({}), toBuffer: async () => Buffer.alloc(0) });
  try { return origLoad.apply(this, arguments); } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      // 其他缺包一律返回空 stub
      return () => {};
    }
    throw e;
  }
};

global.request = async () => ({ statusCode: 200, body: JSON.stringify({ code: '0', data: {}, success: true, message: '成功' }), headers: {} });
global.notify = () => {};
global.$ = class {
  constructor(name) { this.name = name; }
  getEnvs() { return [{ value: process.env.JD_COOKIE }]; }
  getData() { return null; }
  setData() {} getBool() { return false; } getString() { return ''; } getJSON() { return {}; }
  log() {} info() {} error() {} msg() {}
};
global.Env = global.$;

const OUT = {};
function record(script, urlStr, method, postBody) {
  try {
    const u = new URL(urlStr);
    const fid = u.searchParams.get('functionId');
    if (!fid) return;
    const appid = u.searchParams.get('appid') || (postBody ? (() => { try { return new URLSearchParams(postBody).get('appid'); } catch { return null; } })() : null);
    let body = null;
    if (postBody) { try { body = new URLSearchParams(postBody).get('body'); } catch { body = postBody.slice(0, 200); } }
    if (body && body.length > 500) body = body.slice(0, 500);
    if (!OUT[script]) OUT[script] = [];
    if (!OUT[script].find(x => x.fid === fid && x.body === body)) OUT[script].push({ fid, appid, body, host: u.host });
  } catch {}
}
function fakeRes() {
  const r = new (require('stream').Readable)();
  r.push(JSON.stringify({ code: '0', data: {}, success: true, message: '成功' })); r.push(null);
  r.statusCode = 200; r.headers = {}; return r;
}
function wrap(orig) {
  return function(options, callback) {
    let urlStr, method = 'GET', chunks = [];
    if (typeof options === 'string' || options instanceof URL) urlStr = String(options);
    else if (options) { urlStr = (options.protocol || 'https:') + '//' + (options.hostname || options.host) + (options.path || '/'); method = options.method || 'GET'; }
    const req = new EventEmitter();
    req.method = method; req.path = urlStr;
    req.write = (c) => { chunks.push(Buffer.isBuffer(c) ? c.toString() : String(c)); return true; };
    req.end = (cb) => {
      if (typeof cb === 'function') cb();
      record(process.env.CURRENT_SCRIPT, urlStr, method, chunks.join(''));
      const res = fakeRes();
      setImmediate(() => { req.emit('response', res); req.emit('end'); });
      return req;
    };
    req.setHeader = () => {}; req.setEncoding = () => {};
    req.abort = () => {}; req.destroy = () => {};
    if (typeof callback === 'function') {
      const res = fakeRes();
      req.on('response', () => {});
      setImmediate(() => callback(res));
    }
    return req;
  };
}
https.request = wrap(https.request); http.request = wrap(http.request);
https.get = function(o, cb) { const r = https.request(o, cb); r.end(); return r; };
http.get = function(o, cb) { const r = http.request(o, cb); r.end(); return r; };

global.fetch = async (input, init) => {
  const urlStr = typeof input === 'string' ? input : (input && input.url) || String(input);
  let postBody = init && init.body ? (typeof init.body === 'string' ? init.body : String(init.body)) : null;
  record(process.env.CURRENT_SCRIPT, urlStr, (init && init.method) || 'GET', postBody);
  return new Response(JSON.stringify({ code: '0', data: {}, success: true }), { status: 200 });
};

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});
process.exit = (code) => { record(process.env.CURRENT_SCRIPT, 'exit:' + code, 'EXIT', null); };

const cfg = JSON.parse(fs.readFileSync('C:\\Users\\z\\Desktop\\adb\\jd_config.json', 'utf-8'));
process.env.JD_COOKIE = cfg.cookie;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const scripts = fs.readdirSync('C:\\Users\\z\\Desktop\\adb\\faker2').filter(f => /^jd_.*\.js$/.test(f)).sort();
  for (const s of scripts) {
    process.env.CURRENT_SCRIPT = s;
    try { require(path.join('C:\\Users\\z\\Desktop\\adb\\faker2', s)); }
    catch (e) { OUT[s] = OUT[s] || []; OUT[s]._err = (e.message || String(e)).slice(0, 150); }
    await sleep(300);
  }
  fs.writeFileSync('C:\\Users\\z\\Desktop\\adb\\jd_auto\\fid_map.json', JSON.stringify(OUT, null, 2), 'utf8');
  console.log('\n===== 提取完成，共', Object.keys(OUT).length, '个脚本 =====');
  let total = 0, withFid = 0;
  for (const [s, arr] of Object.entries(OUT)) {
    const fids = (arr || []).filter(x => x && x.fid);
    total += fids.length; if (fids.length) withFid++;
    console.log(`\n${s}: ${fids.length} fid${arr._err ? '  [err:' + arr._err + ']' : ''}`);
    for (const f of fids) console.log(`    ${f.fid}  appid=${f.appid || '?'}`);
  }
  console.log(`\n有 fid 的脚本: ${withFid}/${scripts.length}, 总 fid: ${total}`);
})();
