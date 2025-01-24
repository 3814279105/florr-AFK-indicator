# florr-AFK-indicator
~A script that detects AFK Check Buttons on florr.io.~ Due to some changes, the script is no longer effective.
This program provides a solution to run scripts while the webpage is minimized.
If you complete it's OCR algorithm, it will notify you through system notification when an AFK Check is detected.
~May be unable to work well on some computers (especially laptops) until OCR algorithm is improved.~

# usage of florr-AFK-indicator.user.js (outdated)
1. install Tampermonkey in your Browser (optional);
2. Convert a picture of AFK Check button to a link. You can use Data URI Scheme. [Tool](https://www.base64-image.de/).
3. Use the copied link to replace the link in the original javaScript file.
4. Paste revised script into Tampermonkey or debug console.
5. Make sure that the notification permission of florr.io is "granted".
6. Press Alt+P to start and stop the script.

# usage of florr-AFK-indicator-dev.js
Revise that file according to annotations so that you can use it to notify yourself when there's an AFK Check.
