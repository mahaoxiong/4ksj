# 4K世界自动签到 For 青龙面板

## 功能说明

1. 支持4K世界网站的自动签到
2. 支持多账号签到
3. 使用青龙面板内置通知功能推送签到结果

## 使用教程

### 一、添加脚本

在青龙面板中添加订阅：
```bash
ql repo https://github.com/mahaoxiong/4ksj.git "4ksj_checkin.py" "" ""
```

### 二、安装依赖

在青龙面板的依赖管理中添加以下Python依赖：
```bash
requests
beautifulsoup4
```

### 三、配置环境变量

在青龙面板的环境变量管理中添加以下变量：

- SJCOOKIE1: 第1个账号的Cookie
- SJCOOKIE2: 第2个账号的Cookie
- SJCOOKIE3: 第3个账号的Cookie
- ... 以此类推

### 四、获取Cookie方法

推荐使用浏览器插件获取Cookie：
1. 安装 [Header Editor](https://chromewebstore.google.com/detail/header-cookie-qrcode-case/echlhpliefhchnkmiomfpdnehakfmpfl) 插件
2. 登录 [4K世界](https://www.4ksj.com/)
3. 点击插件图标，勾选"cookie列表"
4. 点击"cookie列表"，然后点击"copy all"
5. 将复制的内容添加到环境变量中

### 五、配置定时任务

在青龙面板的定时任务中添加以下任务：
```bash
4ksj_checkin.py
```

建议的定时规则：`30 0 * * *`（每天0点30分执行）

## 通知说明

脚本运行后会通过青龙面板的通知系统发送结果，通知内容包括：
- 签到状态（成功/失败/异常）
- 签到返回信息
- 本月打卡天数
- 连续打卡天数
- 累计打卡天数
- 累计奖励
- 最近奖励

## 注意事项

1. Cookie有效期问题：
   - 脚本会自动更新Cookie中的超时时间
   - 如果提示Cookie失效，请重新获取

2. 网络问题处理：
   - 脚本内置了请求重试机制
   - 签到请求最多重试3次
   - 通知发送最多重试3次

3. 运行日志：
   - 脚本运行时会实时输出详细日志
   - 可在青龙面板的日志页面查看

## 常见问题

1. 提示"Cookie已失效"
   - 重新获取Cookie并更新环境变量

2. 提示"无法获取form_hash"
   - 检查网络连接
   - 确认Cookie是否正确

3. 通知发送失败
   - 检查青龙面板的通知配置
   - 等待脚本自动重试

## 更新日志

- 2024.01.24：首次发布
  - 支持多账号
  - 添加重试机制
  - 优化日志输出


## 致谢

- [Alexecz/4ksj-checkin](https://github.com/Alexecz/4ksj-checkin): 原始项目


## 声明

* 本项目仅供学习交流使用
* 使用本项目产生的一切后果由使用者自行承担 