const {app, BrowserWindow, Menu, ipcMain} = require('electron');

let mainWindow;
let aboutWindow;

process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

function createMainWindow() {

    mainWindow = new BrowserWindow({
        title: "ImageShrink",
        width: isDev ? 800 : 500,
        height: 600,
        icon: `${__dirname}\\assets\\icons\\Icon_256x256.png`,
        resizable: isDev, backgroundColor: "white",
        webPreferences: {
            nodeIntegration: true
        }
    })
    if (isDev) {
        mainWindow.webContents.toggleDevTools();
    }
    mainWindow.loadFile('./app/index.html')
}

function createAboutWindow() {

    aboutWindow = new BrowserWindow({
        title: "ImageShrink",
        width: 300,
        height: 300,
        icon: `${__dirname}\\assets\\icons\\Icon_256x256.png`,
        resizable: isDev
    })
    mainWindow.loadFile('./app/about.html')
}

app.on("ready", () => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu)
    mainWindow.on("ready", () => {
        mainWindow = null
    })
})

const menu = [
    ...(isMac ? [{
        label: app.name, submenu: [
            {
                label: "About",
                click: createAboutWindow
            }
        ]
    }] : []),
    {role: "fileMenu"},
    ...(isDev ? [{
        label: 'Developer',
        submenu: [
            {role: "reload"},
            {role: "forcereload"},
            {role: "separator"},
            {role: "toggledevtools"},
        ]
    }] : [])
]

ipcMain.on("image:minimize", (event, args) => console.log(args))

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
})