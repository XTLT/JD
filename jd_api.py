"""
京东接口客户端（路线A）
- cookie: 从手机 ADB 读取（jd_client.py）
- h5st: 调用本地 Node 签名器（jsdom + 京东官方 js_security 算法）
"""
import json, os, subprocess, urllib.request, ssl, urllib.parse, sys

ROOT = r"C:\Users\z\Desktop\adb"
SIGNER_DIR = os.path.join(ROOT, "faker2")
CONFIG = os.path.join(ROOT, "jd_config.json")
NODE = "node"

UA = ("jdapp;iPhone;10.0.0;16.0;iPhone14,3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) "
      "AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")

_ctx = ssl.create_default_context(); _ctx.check_hostname = False; _ctx.verify_mode = ssl.CERT_NONE


def get_h5st(functionId, body):
    """调用 Node 签名器生成 h5st，返回字符串"""
    r = subprocess.run(
        [NODE, "signer.js", functionId, body if isinstance(body, str) else json.dumps(body)],
        cwd=SIGNER_DIR, capture_output=True, text=True, timeout=30,
        encoding="utf-8", errors="ignore")
    out = (r.stdout or "").strip()
    # h5st 以分号分段，取到换行/末尾
    for line in out.splitlines():
        line = line.strip()
        if line.count(";") >= 5 and line[:8].isdigit():
            return line
    raise RuntimeError(f"h5st 生成失败: stdout={out[:200]} stderr={(r.stderr or '')[:200]}")


def call_m(functionId, body=None, need_h5st=True, appid="ld"):
    """调用 api.m.jd.com"""
    with open(CONFIG, encoding="utf-8") as f:
        cookie = json.load(f)["cookie"]
    body_str = body if isinstance(body, str) else json.dumps(body or {}, separators=(",", ":"))
    url = f"https://api.m.jd.com/?functionId={urllib.parse.quote(functionId)}&appid={appid}&body={urllib.parse.quote(body_str)}"
    if need_h5st:
        h5st = get_h5st(functionId, body_str)
        url += f"&h5st={urllib.parse.quote(h5st)}"
    req = urllib.request.Request(url, headers={
        "Cookie": cookie, "User-Agent": UA,
        "Referer": "https://home.m.jd.com/", "Accept": "application/json",
    })
    with urllib.request.urlopen(req, context=_ctx, timeout=20) as r:
        return json.loads(r.read().decode("utf-8", "ignore"))


if __name__ == "__main__":
    fid = sys.argv[1] if len(sys.argv) > 1 else "JBeanHomeInfo"
    body = sys.argv[2] if len(sys.argv) > 2 else "{}"
    print("=== 无 h5st ===")
    try:
        r0 = call_m(fid, body, need_h5st=False)
        print(json.dumps(r0, ensure_ascii=False)[:400])
    except Exception as e:
        print("ERR:", e)
    print("\n=== 有 h5st ===")
    try:
        r1 = call_m(fid, body, need_h5st=True)
        print(json.dumps(r1, ensure_ascii=False)[:600])
    except Exception as e:
        print("ERR:", e)
