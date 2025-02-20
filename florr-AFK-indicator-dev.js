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

// 主程序
function mainLoop() {
    // 捕捉canvas
    const pageCanvas = document.createElement('canvas');
    const pageContext = pageCanvas.getContext('2d');
    pageCanvas.width = document.getElementById('canvas').width;
    pageCanvas.height = document.getElementById('canvas').height;
    pageContext.drawImage(document.getElementById('canvas'), 0, 0);
    const pageImageData = pageContext.getImageData(0, 0, pageCanvas.width, pageCanvas.height).data;
    // 传入web worker
    worker.postMessage({
        pageImageData,
        pageCanvasWidth: pageCanvas.width,
        pageCanvasHeight: pageCanvas.height,
    });
}

// 此处你需要在workerBlob里补全识别算法
// pageImageData, pageCanvasWidth, pageCanvasHeight为传入的参数
// 识别到AFK Check则将matchFound:设为true
const workerBlob = new Blob([`
self.onmessage = function (e) {
    console.log("Worker starts.");
    const {
        pageImageData, pageCanvasWidth, pageCanvasHeight,
    } = e.data;

    // 遍历pageImageData的示例
    for (let y = 0; y < pageCanvasHeight; y++) {
        for (let x = 0; x < pageCanvasWidth; x++) {
            const index = (y * pageCanvasWidth + x)*4;
            const pixelColor = {r: pageImageData[index], g: pageImageData[index + 1], b: pageImageData[index + 2]};
        }
    }

    postMessage({ matchFound: false });
}`], { type: 'application/javascript' });

//利用web worker创建独立线程，防止识别时游戏卡顿
const worker = new Worker(URL.createObjectURL(workerBlob));
worker.onmessage = function (e) {
    const {matchFound} = e.data;
    if (matchFound) { // 如果检测到AFK Check
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
