const { callBff } = require('./jd_core.js');
(async () => {
  const r = await callBff('bff_rightsCenter_userInfo', { scene: 'userInfo', contentType: '28_29' });
  console.log('code:', r.code, 'msg:', r.msg, '京豆:', r.rs && r.rs.jingBeans);
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
