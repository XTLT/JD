/**
 * hook_dplh.js — 我的专用 hook（避免与他人冲突），打印 functionId+body+appid
 * 用法: node jd_auto\hook_dplh.js <script.js>
 */
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');
const { EventEmitter } = require('events');
const Module = require('module');

const origLoad = Module._load;
const stubClass = class {
  constructor() {}
  log() {} info() {} error() {} msg() {} notice() {}
  getEnvs() { return [{ value: process.env.JD_COOKIE }]; }
  getData() { return null; } setData() {} getBool() { return false; }
  getString() { return ''; } getJSON() { return {}; }
  request() { return Promise.resolve({ statusCode: 200, body: '{}' }); }
};
Module._load = function (request) {
  if (request === 'sharp') return () => ({ metadata: async () => ({}), toBuffer: async () => Buffer.alloc(0) });
  try { return origLoad.apply(this, arguments); } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') return stubClass;
    throw e;
  }
};

global.request = async (options) => {
  try {
    let urlStr, postBody = null;
    if (typeof options === 'string') urlStr = options;
    else if (options && options.url) urlStr = options.url;
    else if (options) {
      urlStr = (options.protocol || 'https:') + '//' + (options.hostname || options.host) + (options.path || '/');
      postBody = (options.body || options.form) ? (typeof (options.body || options.form) === 'string' ? (options.body || options.form) : JSON.stringify(options.body || options.form)) : null;
    }
    if (urlStr) record('grequest', urlStr, postBody);
  } catch (e) {}
  return { statusCode: 200, body: JSON.stringify({ code: '0', data: {}, success: true, message: '成功' }), headers: {} };
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
function record(tag, urlStr, postBody) {
  try {
    const u = new URL(urlStr);
    const fid = u.searchParams.get('functionId');
    console.log(`[REQ] ${u.host}${u.pathname}  fid=${fid || '-'}`);
    if (!fid) return;
    const appid = u.searchParams.get('appid') || (postBody ? (() => { try { return new URLSearchParams(postBody).get('appid'); } catch { return null; } })() : null);
    let body = null;
    if (postBody) { try { body = new URLSearchParams(postBody).get('body'); } catch { body = postBody.slice(0, 300); } }
    const key = tag + '|' + fid + '|' + body;
    if (!seen.find(x => x.key === key)) {
      seen.push({ key, fid, appid, body: body && body.length > 600 ? body.slice(0, 600) + '...(trunc)' : body });
      console.log(`[FID] (${tag}) ${fid}  appid=${appid || '?'}`);
      if (body) console.log(`      body=${body}`);
    }
  } catch {}
}
function fakeRes() {
  // EventEmitter + 支持 .read()/.setEncoding()/.on('data')
  const { EventEmitter } = require('events');
  const r = new EventEmitter();
  r.statusCode = 200; r.headers = {};
  const body = JSON.stringify({ code: '0', data: {}, success: true, message: '成功' });
  let pushed = false;
  r.setEncoding = () => {};
  r.read = () => {
    if (pushed) return null;
    pushed = true;
    return Buffer.from(body);
  };
  r.on('newListener', (ev) => {
    if (ev === 'data' && !pushed) {
      pushed = true;
      setImmediate(() => { r.emit('data', Buffer.from(body)); r.emit('end'); });
    }
  });
  r.emitData = () => {
    if (pushed) return;
    pushed = true;
    setImmediate(() => { r.emit('data', Buffer.from(body)); r.emit('end'); });
  };
  return r;
}
function wrap() {
  return function (options, callback) {
    let urlStr, method = 'GET', chunks = [];
    if (typeof options === 'string' || options instanceof URL) urlStr = String(options);
    else if (options) { urlStr = (options.protocol || 'https:') + '//' + (options.hostname || options.host) + (options.path || '/'); method = options.method || 'GET'; }
    const req = new EventEmitter();
    req.method = method; req.path = urlStr;
    req.write = (c) => { chunks.push(Buffer.isBuffer(c) ? c.toString() : String(c)); return true; };
    req.end = (cb) => {
      if (typeof cb === 'function') cb();
      record('http', urlStr, chunks.join(''));
      const res = fakeRes();
      setImmediate(() => { req.emit('response', res); res.emitData(); });
      return req;
    };
    req.setHeader = () => {}; req.setEncoding = () => {};
    req.abort = () => {}; req.destroy = () => {};
    if (typeof callback === 'function') {
      const res = fakeRes();
      req.on('response', () => {});
      setImmediate(() => { callback(res); res.emitData(); });
    }
    return req;
  };
}
https.request = wrap(); http.request = wrap();
https.get = function (o, cb) { const r = https.request(o, cb); r.end(); return r; };
http.get = function (o, cb) { const r = http.request(o, cb); r.end(); return r; };

global.fetch = async (input, init) => {
  const urlStr = typeof input === 'string' ? input : (input && input.url) || String(input);
  let postBody = init && init.body ? (typeof init.body === 'string' ? init.body : String(init.body)) : null;
  record('fetch', urlStr, postBody);
  return new Response(JSON.stringify({ code: '0', data: {}, success: true }), { status: 200 });
};

process.on('unhandledRejection', (e) => console.log('[unhandledRejection]', (e && e.message) || e));
process.on('uncaughtException', (e) => console.log('[uncaughtException]', (e && e.stack) || e));
const origExit = process.exit;
process.exit = (code) => { console.log('[EXIT stubbed] code=' + code); };

const cfg = JSON.parse(fs.readFileSync('C:\\Users\\z\\Desktop\\adb\\jd_config.json', 'utf8'));
process.env.JD_COOKIE = cfg.cookie;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const target = process.argv[2];
  console.log('=== loading', target, '===');
  try { require(path.join('C:\\Users\\z\\Desktop\\adb\\faker2', target)); }
  catch (e) { console.error('[REQERR]', (e.stack || e.message || String(e)).slice(0, 800)); }
  await sleep(6000);
  console.log(`\n===== ${target} 共抓到 ${seen.length} 个 functionId =====`);
  for (const s of seen) console.log(`   * ${s.fid} appid=${s.appid}`);
  origExit(0);
})();
