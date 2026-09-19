/**
 * 京东接口核心框架（重写版）
 * 封装：cookie 读取/刷新 + h5st 签名 + BFF/客户端接口请求
 * 所有重写脚本统一 require 本模块
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('./dns_bootstrap.js');
const fs = require('fs');
const path = require('path');
const { signRequest } = require('./signer.js');

const ROOT = path.join(__dirname, '..');
const CONFIG = path.join(ROOT, 'jd_config.json');

// 抓包得到的 App 端 UA（京东 WebView 内置）
const UA = 'jdapp;android;16.0.0;;;M/5.0;appBuild/102707;ef/1;Mozilla/5.0 (Linux; Android 9; MI 6 Build/PKQ1.190118.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.99 Mobile Safari/537.36';

function loadCookie() {
  if (!fs.existsSync(CONFIG)) throw new Error('缺少 jd_config.json，请先 python jd_client.py --refresh');
  const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  if (!cfg.cookie) throw new Error('cookie 为空');
  return cfg;
}

/**
 * 调用京东 BFF 接口（/api?functionId=，带 h5st）
 * @param {string} functionId
 * @param {object} bodyObj  业务 body
 * @param {object} opts  { appid, scene, loginType, extraForm }
 */
async function callBff(functionId, bodyObj = {}, opts = {}) {
  const cfg = loadCookie();
  const appid = opts.appid || 'plus_business';
  const bodyStr = JSON.stringify(bodyObj);
  const sign = await signRequest(functionId, bodyStr, 'POST');
  const t = String(Date.now());
  const formObj = {
    appid, functionId, body: bodyStr,
    loginType: opts.loginType || '2',
    t, h5st: sign.h5st,
  };
  if (opts.extraForm) Object.assign(formObj, opts.extraForm);
  const form = new URLSearchParams(formObj).toString();
  const scene = opts.scene || '';
  const url = `https://api.m.jd.com/api?functionId=${encodeURIComponent(functionId)}` + (scene ? `&scene=${encodeURIComponent(scene)}` : '');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Cookie': cfg.cookie,
      'User-Agent': UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': opts.referer || 'https://pro.m.jd.com/',
      'Origin': 'https://pro.m.jd.com',
    },
    body: form,
  });
  return res.json();
}

/**
 * 调用客户端接口（/client.action?functionId=，App 原生风格，带 h5st）
 */
async function callClient(functionId, bodyObj = {}, opts = {}) {
  const cfg = loadCookie();
  const bodyStr = JSON.stringify(bodyObj);
  const sign = await signRequest(functionId, bodyStr, 'POST');
  const t = String(Date.now());
  const qs = new URLSearchParams({
    functionId, clientVersion: '16.0.0', build: '102707', client: 'android',
    partner: 'xiaomi001', sdkVersion: '28', lang: 'zh_CN',
    t, h5st: sign.h5st, ...opts.extraQuery,
  }).toString();
  const url = `https://api.m.jd.com/client.action?${qs}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Cookie': cfg.cookie,
      'User-Agent': UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': opts.referer || 'https://m.jd.com/',
    },
    body: `body=${encodeURIComponent(bodyStr)}`,
  });
  return res.json();
}

module.exports = { callBff, callClient, loadCookie, UA };
