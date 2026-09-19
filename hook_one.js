/**
 * hook_one.js — hook 单个 faker2 脚本，打印所有 functionId + body + appid
 * 用法: node jd_auto\hook_one.js <script.js>
 */
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');
const { EventEmitter } = require('events');
const Module = require('module');

// stub 掉缺失原生模块
const origLoad = Module._load;
Module._load = function (request) {
  if (request === 'sharp') return () => ({ metadata: async () => ({}), toBuffer: async () => Buffer.alloc(0) });
  const stubClass = class {
    constructor() {}
    log() {} info() {} error() {} msg() {} notice() {}
    getEnvs() { return [{ value: process.env.JD_COOKIE }]; }
    getData() { return null; } setData() {} getBool() { return false; }
    getString() { return ''; } getJSON() { return {}; }
    request() { return Promise.resolve({ statusCode: 200, body: '{}' }); }
  };
  try { return origLoad.apply(this, arguments); } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') return stubClass;
    throw e;
  }
};

function extractFromBody(postBody) {
  let fid = null, appid = null, body = null;
  if (!postBody) return { fid, appid, body };
  try {
    const sp = new URLSearchParams(postBody);
    fid = sp.get('functionId'); appid = sp.get('appid'); body = sp.get('body');
  } catch { body = String(postBody).slice(0, 300); }
  return { fid, appid, body };
}
function logReq(tag, urlStr, postBody) {
  try {
    const u = new URL(urlStr);
    const fb = extractFromBody(postBody);
    let fid = u.searchParams.get('functionId') || fb.fid;
    const appid = u.searchParams.get('appid') || fb.appid;
    let body = fb.body;
    if (fid) {
      const key = tag + '|' + fid + '|' + body;
      if (!seen.find(x => x.key === key)) {
        seen.push({ key, fid, appid, body: body && body.length > 600 ? body.slice(0, 600) + '...(trunc)' : body, host: u.host });
        console.log(`[FID] (${tag}) ${fid}  appid=${appid || '?'}  host=${u.host}`);
        if (body) console.log(`      body=${body}`);
      }
    }
  } catch {}
}
global.request = async (options) => {
  try {
    let urlStr, postBody = null;
    if (typeof options === 'string' || (options && options.url)) {
      urlStr = typeof options === 'string' ? options : options.url;
      postBody = (options && (options.body || options.form)) ? (typeof (options.body || options.form) === 'string' ? (options.body || options.form) : JSON.stringify(options.body || options.form)) : null;
    } else if (options) {
      urlStr = (options.protocol || 'https:') + '//' + (options.hostname || options.host) + (options.path || '/');
      postBody = null;
    }
    if (urlStr) logReq('grequest', urlStr, postBody);
  } catch (e) { console.log('[logReq err]', e.message); }
  return { statusCode: 200, body: JSON.stringify({ code: '0', data: {}, success: true, message: '成功' }), headers: {} };
};
global.notify = () => {};
global.$ = class {
  constructor(name) { this.name = name; }
  getEnvs() { return [{ value: process.env.JD_COOKIE }]; }
  getData() { return null; }
  setData() {} getBool() { return false; } getString() { return ''; } getJSON() { return {}; }
  log() {} info() {} error() {} msg() {}
};
global.Env = global.$;

const seen = [];
function record(urlStr, method, postBody) {
  try {
    const u = new URL(urlStr);
    const fb = extractFromBody(postBody);
    let fid = u.searchParams.get('functionId') || fb.fid;
    const appid = u.searchParams.get('appid') || fb.appid;
    let body = fb.body;
    if (fid) {
      const key = fid + '|' + body;
      if (!seen.find(x => x.key === key)) {
        seen.push({ key, fid, appid, body: body && body.length > 600 ? body.slice(0, 600) + '...(trunc)' : body, host: u.host });
        console.log(`[FID] (net) ${fid}  appid=${appid || '?'}  host=${u.host}`);
        if (body) console.log(`      body=${body}`);
      }
    }
  } catch {}
}
function fakeRes() {
  const r = new (require('stream').Readable)();
  r.push(JSON.stringify({ code: '0', data: {}, success: true, message: '成功' })); r.push(null);
  r.statusCode = 200; r.headers = {}; return r;
}
function wrap(orig) {
  return function (options, callback) {
    let urlStr, method = 'GET', chunks = [];
    if (typeof options === 'string' || options instanceof URL) urlStr = String(options);
    else if (options) { urlStr = (options.protocol || 'https:') + '//' + (options.hostname || options.host) + (options.path || '/'); method = options.method || 'GET'; }
    const req = new EventEmitter();
    req.method = method; req.path = urlStr;
    req.write = (c) => { chunks.push(Buffer.isBuffer(c) ? c.toString() : String(c)); return true; };
    req.end = (cb) => {
      if (typeof cb === 'function') cb();
      record(urlStr, method, chunks.join(''));
      if (urlStr.includes('apTaskList') || urlStr.includes('wheelsHome')) {
        console.log('[RAW-BODY]', chunks.join('').slice(0, 500));
      }
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
https.get = function (o, cb) { const r = https.request(o, cb); r.end(); return r; };
http.get = function (o, cb) { const r = http.request(o, cb); r.end(); return r; };

global.fetch = async (input, init) => {
  const urlStr = typeof input === 'string' ? input : (input && input.url) || String(input);
  let postBody = init && init.body ? (typeof init.body === 'string' ? init.body : String(init.body)) : null;
  record(urlStr, (init && init.method) || 'GET', postBody);
  return new Response(JSON.stringify({ code: '0', data: {}, success: true }), { status: 200 });
};

process.on('unhandledRejection', (e) => { console.log('[UNHANDLED REJECTION]', (e && (e.stack || e.message)) || e); });
process.on('uncaughtException', (e) => { console.log('[UNCAUGHT]', (e && (e.stack || e.message)) || e); });
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
  origExit(0);
})();
