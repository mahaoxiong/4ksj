# 4K世界自动签到 For 青龙面板

## 功能说明

1. 支持4K世界网站的自动签到
2. 支持多账号签到
3. 使用青龙面板内置通知功能推送签到结果

## 青龙面板使用教程

### 1. 添加脚本
在青龙面板的"订阅管理"中添加订阅：
```bash
名称：4K世界签到
类型：公开仓库
链接：https://raw.githubusercontent.com/mahaoxiong/4ksj/main/app.js
定时规则：0
白名单：app.js
```

### 2. 依赖安装

在青龙面板的"依赖管理"中添加：
```bash
# 依赖管理 -> NodeJs -> 添加依赖
axios@0.26.0
cheerio@1.0.0-rc.10
iconv-lite@0.6.3
```

### 3. 环境变量设置

在青龙面板"环境变量"页面添加：

- 单账号配置：
  - 名称：`SJCOOKIE`
  - 值：4K世界的Cookie
  - 备注：登录凭证

- 多账号配置：
  - 账号1：`SJCOOKIE`
  - 账号2：`SJCOOKIE2`
  - 账号3：`SJCOOKIE3`
  - 以此类推...

- 可选配置：
  - `DEBUG`：调试模式（true/false）

### 4. 获取Cookie方法

推荐使用浏览器插件获取Cookie：
1. 安装 [Header Cookie Quick Manager](https://chromewebstore.google.com/detail/header-cookie-qrcode-case/echlhpliefhchnkmiomfpdnehakfmpfl)
2. 登录 [4K世界](https://www.4ksj.com/)
3. 点击插件图标，勾选"cookie列表"
4. 点击"cookie列表"，然后点击"copy all"
5. 将复制的内容填入青龙面板的SJCOOKIE变量中
6. 如需配置多账号，重复以上步骤，使用不同账号登录获取Cookie

### 5. 定时任务设置

添加定时任务：
1. 名称：4K世界签到
2. 命令：task 4ksj.js
3. 定时规则建议：30 0 * * *（每天0点30分执行）

### 6. 通知设置

在青龙面板的"通知设置"中配置推送通知方式，支持多种推送渠道：
- Bark
- Telegram
- 钉钉
- 企业微信
- Server酱
- PushPlus
- ...等

## 常见问题

1. Cookie失效问题：
   - Cookie有效期通常为30天
   - 脚本会自动更新Cookie中的时间戳
   - 如遇到失效请重新获取Cookie

2. 通知问题：
   - 请在青龙面板的"通知设置"中配置推送渠道
   - 可同时配置多个推送渠道
   - DEBUG=true 可查看详细日志

3. 多账号问题：
   - 支持无限个账号
   - 账号之间会自动添加延迟，避免请求过快
   - 每个账号的签到结果会单独推送通知

## 更新记录

- 2025/01/22：适配青龙面板，添加多账号支持
- 2024/11/15：修复4ksj cookie失效问题

## 声明

- 本项目仅供学习交流使用
- 使用本项目产生的一切后果由使用者自行承担

## 项目地址

https://github.com/mahaoxiong/4ksj


