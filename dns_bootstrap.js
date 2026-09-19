// 在所有网络请求前加载：把 Node 的 dns.lookup 重定向到公共 DNS，绕过内网 DNS 污染
const dns = require('dns');
dns.setServers(['223.5.5.5', '114.114.114.114', '180.76.76.76']);

const origLookup = dns.lookup;

dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') { callback = options; options = {}; }
  if (typeof options === 'number') options = { family: options };
  options = options || {};
  // 对系统/本地名回退原生解析
  if (!hostname || hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return origLookup.call(dns, hostname, options, callback);
  }
  dns.resolve4(hostname, (err4, a4) => {
    if (!err4 && a4 && a4.length) {
      if (options.all) {
        return callback(null, a4.map(addr => ({ address: addr, family: 4 })));
      }
      return callback(null, a4[0], 4);
    }
    return origLookup.call(dns, hostname, options, callback);
  });
};
module.exports = dns;
