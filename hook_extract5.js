/**
 * hook_extract5.js — 单独提取 5 个缺 fid 的脚本
 * 打印每个请求的 method / url / appid / body
 */
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');
const { EventEmitter } = require('events');
const Module = require('module');

const origLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'sharp') return () => ({ metadata: async () => ({}), toBuffer: async () => Buffer.alloc(0) });
  try { return origLoad.apply(this, arguments); } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') return () => {};
    throw e;
  }
};

global.request = async () => ({ statusCode: 200, body: FAT, headers: {} });
global.notify = () => {};
global.$ = class {
  constructor(name) { this.name = name; }
  getEnvs() { return [{ value: process.env.JD_COOKIE }]; }
  getData() { return null; }
  setData() {} getBool() { return false; } getString() { return ''; } getJSON() { return {}; }
  log() {} info() {} error() {} msg() {}
};
global.Env = global.$;

const FAT = JSON.stringify({
  code:'0', success:true, message:'成功',
  data:{
    taskInfoList:[], taskList:[], lotteryTaskList:[], tasks:[], userTaskList:[],
    remainDrawTimes:1, remainChance:1, drawTimes:0, lotteryChance:1, chance:1,
    awardList:[], awards:[], userAwardList:[], prizeList:[],
    userInfo:{remainDrawTimes:1,lotteryChance:1}, helpInfo:{}, taskInfo:{},
    linkId:'', taskId:''
  },
  result:{}, rs:{}
});
function fakeRes() {
  const r = new (require('stream').Readable)();
  r.push(FAT); r.push(null);
  r.statusCode = 200; r.headers = {}; return r;
}
function logReq(script, urlStr, method, postBody) {
  try {
    const u = new URL(urlStr);
    const fid = u.searchParams.get('functionId');
    const appidQ = u.searchParams.get('appid');
    let appid = appidQ, body = null, formFid = null;
    if (postBody) {
      try {
        const p = new URLSearchParams(postBody);
        body = p.get('body');
        if (!appid) appid = p.get('appid');
        formFid = p.get('functionId');
      } catch { body = postBody.slice(0, 300); }
    }
    const realFid = fid || formFid;
    console.log(`  [REQ] ${script} ${method} fid=${realFid || '(none)'} appid=${appid || '?'} path=${u.pathname}`);
    if (postBody) console.log(`         RAWFORM=${String(postBody).slice(0, 400)}`);
    if (body) console.log(`         body=${String(body).slice(0, 300)}`);
  } catch (e) { console.log(`  [REQ(raw)] ${script} ${method} ${urlStr.slice(0,200)} post=${(postBody||'').slice(0,200)}`); }
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
      logReq(process.env.CURRENT_SCRIPT, urlStr, method, chunks.join(''));
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
  logReq(process.env.CURRENT_SCRIPT, urlStr, (init && init.method) || 'GET', postBody);
  return new Response(JSON.stringify({ code: '0', data: {}, success: true }), { status: 200 });
};

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});
const realExit = process.exit.bind(process);
process.exit = (code) => { console.log(`  [exit ${code}] ${process.env.CURRENT_SCRIPT}`); };

const cfg = JSON.parse(fs.readFileSync('C:\\Users\\z\\Desktop\\adb\\jd_config.json', 'utf8'));
process.env.JD_COOKIE = cfg.cookie;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const scripts = ['jd_lmdraw.js','jd_luckyDraw.js','jd_sx_draw.js','jd_ifdraw.js','jd_jingpai.js'].filter(s => !process.env.ONLY || s === process.env.ONLY);
  for (const s of scripts) {
    process.env.CURRENT_SCRIPT = s;
    console.log(`\n===== loading ${s} =====`);
    try { require(path.join('C:\\Users\\z\\Desktop\\adb\\faker2', s)); }
    catch (e) { console.log('  [ERR]', (e.message || String(e)).slice(0, 200)); }
    await sleep(5000);
  }
  console.log('\n===== done =====');
  realExit(0);
})();
