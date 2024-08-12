import path from 'node:path'
import { app, BrowserWindow, Menu, Tray, dialog, nativeImage } from 'electron'

import { handle as checkPermission } from './ipc/hardware/checkPermission'
import { handle as limit } from './ipc/app/limit'
import {
  init as processObserverInit,
  unsubscribeAll
} from './processObserver'

import _iconImage from '../resources/img/icon.png?asset'

const iconImage = nativeImage.createFromDataURL(_iconImage)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  unsubscribeAll()
  limit(false).then(() => app.quit())
}

function *generateIpc() {
  yield import('./ipc/hardware/resume')
  yield import('./ipc/hardware/suspend')
  yield import('./ipc/hardware/mabinogi')
  yield import('./ipc/hardware/checkPermission')

  yield import('./ipc/app/close')
  yield import('./ipc/app/minimize')
  yield import('./ipc/app/limit')
  yield import('./ipc/app/devtool')
  yield import('./ipc/app/log')
  
  yield import('./ipc/config/get')
  yield import('./ipc/config/set')

  yield import('./ipc/external/open')
}

let mainWindow: BrowserWindow|null
let tray: Tray|null

function createTray() {
  const appIcon = new Tray(iconImage)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click() {
        mainWindow.show()
      }
    },
    {
      label: 'Exit',
      async click() {
        unsubscribeAll()
        await limit(false)
        app.quit()
      }
    }
  ])

  appIcon.on('double-click', (e) => mainWindow.show())
  appIcon.setToolTip('Mabinogi foreground limiter')
  appIcon.setContextMenu(contextMenu)
  return appIcon
}

async function isElevated() {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    return true
  }
  const elevated = await checkPermission()
  if (!elevated) {
    dialog.showErrorBox('권한이 부족합니다', '관리자 권한으로 실행해주세요.\n앱을 종료합니다.')
    app.quit()
    return false
  }
  return true
}

async function createWindow() {
  for await (const { ipc } of generateIpc()) {
    ipc()
  }
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 700,
    height: 350,
    maxWidth: 700,
    maxHeight: 350,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    resizable: false,
    icon: iconImage,
    frame: false,
    transparent: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  mainWindow.on('minimize', (e: Event) => {
    e.preventDefault()
    mainWindow.setSkipTaskbar(true)
    tray = createTray()
  })

  mainWindow.on('restore', () => {
    mainWindow.show()
    mainWindow.setSkipTaskbar(false)
    tray.destroy()
    tray = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (await isElevated()) {
    processObserverInit()
    createWindow()
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    unsubscribeAll()
    await limit(false)
    app.quit()
    if (tray) {
      tray.destroy()
      tray = null
    }
    mainWindow = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
