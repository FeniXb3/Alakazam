const { app, BrowserWindow } = require('electron')
const createWindow = () => {
    const win = new BrowserWindow({
        show: false,
        autoHideMenuBar: true,
        width: 1920,
        height: 1080
    })

    win.once('ready-to-show', () => {
        win.show()
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit()
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
