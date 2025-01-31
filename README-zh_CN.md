# florr-AFK-indicator
此程序包含一个脚本，用于检测 [florr.io](https://florr.io) 上的 AFK 检查按钮。当检测到 AFK 检查时，它会通过系统通知通知您。甚至可以在浏览器选项卡最小化或放入 [虚拟桌面](https://learn.microsoft.com/en-us/archive/blogs/uspartner_ts2team/windows-virtual-desktop) 时运行。
该程序还提供了网页最小化时在游戏 [florr.io](https://florr.io) 中运行检测脚本的解决方案。

#florr-AFK-indicator.user.js 的使用方法
1. 在浏览器中安装 [Tampermonkey](https://www.tampermonkey.net/)（可选）；
2. 将 florr-AFK-indicator.user.js 粘贴到 Tampermonkey 扩展程序或调试控制台。
3. 3. 对于 Tampermonkey 扩展，按 Ctrl+S 保存脚本；对于调试控制台，按回车运行。
4. 确保 florr.io 的通知权限为 “已授予”。
5. 按 Alt+P 启动和停止脚本。

#florr-AFK-indicator-dev.js 的使用方法
您可以根据注释修改该文件，以便使用它来检测 florr.io 中的内容。
