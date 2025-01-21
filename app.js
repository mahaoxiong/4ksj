// 4K世界自动签到 for 青龙面板
// 频道：https://www.4ksj.com/
// 配置文件：config.sh

const axios = require('axios');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const dns = require('dns');
const notify = require('./sendNotify');

// 设置DNS服务器
dns.setServers([
    '223.5.5.5',  // 阿里DNS
    '119.29.29.29', // 腾讯DNS
    '8.8.8.8',    // Google DNS
    '1.1.1.1'     // Cloudflare DNS
]);

// 是否开启DEBUG模式
const DEBUG = process.env["DEBUG"] === 'true';

// 站点配置
const SITE_CONFIG = {
    name: "4K世界",
    url: "https://www.4ksj.com/",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0"
};

// axios配置
axios.defaults.timeout = 10000; // 10秒超时
axios.defaults.retry = 3; // 重试次数
axios.defaults.retryDelay = 3000; // 重试延迟

// 获取所有Cookie
function getAllCookies() {
    const cookies = [];
    // 获取SJCOOKIE环境变量
    const mainCookie = process.env["SJCOOKIE"];
    if (mainCookie) cookies.push(mainCookie);
    
    // 获取SJCOOKIE2、SJCOOKIE3等环境变量
    let i = 2;
    while (true) {
        const cookieKey = `SJCOOKIE${i}`;
        const cookie = process.env[cookieKey];
        if (!cookie) break;
        cookies.push(cookie);
        i++;
    }
    return cookies;
}

// 添加请求重试拦截器
axios.interceptors.response.use(undefined, async function axiosRetryInterceptor(err) {
    const config = err.config;
    if(!config || !config.retry) return Promise.reject(err);
    
    config.__retryCount = config.__retryCount || 0;
    
    if(config.__retryCount >= config.retry) {
        return Promise.reject(err);
    }
    
    config.__retryCount += 1;
    console.log(`请求重试 ${config.__retryCount}/${config.retry}`);
    
    const backoff = new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, config.retryDelay || 1);
    });
    
    await backoff;
    return axios(config);
});

// 更新 cookie 中 will_timelogout_XXXXXX 的值为当前时间戳加一天
function updateCookieLogoutTimePlusOneDay(cookieStr) {
    const oneDayInSeconds = 24 * 60 * 60;
    const timestampPlusOneDay = Math.floor(Date.now() / 1000) + oneDayInSeconds;
    return cookieStr.replace(/(will_timelogout_\d+=)\d+/, `$1${timestampPlusOneDay}`);
}

class HostInfo {
    name;
    url;
    header;
    status;
    formHash;
    message;
    userName;

    constructor(name, url, header) {
        this.name = name;
        this.url = url;
        this.header = header;
    }
}

async function getFormHashSJ(host) {
    let headers = host.header;
    await axios
        .get(host.url + 'qiandao.php', {
            headers,
            responseType: "arraybuffer",
        })
        .then(async (response) => {
            const gb = iconv.decode(response.data, "utf-8");
            const $ = cheerio.load(gb);
            let formHash = '';
            const userName = $('.nexmemberintels>h5').text().replace('\n', '');
            
            if (userName === '') {
                console.log("[Error] Cookie已失效，请重新获取");
                host.status = false;
                host.message = "Cookie已失效，请重新获取";
            } else {
                console.log("[Info] 用户：" + userName);
                formHash = $('#scbar_form input:nth-child(2)').val();
                host.status = true;
                host.formHash = formHash;
                host.userName = userName;
                await checkinSJ(host);
            }
        })
        .catch((error) => {
            host.status = false;
            host.message = `获取登录信息失败：${error.message}`;
            console.log("[Error] 获取登录信息失败：", error.message);
        });
}

async function checkinSJ(host) {
    const checkInUrl = host.url + "qiandao.php?sign=" + host.formHash;
    let headers = host.header;
    await axios
        .get(checkInUrl, {
            headers,
            responseType: "arraybuffer",
        })
        .then(async (response) => {
            const GBK = iconv.decode(response.data, "GBK");
            const $ = cheerio.load(GBK);
            const msg = $('#messagetext>p').text()

            host.message = msg;
            host.status = true;
            console.log("[Info] 签到结果：" + msg);
            await getCheckinInfoSJ(host);
        })
        .catch((error) => {
            console.log("[Error] 签到失败：", error.message);
            host.status = false;
            host.message = `签到失败：${error.message}`;
        });
}

async function getCheckinInfoSJ(host) {
    let headers = host.header;
    await axios
        .get(host.url + 'qiandao.php', {
            headers,
            responseType: "arraybuffer",
        })
        .then((response) => {
            const gb = iconv.decode(response.data, "GBK");
            const $ = cheerio.load(gb);
            
            // 获取签到统计信息
            const stats = {
                month: $('#wp > .ct2 > .sd div:nth-child(2) .xl1 li:nth-child(2):eq(0)').text(),
                continuous: $('#wp > .ct2 > .sd div:nth-child(2) .xl1 li:nth-child(3):eq(0)').text(),
                total: $('#wp > .ct2 > .sd div:nth-child(2) .xl1 li:nth-child(4):eq(0)').text(),
                totalReward: $('#wp > .ct2 > .sd div:nth-child(2) .xl1 li:nth-child(5):eq(0)').text(),
                lastReward: $('#wp > .ct2 > .sd div:nth-child(2) .xl1 li:nth-child(6):eq(0)').text()
            };

            // 控制台日志
            console.log("[Info] 签到统计：");
            console.log(stats.month);
            console.log(stats.continuous);
            console.log(stats.total);
            console.log(stats.totalReward);
            console.log(stats.lastReward);

            // 通知消息格式
            host.message = [
                host.message,
                '',
                stats.month,
                '',
                stats.continuous,
                '',
                stats.total,
                '',
                stats.totalReward,
                '',
                stats.lastReward
            ].join('\n');
        })
        .catch((error) => {
            console.log("[Error] 获取签到统计失败：", error.message);
            host.message = [
                host.message,
                '',
                '获取签到统计失败：' + error.message
            ].join('\n');
        });
}

// 主函数
async function main() {
    try {
        const cookies = getAllCookies();
        if (cookies.length === 0) {
            console.log("[Error] 请先配置至少一个4K世界Cookie");
            await notify.sendNotify("4K世界签到失败", "请先配置Cookie");
            return;
        }

        console.log("4K世界自动签到开始运行");
        console.log("--------------------");
        console.log(`共检测到 ${cookies.length} 个账号`);

        // 逐个账号执行签到
        for (let i = 0; i < cookies.length; i++) {
            console.log(`\n开始签到第 ${i + 1} 个账号`);
            console.log("--------------------");

            // 更新cookie中的时间戳
            const currentCookie = updateCookieLogoutTimePlusOneDay(cookies[i]);

            // 创建站点实例
            const site = new HostInfo(
                SITE_CONFIG.name,
                SITE_CONFIG.url,
                {
                    cookie: currentCookie,
                    "User-Agent": SITE_CONFIG.userAgent,
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
                }
            );

            // 执行签到流程
            await getFormHashSJ(site);

            // 发送通知
            const title = `${site.name}用户${site.userName} ${site.status ? '签到成功' : '签到失败'}`;
            await notify.sendNotify(title, site.message);

            // 账号之间添加延迟，避免请求过快
            if (i < cookies.length - 1) {
                console.log("等待3秒处理下一个账号...");
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        console.log("\n--------------------");
        console.log("所有账号处理完成");

    } catch (error) {
        console.log("[Error] 运行出错:", error.message);
        await notify.sendNotify("4K世界签到失败", "运行出错: " + error.message);
    }
}

// 启动程序
main().catch(async (error) => {
    console.log("[Error] 程序异常:", error.message);
    await notify.sendNotify("4K世界签到失败", "程序异常: " + error.message);
});