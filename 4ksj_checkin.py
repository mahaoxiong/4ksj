#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
4K世界自动签到脚本 - 青龙面板版本
支持多账号签到，使用SJCOOKIE1、SJCOOKIE2、SJCOOKIE3...等环境变量
"""

import os
import time
import json
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_session():
    """创建带有重试机制的会话"""
    session = requests.Session()
    # 设置重试策略
    retry_strategy = Retry(
        total=5,  # 总重试次数
        backoff_factor=1,  # 重试间隔
        status_forcelist=[429, 500, 502, 503, 504],  # 需要重试的HTTP状态码
        allowed_methods=["GET", "POST"]  # 允许重试的请求方法
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

def print_log(message):
    """打印日志"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] {message}")

class CheckIn:
    def __init__(self, cookie, index=0):
        self.cookie = cookie
        self.index = index
        self.username = "未知用户"
        self.base_url = "https://www.4ksj.com/"
        self.headers = {
            'cookie': self.update_cookie_logout_time(),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
        }
        self.session = create_session()
        print_log(f"开始初始化...")
        
    def update_cookie_logout_time(self):
        """更新cookie中的超时时间"""
        one_day = 24 * 60 * 60
        new_timestamp = int(time.time()) + one_day
        return self.cookie.replace(
            'will_timelogout_', 
            f'will_timelogout_{new_timestamp}'
        )

    def make_request(self, url, method="get"):
        """统一的请求处理"""
        try:
            for i in range(3):  # 最多尝试3次
                try:
                    if method == "get":
                        response = self.session.get(url, headers=self.headers, timeout=10)
                    else:
                        response = self.session.post(url, headers=self.headers, timeout=10)
                    response.raise_for_status()
                    return response
                except requests.exceptions.RequestException as e:
                    if i == 2:  # 最后一次尝试也失败
                        raise e
                    print_log(f"请求失败，{i + 1}秒后重试: {str(e)}")
                    time.sleep(i + 1)
        except Exception as e:
            raise Exception(f"网络请求失败: {str(e)}")

    def get_form_hash(self):
        """获取form_hash值"""
        try:
            print_log("开始获取用户信息...")
            response = self.make_request(f"{self.base_url}qiandao.php")
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 检查登录状态
            username = soup.select_one('.nexmemberintels>h5')
            if not username or not username.text.strip():
                print_log("Cookie已失效")
                return None, "Cookie已失效"
            
            # 获取用户名
            self.username = username.text.strip()
            print_log(f"用户 [{self.username}] 获取信息成功")
                
            form_hash = soup.select_one('#scbar_form input:nth-child(2)')
            if not form_hash:
                print_log(f"用户 [{self.username}] 无法获取form_hash")
                return None, "无法获取form_hash"
            
            print_log(f"用户 [{self.username}] 成功获取form_hash")    
            return form_hash['value'], "获取form_hash成功"
        except Exception as e:
            error_msg = f"获取form_hash出错: {str(e)}"
            print_log(f"用户 [{self.username}] {error_msg}")
            return None, error_msg

    def do_checkin(self, form_hash):
        """执行签到"""
        try:
            print_log(f"用户 [{self.username}] 开始执行签到...")
            response = self.make_request(f"{self.base_url}qiandao.php?sign={form_hash}")
            
            soup = BeautifulSoup(response.text, 'html.parser')
            msg = soup.select_one('#messagetext>p')
            result = msg.text if msg else "签到成功"
            print_log(f"用户 [{self.username}] 签到结果: {result}")
            return True, result
        except Exception as e:
            error_msg = f"签到失败: {str(e)}"
            print_log(f"用户 [{self.username}] {error_msg}")
            return False, error_msg

    def get_checkin_info(self):
        """获取签到信息"""
        try:
            print_log(f"用户 [{self.username}] 开始获取签到信息...")
            response = self.make_request(f"{self.base_url}qiandao.php")
            
            soup = BeautifulSoup(response.text, 'html.parser')
            info_list = soup.select('#wp > .ct2 > .sd div:nth-child(2) .xl1 li')
            
            if len(info_list) >= 6:
                info = {
                    "本月打卡": info_list[1].text.strip(),
                    "连续打卡": info_list[2].text.strip(),
                    "累计打卡": info_list[3].text.strip(),
                    "累计奖励": info_list[4].text.strip(),
                    "最近奖励": info_list[5].text.strip()
                }
                print_log(f"用户 [{self.username}] 获取签到信息成功")
                return True, info
            print_log(f"用户 [{self.username}] 获取签到信息失败")
            return False, "获取签到信息失败"
        except Exception as e:
            error_msg = f"获取签到信息出错: {str(e)}"
            print_log(f"用户 [{self.username}] {error_msg}")
            return False, error_msg

def send_notify(title, content):
    """发送青龙面板通知"""
    max_retries = 3  # 最大重试次数
    retry_delay = 2  # 重试延迟（秒）
    
    for i in range(max_retries):
        try:
            print_log(f"开始发送通知: {title}")
            result = QLAPI.systemNotify({
                "title": title,
                "content": content
            })
            print_log(f"通知发送结果: {result}")
            return  # 发送成功，直接返回
        except Exception as e:
            if i < max_retries - 1:  # 如果不是最后一次尝试
                print_log(f"通知发送失败，{retry_delay}秒后重试: {str(e)}")
                time.sleep(retry_delay)
                retry_delay *= 2  # 增加重试延迟
            else:  # 最后一次尝试也失败
                print_log(f"发送通知失败: {str(e)}")

def process_account(cookie, index):
    """处理单个账号的签到"""
    try:
        checkin = CheckIn(cookie, index)
        
        # 获取form_hash
        form_hash, msg = checkin.get_form_hash()
        if not form_hash:
            result = f"{msg}"
            send_notify(f"4K世界-{checkin.username}-签到失败", result)
            return
            
        # 执行签到
        success, checkin_msg = checkin.do_checkin(form_hash)
        if not success:
            result = f"{checkin_msg}"
            send_notify(f"4K世界-{checkin.username}-签到失败", result)
            return
            
        # 获取签到信息
        success, info = checkin.get_checkin_info()
        if success:
            result = (
                f"{checkin_msg}\n"
                f"- {info['本月打卡']}\n"
                f"- {info['连续打卡']}\n"
                f"- {info['累计打卡']}\n"
                f"- {info['累计奖励']}\n"
                f"- {info['最近奖励']}"
            )
        else:
            result = f"签到结果：{checkin_msg}\n获取详情失败：{info}"
        
        send_notify(f"4K世界-{checkin.username}-签到成功", result)
            
    except Exception as e:
        result = f"签到异常：{str(e)}"
        send_notify(f"4K世界-{checkin.username}-签到异常", result)

def get_all_cookies():
    """获取所有账号的Cookie"""
    cookies = []
    index = 1
    
    while True:
        cookie = os.getenv(f'SJCOOKIE{index}')
        if not cookie:
            break
        cookies.append((cookie.strip(), index))
        index += 1
    
    return cookies

def main():
    print_log("脚本开始运行...")
    
    # 获取所有账号的Cookie
    cookie_list = get_all_cookies()
    
    if not cookie_list:
        print_log("未找到任何有效的SJCOOKIE配置")
        send_notify("4K世界签到失败", "未找到任何有效的SJCOOKIE配置")
        return
    
    print_log(f"共找到{len(cookie_list)}个账号配置")
    
    # 处理所有账号
    for cookie, index in cookie_list:
        process_account(cookie, index - 1)  # index-1 使显示的账号序号与环境变量序号一致
        time.sleep(2)  # 添加延迟，避免请求过快
    
    print_log("脚本运行完成")

if __name__ == "__main__":
    main() 