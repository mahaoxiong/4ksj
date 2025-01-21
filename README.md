# 4K视界自动签到脚本 (青龙面版)

## 功能说明

1. 自动登录并签到4ksj.com
2. 支持多种推送方式：
   - Push Plus推送
   - PushDeer推送
   - Server酱推送
   - Bark推送
   - Telegram推送

## 使用方法

### 1. 安装脚本

1. 在青龙面板中添加以下订阅：
```
ql repo https://github.com/mahaoxiong/4ksj.git "4ksj" "" "sendNotify"
```

### 2. 获取Cookie

1. 使用Chrome浏览器安装Cookie获取插件：

https://chromewebstore.google.com/detail/header-cookie-qrcode-case/echlhpliefhchnkmiomfpdnehakfmpfl


2. 登录4ksj.com后使用插件获取Cookie
   - 勾选"cookie列表"
   - 点击"cookie列表"
   - 点击"copy all"复制Cookie

### 3. 配置环境变量

在青龙面板中添加以下环境变量：

- SJCOOKIE (必填)：4K视界的Cookie
- PPTOKEN (可选)：Push Plus的token
- PDKEY (可选)：PushDeer的key
- SCKEY (可选)：Server酱的SCKEY
- BARKKEY (可选)：Bark的推送key
- BARKSERVER (可选)：自定义Bark服务器地址
- TELEGRAM_TOKEN (可选)：Telegram机器人的Token
- TELEGRAM_ID (可选)：Telegram的chat ID

### 4. 配置定时任务

默认定时规则：`0 0,6 * * *`（每天0点和6点执行）

可以在青龙面板的定时任务中修改运行时间。

## 注意事项

1. Cookie有效期问题：
   - 脚本会自动更新Cookie中的时间戳
   - 如果遇到Cookie失效，需要重新获取并更新

2. 推送通知：
   - 支持多种推送方式，可以同时使用多个推送
   - 每个推送方式都是可选的，不设置则不会推送

3. 错误处理：
   - 脚本会自动处理各种错误情况
   - 出错时会通过推送通知发送错误信息

## 更新日志

- 2025/01/21：首次发布青龙面板版本
