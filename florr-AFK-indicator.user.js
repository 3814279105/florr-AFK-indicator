// ==UserScript==
// @name            florr-AFK-indicator
// @namespace       http://tampermonkey.net/
// @version         1.0.3
// @description     AFK Check Auto-detecter for Florr.io
// @author          https://github.com/3814279105/
// @match           https://florr.io
// @icon            https://florr.io/favicon.ico
// @grant           none
// ==/UserScript==

Notification.requestPermission() // 请求通知权限
let isRunning = false; //记录是否正在运行
let timeoutId_main; //记录主函数的timeout id，便于停止脚本。web worker触发的setTimeOut不受网页状态（如最小化）限制，所以可以直接调用。

// 利用web worker精准计时
const timerBlob = new Blob([`
self.onmessage = function(e) {
    const { action, delay, id } = e.data;
    if (action === 'start') {
        const cb = () => self.postMessage(id);
        setTimeout(cb, delay);
    }
};
`], { type: 'application/javascript' });
const timer = new Worker(URL.createObjectURL(timerBlob));
const callbacks = new Map();
timer.onmessage = function (e) {
    const callback = callbacks.get(e.data);
    callback();
};

// 精准版本的setTimeOut函数，不受网页状态（如最小化）限制，不过没有提供取消方法
function preciseTimeout(callback, delay, id) {
    callbacks.set(id, callback);
    timer.postMessage({ action: 'start', delay, id });
}

// 弹窗生成函数
function showPopup(message) {
    // 如果不存在弹窗元素，则创建新的
    let popup = document.getElementById('custom-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'custom-popup';
        Object.assign(popup.style, {
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // 半透明背景
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            zIndex: '32767',
            fontSize: '16px',
            textAlign: 'center',
            opacity: '1',
            transition: 'opacity 2s', // 设置淡出动画
            pointerEvents: 'none', // 允许点击穿透
        });
        document.body.appendChild(popup);
    }
    // 更新弹窗内容和样式
    popup.innerText = message;
    popup.style.opacity = '1'; // 重置透明度
    // 3秒后开始淡出
    preciseTimeout(() => {
        popup.style.opacity = '0';
    }, 3000, 'popup');
    // 动画结束后移除元素
    popup.addEventListener('transitionend', () => {
        if (popup.style.opacity === '0') {
            popup.remove();
        }
    });
}

// 主程序
function mainLoop() {
    // 捕捉canvas
    const pageCanvas = document.createElement('canvas');
    const pageContext = pageCanvas.getContext('2d');
    pageCanvas.width = document.getElementById('canvas').width;
    pageCanvas.height = document.getElementById('canvas').height;
    pageContext.drawImage(document.getElementById('canvas'), 0, 0);
    const pageImageData = pageCanvas.toDataURL('image/png')
    // 传入web worker
    worker.postMessage({
        pageImageData,
    });
}

//使用Tesseract进行OCR文字识别
const workerBlob = new Blob([`
importScripts('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
self.onmessage = function (e) {
    console.log("Worker starts.");
    const {
        pageImageData
    } = e.data;
    try {
        // 初始化 Tesseract
        const { createWorker } = Tesseract;
        (async () => {
            const worker = await createWorker('eng');
            // 进行 OCR 识别
            const { data: { text } } = await worker.recognize(pageImageData);
            // 将结果发送回主线程
            self.postMessage({ status: 'success', text });
            await worker.terminate()
        })();
      } catch (error) {
        // 如果出错，发送错误信息
        self.postMessage({ status: 'error', error: error.message });
      }
}
`], { type: 'application/javascript' });

//利用web worker创建独立线程，防止识别时游戏卡顿
const worker = new Worker(URL.createObjectURL(workerBlob));
worker.onmessage = function (e) {
    const { status, text, error } = e.data;
    if (status == 'success') {
        if (text.includes("AFK")) {
            console.log('AFK Check detected!');
            if (Notification.permission === "granted") {
                new Notification("Florr.io anti-AFK", {
                    body: 'AFK Check detected',
                    icon: "https://florr.io/favicon.ico",
                }); // 发送系统通知
            }
        } else {
            console.log('AFK Check not detected.');
        }
        console.group()
        console.log('TEXT:' + text)
        console.groupEnd()
    } else {
        console.warn("An error occured in OCR: " + error)
    }
    if (isRunning) {
        timeoutId_main = setTimeout(mainLoop, 5000); // 指定间隔后执行下一次扫描（此处为5秒）
    }
};

// 监听Alt+P启停脚本
window.addEventListener('keydown', function (event) {
    if (event.altKey && event.key === 'p') {
        isRunning = !isRunning;
        const info = isRunning ? 'Script started' : 'Script stopped'
        console.log(info);
        showPopup(info);
        if (isRunning) {
            mainLoop(); // 本行用于启动脚本
        } else {
            clearTimeout(timeoutId_main); // 本行用于停止脚本
        }
    }
});

// 覆写RequestAnimationFrame函数，使游戏在后台也能继续渲染
const originalRequestAnimationFrame = window.requestAnimationFrame;
window.requestAnimationFrame = function (callback) {
    if (isRunning) { // 仅在脚本启动是锁定帧生成间隔，避免影响正常游戏
        preciseTimeout(() => { callback(performance.now()); }, 15, 'frame'); // 帧生成间隔为15毫秒
    } else {
        originalRequestAnimationFrame(callback);
    }
}

console.log('Script loaded successfully');
