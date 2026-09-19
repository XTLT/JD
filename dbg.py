import sys
sys.path.insert(0, r"C:\Users\z\Desktop\adb\jd_auto")
from test_bff import get_h5st, call_bff
import json

print("step1: get h5st...")
h = get_h5st("bff_rightsCenter_userInfo", '{"scene":"userInfo","contentType":"28_29"}')
print("h5st len:", len(h), "head:", h[:60])

print("step2: call bff...")
res = call_bff("bff_rightsCenter_userInfo", {"scene": "userInfo", "contentType": "28_29"})
print("RESULT:")
print(json.dumps(res, ensure_ascii=False, indent=2)[:1500])
