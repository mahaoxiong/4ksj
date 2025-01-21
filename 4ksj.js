// 4ksj 签到脚本
// 定时任务：0 0,6 * * *

const $ = new Env('4ksj签到');
// 使用青龙的通知
const notify = $.isNode() ? require('./sendNotify') : '';

// 配置参数
let sjCookie = ($.isNode() ? process.env.SJCOOKIE : $.getdata('SJCOOKIE')) || "";
let pushPlusToken = ($.isNode() ? process.env.PPTOKEN : $.getdata('PPTOKEN')) || "";
let pushDeerKey = ($.isNode() ? process.env.PDKEY : $.getdata('PDKEY')) || "";
let serverKey = ($.isNode() ? process.env.SCKEY : $.getdata('SCKEY')) || "";
let barkKey = ($.isNode() ? process.env.BARKKEY : $.getdata('BARKKEY')) || "";
let barkServer = ($.isNode() ? process.env.BARKSERVER : $.getdata('BARKSERVER')) || "";
let telegramToken = ($.isNode() ? process.env.TELEGRAM_TOKEN : $.getdata('TELEGRAM_TOKEN')) || "";
let telegramId = ($.isNode() ? process.env.TELEGRAM_ID : $.getdata('TELEGRAM_ID')) || "";

const axios = require('axios');
const qs = require('qs');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

// 更新cookie中的时间戳
function updateCookieLogoutTimePlusOneDay(cookieStr) {
    const oneDayInSeconds = 24 * 60 * 60;
    const timestampPlusOneDay = Math.floor(Date.now() / 1000) + oneDayInSeconds;
    return cookieStr.replace(/(will_timelogout_\d+=)\d+/, `$1${timestampPlusOneDay}`);
}

// 网站配置
const SJUrl = "https://www.4ksj.com/";
const SJUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0";

// 请求头配置
const SJHeaders = {
    cookie: updateCookieLogoutTimePlusOneDay(sjCookie),
    "User-Agent": SJUserAgent,
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
};

class HostInfo {
    constructor(name, url, header) {
        this.name = name;
        this.url = url;
        this.header = header;
        this.status = false;
        this.formHash = '';
        this.message = '';
    }
}

// 获取formhash
async function getFormHashSJ(host) {
    try {
        const response = await axios.get(host.url + 'qiandao.php', {
            headers: host.header,
            responseType: "arraybuffer"
        });
        
        const gb = iconv.decode(response.data, "utf-8");
        const $ = cheerio.load(gb);
        const userName = $('.nexmemberintels>h5').text().replace('\n', '');
        
        if (userName === '') {
            console.log("cookie失效！");
            host.status = false;
            host.message = "cookie失效！";
            return;
        }
        
        console.log(host.name, "获取用户信息成功！");
        host.formHash = $('#scbar_form input:nth-child(2)').val();
        host.status = true;
        await checkinSJ(host);
    } catch (error) {
        host.status = false;
        host.message = "获取formhash出错: " + error;
        console.log(host.name, error);
    }
}

// 执行签到
async function checkinSJ(host) {
    try {
        const checkInUrl = host.url + "qiandao.php?sign=" + host.formHash;
        const response = await axios.get(checkInUrl, {
            headers: host.header,
            responseType: "arraybuffer"
        });
        
        const GBK = iconv.decode(response.data, "GBK");
        const $ = cheerio.load(GBK);
        const msg = $('#messagetext>p').text();

        host.message = msg;
        host.status = true;
        await getCheckinInfoSJ(host);
    } catch (error) {
        console.log(host.name, "签到出错或超时" + error);
        host.status = false;
        host.message = "签到出错或超时" + error;
    }
}

// 获取签到信息
async function getCheckinInfoSJ(host) {
    try {
        const response = await axios.get(host.url + 'qiandao.php', {
            headers: host.header,
            responseType: "arraybuffer"
        });
        
        const gb = iconv.decode(response.data, "GBK");
        const $ = cheerio.load(gb);
        
        let month = $('#wp > .ct2 > .sd div:nth-child(2) .xl1 li:nth-child(2):eq(0)').text();
        let ctu = $('#wp > .ct2 > .sd div:nth-child(2) .xl1 li:nth-child(3):eq(0)').text();
        let total = $('#wp > .ct2 > .sd div:nth-child(2) .xl1 li:nth-child(4):eq(0)').text();
        let totalPrice = $('#wp > .ct2 > .sd div:nth-child(2) .xl1 li:nth-child(5):eq(0)').text();
        let price = $('#wp > .ct2 > .sd div:nth-child(2) .xl1 li:nth-child(6):eq(0)').text();
        
        let info = month +'; '+ ctu +'; '+ total +'; '+ totalPrice +'; '+ price;
        host.message = host.message + info;
    } catch (error) {
        host.message = "获取签到信息出错！" + error;
        console.log(host.name, "获取签到信息出错！" + error);
    }
}

// 推送消息
async function pushNotice(status, message) {
    console.log(status, message);
    if ($.isNode()) {
        await notify.sendNotify($.name, `${status}\n${message}`);
    }
}

// 主函数
async function start() {
    if (!sjCookie) {
        console.log('未设置cookie，请先获取cookie！');
        await pushNotice('❌错误', '请先获取Cookie!');
        return;
    }

    let sj = new HostInfo("4K视界", SJUrl, SJHeaders);
    await getFormHashSJ(sj);
    
    let status = sj.name + ": " + (sj.status ? "签到成功！" : "签到失败！");
    let message = "* " + sj.name + ": " + sj.message;
    
    await pushNotice(status, message);
}

// 环境变量检查
!(async () => {
    if (!sjCookie) {
        console.log('未设置cookie，请先获取cookie！');
        await pushNotice('❌错误', '请先获取Cookie!');
        return;
    }
    console.log('开始执行签到任务...');
    await start();
})()
    .catch((e) => {
        $.logErr(e);
        pushNotice('❌错误', '脚本执行异常：' + e.message);
    })
    .finally(() => $.done());

// 青龙面板环境变量类
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)} 