const axios = require('axios');
const qs = require('qs');

// Push Plus
async function pushPlusNotify(text, desp) {
    if (!process.env.PPTOKEN) return;
    try {
        const url = 'http://www.pushplus.plus/send';
        const data = {
            token: process.env.PPTOKEN,
            title: text,
            content: desp
        };
        await axios.post(url, data);
    } catch (error) {
        console.log('Push Plus发送通知调用API失败！', error);
    }
}

// PushDeer
async function pushDeerNotify(text, desp) {
    if (!process.env.PDKEY) return;
    try {
        const url = 'https://api2.pushdeer.com/message/push';
        const data = {
            pushkey: process.env.PDKEY,
            text: text,
            desp: desp,
            type: 'text'
        };
        await axios.post(url, data);
    } catch (error) {
        console.log('PushDeer发送通知调用API失败！', error);
    }
}

// Server酱
async function serverJNotify(text, desp) {
    if (!process.env.SCKEY) return;
    try {
        const url = `https://sctapi.ftqq.com/${process.env.SCKEY}.send`;
        const data = {
            text: text,
            desp: desp
        };
        await axios.post(url, qs.stringify(data));
    } catch (error) {
        console.log('Server酱发送通知调用API失败！', error);
    }
}

// Bark
async function barkNotify(text, desp) {
    if (!process.env.BARKKEY) return;
    try {
        const barkServer = process.env.BARKSERVER || 'https://api.day.app';
        const url = `${barkServer}/${process.env.BARKKEY}/${encodeURIComponent(text)}/${encodeURIComponent(desp)}`;
        await axios.get(url);
    } catch (error) {
        console.log('Bark发送通知调用API失败！', error);
    }
}

// Telegram
async function telegramNotify(text, desp) {
    if (!process.env.TELEGRAM_TOKEN || !process.env.TELEGRAM_ID) return;
    try {
        const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;
        const data = {
            chat_id: process.env.TELEGRAM_ID,
            text: `${text}\n\n${desp}`,
            parse_mode: 'HTML'
        };
        await axios.post(url, data);
    } catch (error) {
        console.log('Telegram发送通知调用API失败！', error);
    }
}

async function sendNotify(text, desp) {
    await Promise.all([
        pushPlusNotify(text, desp),
        pushDeerNotify(text, desp),
        serverJNotify(text, desp),
        barkNotify(text, desp),
        telegramNotify(text, desp)
    ]);
}

module.exports = {
    sendNotify
}; 