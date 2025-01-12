// ==UserScript==
// @name            florr-AFK-indicator
// @namespace       http://tampermonkey.net/
// @version         1.01
// @description     AFK Check Auto-detecter for Florr.io
// @author          3814279105
// @match           https://florr.io
// @icon            https://florr.io/favicon.ico
// @grant           none
// ==/UserScript==

(function () {

    Notification.requestPermission()
    const i = {
        frame: 15,
        scan: 5000,
    };
    let isRunning = false;
    let timeoutId_main;
    const referenceImage = new Image();
    referenceImage.src = "data:image/png;base64,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";
    // Change the link on the previous line to your reference image. One is enough。
    
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
    function preciseTimeout(callback, delay, id) {
        callbacks.set(id, callback);
        timer.postMessage({ action: 'start', delay, id });
    }

    timer.onmessage = function (e) {
        const callback = callbacks.get(e.data);
        callback();
    };

    function mainLoop() {

        const pageCanvas = document.createElement('canvas');
        const pageContext = pageCanvas.getContext('2d');
        pageCanvas.width = document.getElementById('canvas').width;
        pageCanvas.height = document.getElementById('canvas').height;
        pageContext.drawImage(document.getElementById('canvas'), 0, 0);
        const pageImageData = pageContext.getImageData(0, 0, pageCanvas.width, pageCanvas.height).data;

        const referenceCanvas = document.createElement('canvas');
        const referenceContext = referenceCanvas.getContext('2d');
        referenceCanvas.width = referenceImage.width;
        referenceCanvas.height = referenceImage.height;
        referenceContext.drawImage(referenceImage, 0, 0);
        const referenceImageData = referenceContext.getImageData(0, 0, referenceCanvas.width, referenceCanvas.height).data;

        worker.postMessage({
            pageImageData,
            pageCanvasWidth: pageCanvas.width,
            pageCanvasHeight: pageCanvas.height,
            referenceImageData,
            referenceCanvasWidth: referenceCanvas.width,
            referenceCanvasHeight: referenceCanvas.height,
        });
    }

    const workerBlob = new Blob([`
    const afkColors = {
    common: { r: 126, g: 239, b: 109 },
    unusual: { r: 255, g: 230, b: 93 },
    rare: { r: 77, g: 82, b: 227 },
    epic: { r: 134, g: 31, b: 222 },
    legendary: { r: 222, g: 31, b: 31 },
    mythic: { r: 31, g: 219, b: 222 },
    ultra: { r: 255, g: 43, b: 117 },
    super: { r: 43, g: 255, b: 163 },
    unique: { r: 85, g: 85, b: 85 }
    };
    const white = { r: 255, g: 255, b: 255 };

    const t = {
        page_binary: 30,
        ref_binary: 1,
        white_gen: 1,
        white_comp: 45,
    }

    function colorDifference(color1, color2) {
        const rDiff = Math.abs(color1.r - color2.r);
        const gDiff = Math.abs(color1.g - color2.g);
        const bDiff = Math.abs(color1.b - color2.b);
        return rDiff + gDiff + bDiff;
    }

    function isAFKColor(color, tolerance) {
        for (const colorName in afkColors) {
            const diff = colorDifference(color, afkColors[colorName]);
            if (diff < tolerance) {
                return true;
            }
        }
        return false
    }

    function binary(data, tolerance) {
        let booleanArray = new Array();
        for (let i = 0; i < data.length; i += 4) {
            const color = { r: data[i], g: data[i + 1], b: data[i + 2] }
            booleanArray.push(isAFKColor(color, tolerance))
        }
        return booleanArray
    }

    function whiteCheck(offset, whitepoints, pid, pw, tolerance) {
        for (let a = 0; a < whitepoints.length; a++) {
            const i = (offset + whitepoints[a].y * pw + whitepoints[a].x) * 4
            const color = { r: pid[i], g: pid[i + 1], b: pid[i + 2] }
            if (colorDifference(color, white) > tolerance) {
                return false
            }
        }
        return true
    }

    function isMatch(offset, rbd, rh, rw, pbd, pw) {
        for (let y = 0; y < rh; y++) {
            for (let x = 0; x < rw; x++) {
                const pIndex = offset + y * pw + x;
                const rIndex = y * rw + x;
                if (rbd[rIndex] && !pbd[pIndex]) {
                    return false
                }
            }
        }
        return true;
    }

    self.onmessage = function (e) {
    console.log("Worker start");
    const {
        pageImageData, pageCanvasWidth, pageCanvasHeight,
        referenceImageData, referenceCanvasWidth, referenceCanvasHeight,
    } = e.data;

    const pageBinaryData = binary(pageImageData, t.page_binary);
    const referenceBinaryData = binary(referenceImageData, t.ref_binary);

    let whitePoints = []
    for (let y = 0; y < referenceCanvasHeight; y++) {
        for (let x = 0; x < referenceCanvasWidth; x++) {
            const i = (y * referenceCanvasWidth + x) * 4;
            const color = { r: referenceImageData[i], g: referenceImageData[i + 1], b: referenceImageData[i + 2] }
            if (colorDifference(color, white) < t.white_gen) {
                whitePoints.push({ x: x, y: y })
            }
        }
    }

    let fp = 0
    for (let y = 0; y < pageCanvasHeight - referenceCanvasHeight; y++) {
        for (let x = 0; x < pageCanvasWidth - referenceCanvasWidth; x++) {
            const index = y * pageCanvasWidth + x;
            if (pageBinaryData[index]) {
                fp++;
                if (!whiteCheck(index, whitePoints, pageImageData, pageCanvasWidth, t.white_comp)) {
                    continue;
                }
                if (!isMatch(index, referenceBinaryData, referenceCanvasHeight, referenceCanvasWidth, pageBinaryData, pageCanvasWidth)) {
                    continue;
                }
                const xcord = x + referenceCanvasWidth / 2
                const ycord = y + referenceCanvasHeight / 2
                postMessage({ matchFound: true, xcord, ycord });
                return;
            }
        }
    }
    postMessage({ matchFound: false, fp });
    }`], { type: 'application/javascript' });

    const worker = new Worker(URL.createObjectURL(workerBlob));

    worker.onmessage = function (e) {
        const { matchFound, xcord, ycord, fp } = e.data;
        if (matchFound) {
            console.log('AFK Check detected at:(' + xcord + ',' + ycord + ')');
            if (Notification.permission === "granted") {
                const notification = new Notification("Florr.io anti-AFK", {
                    body: 'AFK Check at: (' + xcord + ',' + ycord + ')',
                    icon: "https://florr.io/favicon.ico",
                });
            }
        } else {
            console.log('AFK Check not detected. Featured pixels count: ' + fp);
        }
        if (isRunning) {
            timeoutId_main = setTimeout(mainLoop, i.scan);
        }
    };

    referenceImage.onload = function () {
        window.addEventListener('keydown', function (event) {
            if (event.altKey && event.key === 'p') {
                isRunning = !isRunning;
                const info = isRunning ? 'Script started' : 'Script stopped'
                console.log(info);
                if (isRunning) {
                    mainLoop();
                } else {
                    clearTimeout(timeoutId_main);
                }
            }
        });
        const originalRequestAnimationFrame = window.requestAnimationFrame;
        window.requestAnimationFrame = function (callback) {
            if (isRunning) {
                preciseTimeout(() => { callback(performance.now()); }, i.frame, 'frame');
            } else {
                originalRequestAnimationFrame(callback);
            }
        }
        console.log('Script loaded successfully');
    }
})();
