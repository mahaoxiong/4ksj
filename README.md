# 4K视界自动签到脚本 (青龙面板版)

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
ql repo https://github.com/YOUR_REPOSITORY/4ksj.git "4ksj" "" "sendNotify"
```

### 2. 安装依赖

方法一：通过青龙面板命令行安装（推荐）

1. 进入青龙面板的"命令行"功能
2. 依次执行以下命令：
```bash
cd /ql/data/scripts/mahaoxiong_4ksj
npm init -y
npm install axios@0.26.0 cheerio@1.0.0-rc.10 iconv-lite@0.6.3 qs@6.10.3
```

方法二：通过青龙面板依赖管理安装

1. 进入青龙面板的"依赖管理"
2. 切换到"NodeJs"选项卡
3. 点击"添加依赖"按钮
4. 分别添加以下依赖（注意版本号）：
```
axios@0.26.0
cheerio@1.0.0-rc.10
iconv-lite@0.6.3
qs@6.10.3
```

### 3. 获取Cookie

1. 使用Chrome浏览器安装Cookie获取插件：
```
https://chromewebstore.google.com/detail/header-cookie-qrcode-case/echlhpliefhchnkmiomfpdnehakfmpfl
```

2. 登录4ksj.com后使用插件获取Cookie
   - 勾选"cookie列表"
   - 点击"cookie列表"
   - 点击"copy all"复制Cookie

### 4. 配置环境变量

在青龙面板中添加以下环境变量：

- SJCOOKIE (必填)：4K视界的Cookie
- PPTOKEN (可选)：Push Plus的token
- PDKEY (可选)：PushDeer的key
- SCKEY (可选)：Server酱的SCKEY
- BARKKEY (可选)：Bark的推送key
- BARKSERVER (可选)：自定义Bark服务器地址
- TELEGRAM_TOKEN (可选)：Telegram机器人的Token
- TELEGRAM_ID (可选)：Telegram的chat ID

### 5. 配置定时任务

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

4. 依赖问题：
   - 如果遇到模块找不到的错误，请尝试重新安装依赖
   - 建议使用命令行方式安装依赖，更加可靠
   - 如果依赖安装失败，可以尝试清除node_modules目录后重新安装

## 更新日志

- 2024/03/xx：首次发布青龙面板版本
- 2024/03/xx：适配青龙面板环境变量
- 2024/03/xx：优化消息推送模块
- 2024/03/xx：添加依赖安装说明
- 2024/03/xx：更新依赖安装方式 