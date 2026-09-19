/**
 * 京东京豆查询（重写版，对应仓库 jd_CheckCK / jd_bean_home 查询功能）
 * 链路：读取本地 cookie 配置 -> 本地 jsdom 生成 h5st -> 调用京东接口 -> 输出京豆
 * 运行：node jd_bean.js
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('./dns_bootstrap.js');
const fs = require('fs');
const path = require('path');
const { signRequest, UA } = require('./signer.js');

const CONFIG = path.join(__dirname, '..', 'jd_config.json');

function loadCookie() {
  if (!fs.existsSync(CONFIG)) {
    console.error('未找到 jd_config.json，请先运行 python jd_client.py --refresh 从手机刷新 cookie');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
}

async function getBean() {
  const cfg = loadCookie();
  const bodyObj = { scene: 'userInfo', contentType: '28_29' };
  const bodyStr = JSON.stringify(bodyObj);
  const r = await signRequest('bff_rightsCenter_userInfo', bodyStr, 'POST');
  const h5st = r.h5st;
  const t = String(Date.now());
  const form = new URLSearchParams({
    appid: 'plus_business',
    functionId: 'bff_rightsCenter_userInfo',
    body: bodyStr,
    loginType: '2',
    t, h5st,
  }).toString();
  const url = `https://api.m.jd.com/api?functionId=bff_rightsCenter_userInfo&scene=userInfo`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Cookie': cfg.cookie,
      'User-Agent': UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://pro.m.jd.com/',
      'Origin': 'https://pro.m.jd.com',
    },
    body: form,
  });
  const data = await res.json();
  return { cookie: cfg, data };
}

if (require.main === module) {
  getBean().then(({ cookie, data }) => {
    if (data.code === '1711000') {
      console.log('CK 状态：有效 ✓');
      console.log('账号：' + decodeURIComponent(cookie.pt_pin));
      console.log('京豆：' + (data.rs.jingBeans || 0) + ' 个（约 ' + (data.rs.jingBeanValue || 0) + ' 元）');
    } else {
      console.log('CK 状态：可能已失效 ✗');
      console.log(JSON.stringify(data));
    }
  }).catch(e => { console.error('ERR:', e.message); process.exit(1); });
}
