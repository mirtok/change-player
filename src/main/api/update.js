import {
    autoUpdater
} from 'electron-updater'

import {
    ipcMain,
    dialog
} from 'electron'
let mainWindow = null;
export function updateHandle(window, feedUrl) {
    autoUpdater.checkForUpdates();
    mainWindow = window;

    //设置更新包的地址
    autoUpdater.setFeedURL(feedUrl);
    //监听升级失败事件
    autoUpdater.on('error', function (error) {
        dialog.showMessageBox({
            type: 'error',
            title: 'error',
            message: "升级失败"
        })
    });

    //监听开始检测更新事件
    autoUpdater.on('checking-for-update', function (message) {
        dialog.showMessageBox({
            type: 'info',
            title: 'checking-for-update',
            message: "开始检测更新"
        })
    });

    //监听发现可用更新事件
    autoUpdater.on('update-available', function (message) {
        dialog.showMessageBox({
            type: 'info',
            title: 'update-available',
            message: "发现可用更新"
        })
    });

    //监听没有可用更新事件
    autoUpdater.on('update-not-available', function (message) {
        dialog.showMessageBox({
            type: 'info',
            title: 'update-not-available',
            message: "没有可用更新"
        })
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj) {
        dialog.showMessageBox({
            type: 'info',
            title: 'download-progress',
            message: "更新下载进度"
        })
    });
    //监听下载完成事件
    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl) {
        dialog.showMessageBox({
            type: 'info',
            title: 'update-downloaded',
            message: "下载完成"
        })
        //退出并安装更新包
        autoUpdater.quitAndInstall();
    });

    //接收渲染进程消息，开始检查更新
    ipcMain.on("checkForUpdate", (e, arg) => {
        //执行自动更新检查
        autoUpdater.checkForUpdates();
    })
}
//给渲染进程发送消息
function sendUpdateMessage(text) {
    mainWindow.webContents.send('message', text)
}