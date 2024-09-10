
import path from 'node:path'
import { app, BrowserWindow, Menu, Tray, dialog, nativeImage } from 'electron'
import { updateElectronApp } from 'update-electron-app'

import type { IOEvent } from './types'
import { handle as checkPermission } from './ipc/hardware/checkPermission'
import { handle as limit } from './ipc/app/limit'
import { createSubscriber } from './ioObserver'
import { stop as stopMacroRunner } from './macroRunner'
import { sendIOSignal } from './ipc/helpers/sendIOSignal'
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
  yield import('./ipc/app/directoryOpen')
  
  yield import('./ipc/config/get')
  yield import('./ipc/config/set')

  yield import('./ipc/macro/getMap')
  yield import('./ipc/macro/get')
  yield import('./ipc/macro/set')
  yield import('./ipc/macro/remove')

  yield import('./ipc/io/listen')

  yield import('./ipc/external/open')
  yield import('./ipc/external/showItem')
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

function listenIO() {
  const {
    onClick,
    onKeydown,
    onKeyup,
    onMousedown,
    onMouseup,
    onWheel,
  } = createSubscriber()
  const wrapper = <T extends IOEvent>(e: T) => {
    sendIOSignal(e)
    return e
  }

  onClick(wrapper)
  onKeydown(wrapper)
  onKeyup(wrapper)
  onMousedown(wrapper)
  onMouseup(wrapper)
  onWheel(wrapper)
}

async function createWindow() {
  for await (const { ipc } of generateIpc()) {
    ipc()
  }
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 550,
    maxWidth: 900,
    maxHeight: 550,
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

  listenIO()
  updateElectronApp()
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
    stopMacroRunner()
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
