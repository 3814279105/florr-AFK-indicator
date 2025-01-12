# florr-AFK-indicator
A script that detects AFK Check Buttons on florr.io. Also provides a solution to run scripts while the webpage is minimized.
It will notify you through system notification when an AFK Check Button is detected.
May be unable to work well on some computers (especially laptops) until OCR algorithm is improved.

# usage
1. install Tampermonkey in your Browser (optional);
2. Convert a picture of AFK Check button to a link. You can use Data URI Scheme. [Tool](https://www.base64-image.de/).
3. Use the copied link to replace the link in the original javaScript file.
4. Paste revised script into Tampermonkey or debug console.
5. Make sure that the notification permission of florr.io is "granted".
6. Press Alt+P to start and stop the script.
