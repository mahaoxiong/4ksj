const axios = require('axios');
const qs = require('qs');

// 通知环境变量
let QYWX_AM = '';
let QYWX_KEY = '';
let DD_BOT_TOKEN = '';
let DD_BOT_SECRET = '';
let BARK_PUSH = '';
let BARK_SOUND = '';
let BARK_GROUP = '';
let TG_BOT_TOKEN = '';
let TG_USER_ID = '';
let TG_PROXY_HOST = '';
let TG_PROXY_PORT = '';
let TG_PROXY_AUTH = '';
let TG_API_HOST = 'api.telegram.org';
let PUSH_KEY = '';
let PUSH_PLUS_TOKEN = '';
let PUSH_PLUS_USER = '';
let IGOT_PUSH_KEY = '';
let GOBOT_URL = '';
let GOBOT_QQ = '';
let GOBOT_TOKEN = '';

// 导入青龙通知
let notify;
try {
    notify = require('/ql/data/scripts/sendNotify.js');
} catch (err) {
    notify = require('./sendNotify.js');
}

// 发送通知
async function sendNotify(text, desp) {
    try {
        await notify.sendNotify(text, desp);
    } catch (err) {
        console.log('发送通知失败：', err);
    }
}

module.exports = {
    sendNotify
}; 