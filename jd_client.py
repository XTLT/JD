"""
京东自动化核心客户端（Python 重写版）
- 用 ADB + root 从手机 WebView 直接读取登录 Cookie（pt_key/pt_pin），无需手动抓包
- 提供通用请求封装（不依赖 h5st 的接口直接可用）
"""
import subprocess, sqlite3, tempfile, os, json, urllib.request, ssl, time

ADB = r"C:\Users\z\Desktop\adb\platform-tools\adb.exe"
PKG = "com.jingdong.app.mall"
CONFIG = os.path.join(os.path.dirname(__file__), "jd_config.json")

UA = ("jdapp;iPhone;10.0.0;16.0;iPhone14,3;network/wifi;"
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) "
      "AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")


def _adb(*args, timeout=30):
    r = subprocess.run([ADB, *args], capture_output=True, text=True, timeout=timeout)
    return (r.stdout or "") + (r.stderr or "")


def refresh_cookie_from_phone():
    """force-stop 京东 -> root 拷贝 Cookies.db -> pull -> 读取 .jd.com 全部 cookie"""
    _adb("shell", "am", "force-stop", PKG)
    time.sleep(1.5)
    # 两个 WebView profile，优先 d6（新），再主
    for rel in ["app_webview_d6/Default/Cookies", "app_webview/Default/Cookies"]:
        cmd = (f"su -c 'cp /data/data/{PKG}/{rel} /sdcard/_jdck.db && "
               f"chmod 666 /sdcard/_jdck.db && echo OK'")
        out = _adb("shell", cmd)
        if "OK" not in out:
            continue
        local = os.path.join(tempfile.gettempdir(), "_jdck.db")
        _adb("pull", "/sdcard/_jdck.db", local)
        try:
            con = sqlite3.connect(local)
            cur = con.cursor()
            cur.execute("SELECT host_key, name, value FROM cookies")
            jar = {}
            for host, name, value in cur.fetchall():
                if host.endswith(".jd.com"):
                    jar[name] = value
            con.close()
            if "pt_key" in jar and "pt_pin" in jar:
                cookie = "; ".join(f"{k}={v}" for k, v in jar.items())
                cfg = {"pt_key": jar["pt_key"], "pt_pin": jar["pt_pin"],
                       "cookie": cookie, "updated_at": int(time.time())}
                with open(CONFIG, "w", encoding="utf-8") as f:
                    json.dump(cfg, f, ensure_ascii=False, indent=2)
                return cfg
        finally:
            try: os.remove(local)
            except OSError: pass
    raise RuntimeError("未能从手机读取到京东 cookie，请确认京东 App 已登录")


def load_cookie():
    if os.path.exists(CONFIG):
        with open(CONFIG, encoding="utf-8") as f:
            return json.load(f)
    return refresh_cookie_from_phone()


_ctx = ssl.create_default_context()
_ctx.check_hostname = False
_ctx.verify_mode = ssl.CERT_NONE


def api_get(url, cookie=None, referer="https://m.jd.com/"):
    cfg = load_cookie()
    cookie = cookie or cfg["cookie"]
    req = urllib.request.Request(url, headers={
        "Cookie": cookie, "User-Agent": UA,
        "Referer": referer, "Accept": "application/json",
    })
    with urllib.request.urlopen(req, context=_ctx, timeout=20) as r:
        return json.loads(r.read().decode("utf-8", "ignore"))


def user_assets():
    """查询京豆/优惠券/红包余额（对应仓库资产查询类脚本）"""
    data = api_get("https://me-api.jd.com/user_new/info/GetJDUserInfoUnion")
    asset = data.get("data", {}).get("assetInfo", {})
    user = data.get("data", {}).get("userInfo", {}) or {}
    return {
        "nickname": user.get("baseInfo", {}).get("nickname") or user.get("nickname"),
        "bean_num": asset.get("beanNum"),
        "coupon_num": asset.get("couponNum"),
        "red_balance": asset.get("redBalance"),
        "account_balance": asset.get("accountBalance"),
        "raw": data,
    }


if __name__ == "__main__":
    import sys
    if "--refresh" in sys.argv or not os.path.exists(CONFIG):
        cfg = refresh_cookie_from_phone()
        print(f"[cookie] 已从手机刷新: pt_pin={cfg['pt_pin']} (len={len(cfg['cookie'])})")
    assets = user_assets()
    print(f"[账户] {assets['nickname']}")
    print(f"  京豆: {assets['bean_num']}")
    print(f"  优惠券: {assets['coupon_num']} 张")
    print(f"  红包: {assets['red_balance']} 元")
    print(f"  余额: {assets['account_balance']} 元")
