/**
 * jd_rankVote.js（重写版）—— 排行榜投票 查询
 * 用法: node jd_rankVote.js [候选id]
 *   不带参数: 查询排行榜
 *   带候选id: 对该候选投票
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  const candidateId = process.argv[2];
  console.log(`[rankVote] 账号 ${decodeURIComponent(cfg.pt_pin)}`);
  let body, fid;
  if (candidateId) {
    fid = 'rankCastVote';
    body = { candidateId, channel: 'rankVote' };
    console.log(`  准备投票给候选: ${candidateId}`);
  } else {
    fid = 'rankVoteList';
    body = { channel: 'rankVote' };
  }
  const r = await callBff(fid, body, { appid: 'signed_wh5' });
  console.log('  返回:', JSON.stringify(r).slice(0, 600));
  const d = r && (r.data || r.result || {});
  const list = Array.isArray(d) ? d : (d.rankList || d.list || d.voteList || []);
  if (list.length) {
    console.log(`  排行榜: ${list.length} 项`);
    for (const it of list.slice(0, 15)) {
      console.log(`    - 第${it.rank || it.pid || '?'}名 ${it.name || it.nickName || it.title || '?'}  票数:${it.votes || it.voteNum || '?'}`);
    }
  } else {
    console.log('  结果:', (r && (r.errMsg || r.msg || r.echo)) || JSON.stringify(d).slice(0, 300));
  }
  return r;
}
if (require.main === module) {
  main().catch(e => { console.error('  错误:', e.message); process.exit(1); });
}
module.exports = { main };
