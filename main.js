const path = require('path');
const os = require('os');
const {app, BrowserWindow,shell, Menu, ipcMain} = require('electron');
const log = require('electron-log');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');

let mainWindow;
let aboutWindow;

process.env.NODE_ENV = 'production';

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

ipcMain.on("image:minimize", (event, args) => {
        args.dest = path.join(os.homedir(), 'imageshrink')
        shrinkImage(args);
    }
)

async function shrinkImage({imgPath, quality, dest}) {
    try {
        const pngQuality = quality /100;
        const files = await imagemin([slash(imgPath)], {
            destination: dest,
            plugins: [
                imageminMozjpeg({quality}),
                imageminPngquant({
                    quality: [pngQuality, pngQuality]
                })
            ]
        })
        shell.openPath(dest);
        log.info(files);

        mainWindow.webContents.send('image:done')
    } catch (e) {
        log.error(e);
    }
}

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