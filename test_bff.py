import json, os, subprocess, urllib.request, ssl, urllib.parse, time

ROOT = r"C:\Users\z\Desktop\adb"
SIGNER_DIR = os.path.join(ROOT, "faker2")
CONFIG = os.path.join(ROOT, "jd_config.json")
UA = ("jdapp;android;16.0.0;;;M/5.0;appBuild/102707;ef/1;ep/%7B%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22ts%22%3A1789652072665%2C%22ridx%22%3A-1%2C%22cipher%22%3A%7B%22sv%22%3A%22EG%3D%3D%22%2C%22ad%22%3A%22DQGmDJK4YzZuYzrwDWTvCK%3D%3D%22%2C%22od%22%3A%22DNq3D2C1YWS1DQCnDwYyDq%3D%3D%22%2C%22ov%22%3A%22Ctq%3D%22%2C%22ud%22%3A%22DQGmDJK4YzZuYzrwDWTvCK%3D%3D%22%7D%2C%22ciphertype%22%3A5%2C%22version%22%3A%221.2.1%22%2C%22appname%22%3A%22com.jingdong.app.mall%22%7D;jdSupportDarkMode/0;lang/zh_CN;site/CN;elder/2;ccy/CNY;tz/;Mozilla/5.0 (Linux; Android 9; MI 6 Build/PKQ1.190118.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.99 Mobile Safari/537.36")

_ctx = ssl.create_default_context(); _ctx.check_hostname = False; _ctx.verify_mode = ssl.CERT_NONE


def get_h5st(functionId, body_str):
    r = subprocess.run(["node", "signer.js", functionId, body_str], cwd=SIGNER_DIR,
                       capture_output=True, text=True, timeout=30, encoding="utf-8", errors="ignore")
    for line in (r.stdout or "").splitlines():
        line = line.strip()
        if line.count(";") >= 5 and line[:8].isdigit():
            return line
    raise RuntimeError(f"no h5st: {r.stdout[:200]} {r.stderr[:200]}")


def call_bff(functionId, body_obj, appid="plus_business"):
    cfg = json.load(open(CONFIG, encoding="utf-8"))
    body_str = json.dumps(body_obj, separators=(",", ":"), ensure_ascii=False)
    h5st = get_h5st(functionId, body_str)
    t = str(int(time.time() * 1000))
    form = urllib.parse.urlencode({
        "appid": appid,
        "functionId": functionId,
        "body": body_str,
        "loginType": "2",
        "t": t,
        "h5st": h5st,
    })
    url = f"https://api.m.jd.com/api?functionId={urllib.parse.quote(functionId)}&scene=userInfo"
    req = urllib.request.Request(url, data=form.encode("utf-8"), headers={
        "Cookie": cfg["cookie"],
        "User-Agent": UA,
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://pro.m.jd.com/",
        "Origin": "https://pro.m.jd.com",
    })
    with urllib.request.urlopen(req, context=_ctx, timeout=20) as r:
        return json.loads(r.read().decode("utf-8", "ignore"))


if __name__ == "__main__":
    res = call_bff("bff_rightsCenter_userInfo", {"scene": "userInfo", "contentType": "28_29"})
    print(json.dumps(res, ensure_ascii=False, indent=2)[:1500])
