# 京东脚本重写 — Subagent 共享规范（必读）

你在重写京东签到/任务脚本。原仓库脚本被 jsjiami v7 加密，静态读不到 functionId；已建立 hook 提取法和重写框架。

## 环境与路径（全部硬编码，不要改）
- 工作根目录：`C:\Users\z\Desktop\adb`
- 原加密脚本：`C:\Users\z\Desktop\adb\faker2\jd_*.js`
- 重写输出：`C:\Users\z\Desktop\adb\jd_auto\scripts\jd_xxx.js`（与原名同名）
- 核心框架：`C:\Users\z\Desktop\adb\jd_auto\jd_core.js`
- 已提取 functionId 表：`C:\Users\z\Desktop\adb\jd_auto\fid_map.json`
- Cookie 配置：`C:\Users\z\Desktop\adb\jd_config.json`（已登录，pt_pin=张力45683968）
- 单脚本 hook 模板：`C:\Users\z\Desktop\adb\hook_daka.js`
- 批量提取器（参考其 mock 写法）：`C:\Users\z\Desktop\adb\jd_auto\extract_all.js`
- Shell 是 **PowerShell**，不要用 Bash 语法。运行脚本一律：
  ```powershell
  cd C:\Users\z\Desktop\adb; node jd_auto\scripts\jd_xxx.js
  ```

## 已有可直接复用的模板（先读这两个）
- `jd_auto\scripts\jd_CheckCK.js` — 标准查询类：callBff(functionId, body)
- `jd_auto\scripts\jd_daka_bean.js` — 标准签到类
- `jd_auto\jd_core.js` 导出：`callBff(fid, bodyObj, opts)` 和 `callClient(fid, bodyObj, opts)`
  - opts: `{ appid, scene, loginType, referer, extraForm }`
  - 默认 appid=plus_business；fid_map.json 里有每个接口的真实 appid，**必须用那个**。

## 标准脚本骨架
```js
/**
 * jd_xxx.js（重写版）—— <一句话功能>
 * functionId: <从 fid_map 或 hook 得到>
 */
const { callBff, loadCookie } = require('../jd_core.js');

async function main() {
  const cfg = loadCookie();
  console.log(`[xxx] ${decodeURIComponent(cfg.pt_pin)}`);
  const r = await callBff('<fid>', { ...body... }, { appid: '<真实appid>' });
  console.log('  结果:', JSON.stringify(r).slice(0, 400));
  return r;
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main };
```

## 提取缺失 functionId 的方法
fid_map.json 里为空的脚本，自己 hook 提取：
1. 复制 `hook_daka.js` 为临时文件，把 `process.argv[2]` 指向目标脚本。
2. 关键：mock 响应要返回 `{code:'0',data:{},success:true}` 而不是 `{}`，否则脚本初始化就退出。
3. mock 的 https.request 要返回一个 EventEmitter，emit `'response'` 事件（参考 extract_all.js 里的 wrap 函数）。
4. require 目标脚本后等待 3-5 秒（`await new Promise(r=>setTimeout(r,5000))`），因为很多脚本用 setTimeout 延迟发请求。
5. 拦截时打印：method、完整 url、POST body（form 里的 body 字段）、appid。
6. 注意 stub 掉 `process.exit`（否则脚本一结束就把整个 hook 进程杀了）和 `sharp` 等缺失模块。

## 验收标准（每个脚本都必须满足）
1. 文件落在 `jd_auto\scripts\jd_xxx.js`，与原名同名。
2. `node jd_auto\scripts\jd_xxx.js` 能跑完不崩（退出码 0 或正常打印结果）。
3. 必须调用真实接口（用 jd_core 的 callBff/callClient，h5st 自动签名），输出里能看到真实返回的 code/data 字段。
4. 有人类可读输出（京豆数、签到结果、错误原因等）。
5. 助力类/需要他人分享码的脚本：不要硬编码假码；输出"需要助力码，用法：node jd_xxx.js <code>"并优雅退出，不要崩。
6. 运行测试时脚本之间 sleep 2 秒，避免对同一账号打太快触发风控。

## 不要碰
- 已完成的 6 个：jd_autock / jd_CheckCK / jd_bean_change / jd_bean_home / jd_clean_coupon / jd_daka_bean。
- 不要修改 jd_core.js、signer.js、dns_bootstrap.js、jd_config.json。
- 不要删原仓库 faker2 里的任何文件。

## 交付汇报
全部完成后，在最终消息里给一个清单：每个脚本一行，格式 `jd_xxx.js | 状态(✓真实返回/△需助力码/✗原因) | 输出要点`。
