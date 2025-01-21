# 4K世界自动签到 For 青龙面板

## 功能说明

1. 支持4K世界网站的自动签到
2. 支持多账号签到
3. 使用青龙面板内置通知功能推送签到结果

## 青龙面板使用教程

### 1. 添加脚本
在青龙面板的"依赖管理"中添加脚本：
```bash
ql raw https://raw.githubusercontent.com/你的用户名/4ksj-checkin/main/app.js
```

### 2. 依赖安装

在青龙面板的"依赖管理"中添加：
```bash
cd /ql/data/scripts/你的路径
pnpm install axios@0.26.0 cheerio@1.0.0-rc.10 iconv-lite@0.6.3
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
2. 命令：ql raw app.js
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

- 2024/03/xx：适配青龙面板，添加多账号支持
- 2024/01/15：修复4ksj cookie失效问题

## 声明

- 本项目仅供学习交流使用
- 使用本项目产生的一切后果由使用者自行承担

# 4ksj-checkin

2024/11/15 修复4ksj cookie失效

#### 脚本功能：

1、通过Github Action自动定时运行 app.js 脚本。

2、通过cookies自动登录（[https://www.4ksj.com/](https://www.4ksj.com/))，脚本会自动进行签到。

3、可以通过"推送加" （[http://www.pushplus.plus](http://www.pushplus.plus))，自动发通知到微信上。

4、可以通过"PushDeer" （[http://www.pushdeer.com](http://www.pushdeer.com))，自动推送到手机上。 请使用**官方在线版**。 

5、可以通过"Server酱"（[https://sct.ftqq.com/](https://sct.ftqq.com/))，自动发通知到微信上。

6、可以通过"bark"（[https://github.com/Finb/Bark](https://github.com/Finb/Bark))，自动发通知到ios上。


#### 使用教程：

1. 先**"Fork"**本仓库。（不需要修改任何文件！）

2. 注册或登录4ksj后获取cookies。**（简单获取方法：用下面的浏览器插件直接获取）**。

### 建议提取 cookie 用该浏览器插件复制  把**cookie列表**先勾上 > 然后点击**cookie列表** > 直接点**copy all**  （自己复制的cookie会有问题！）

https://chromewebstore.google.com/detail/header-cookie-qrcode-case/echlhpliefhchnkmiomfpdnehakfmpfl

3. 在自己的仓库"Settings"里根据需要创建**"Secrets => Actions => New repository secret"**， （不开启通知，只需要创建一个SJCOOKIE即可）

   分别添加：
   - SJCOOKIE （**必填**； **填写4K世界的cookie**）
   - PPTOKEN （填写推送加的token, 不开启不用填）
   - PDKEY （填写PushDeer的key, 不开启不用填）
   - SCKEY （填写server酱sckey，不开启server酱则不用填）
   - BARKKEY (填写bark的key，不开启bark推送则不用填，默认使用官方服务器发送，如需自定义请通过BARKSERVER配置)
   - BARKSERVER (填写bark的服务器地址，不开启bark推送则不用填)
   - TELEGRAM_TOKEN（填写Telegram bot的Token）
   - TELEGRAM_ID (填写通过访问 https://api.telegram.org/bot<TELEGRAM_TOKEN>/getUpdates 获取的chat id)

4. 以上设置完毕后，每天0点和6点会自动触发，并会执行自动签到（**0点GitHub网络经常抽风**，故多增加一次执行,可自行改时间）。


