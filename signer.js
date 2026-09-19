// h5st 签名器（Node + jsdom，加载京东官方 js_security 算法）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('./dns_bootstrap.js');
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const UA = 'jdapp;iPhone;10.0.0;16.0;iPhone14,3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1';

function mockCtx() {
  return new Proxy({}, {
    get(t, p) { if (p === 'canvas') return { width: 300, height: 150 }; return () => {}; },
    set() { return true; },
  });
}

let _signer = null;
async function getSigner() {
  if (_signer) return _signer;
  const vc = new VirtualConsole();
  const dom = new JSDOM('<body></body>', {
    url: 'https://m.jd.com/', referrer: 'https://home.m.jd.com/', userAgent: UA,
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => mockCtx();
      window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,x';
    },
  });
  const win = dom.window;
  win.eval(fs.readFileSync(path.join(__dirname, 'js_security.js'), 'utf8'));
  await new Promise(r => setTimeout(r, 300));
  win.eval(fs.readFileSync(path.join(__dirname, 'js_security_main.js'), 'utf8'));
  await new Promise(r => setTimeout(r, 1000));
  _signer = new win.ParamsSign({ appId: 'ld', debug: false });
  return _signer;
}

// 输入 functionId + body，返回带 h5st 的完整请求对象
async function signRequest(functionId, body, method = 'GET', url = null) {
  const signer = await getSigner();
  const req = {
    url: url || `https://api.m.jd.com/?functionId=${encodeURIComponent(functionId)}`,
    body: typeof body === 'string' ? body : JSON.stringify(body || {}),
    functionId,
    method,
  };
  const result = await signer.sign(req);
  return result; // 包含 h5st 字段
}

module.exports = { signRequest, UA };

// 命令行: node signer.js <functionId> <body>
if (require.main === module) {
  const [fid, body] = [process.argv[2] || 'jc_jxsignin', process.argv[3] || '{}'];
  signRequest(fid, body).then(r => {
    process.stdout.write(r.h5st || JSON.stringify(r));
  }).catch(e => { console.error(e); process.exit(1); });
}
