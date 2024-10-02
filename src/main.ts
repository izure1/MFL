
import path from 'node:path'
import { app, BrowserWindow, Menu, Tray, dialog, nativeImage } from 'electron'
import { updateElectronApp } from 'update-electron-app'

import type { IOEvent } from './types/index.js'
import { handle as checkPermission } from './ipc/hardware/checkPermission.js'
import { handle as limit } from './ipc/app/limit.js'
import { createSubscriber } from './ioObserver.js'
import { stop as stopMacroRunner } from './macroRunner.js'
import { stop as stopLogger } from './ipc/app/logging.js'
import { sendIOSignal } from './ipc/helpers/sendIOSignal.js'
import { handle as mainToRenderer } from './ipc/helpers/mainToRenderer.js'
import {
  unsubscribeAll
} from './processObserver.js'

import _iconImage from '../resources/img/icon.png?asset'

const iconImage = nativeImage.createFromDataURL(_iconImage)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if ((await import('electron-squirrel-startup')).default) {
  app.quit()
}

updateElectronApp()

function *generateIpc() {
  yield import('./ipc/hardware/resume.js')
  yield import('./ipc/hardware/suspend.js')
  yield import('./ipc/hardware/mabinogi.js')
  yield import('./ipc/hardware/checkPermission.js')

  yield import('./ipc/app/close.js')
  yield import('./ipc/app/minimize.js')
  yield import('./ipc/app/limit.js')
  yield import('./ipc/app/devtool.js')
  yield import('./ipc/app/log.js')
  yield import('./ipc/app/logging.js')
  yield import('./ipc/app/version.js')
  yield import('./ipc/app/directoryOpen.js')
  
  yield import('./ipc/config/get.js')
  yield import('./ipc/config/set.js')

  yield import('./ipc/macro/getMap.js')
  yield import('./ipc/macro/get.js')
  yield import('./ipc/macro/set.js')
  yield import('./ipc/macro/remove.js')

  yield import('./ipc/io/listen.js')

  yield import('./ipc/external/open.js')
  yield import('./ipc/external/showItem.js')

  yield import('./ipc/fs/showOpenDialog.js')
  yield import('./ipc/fs/getItemSize.js')
  yield import('./ipc/fs/glob.js')
  yield import('./ipc/fs/remove.js')
}

let mainWindow: BrowserWindow|null
let tray: Tray|null

async function clearApp() {
  unsubscribeAll()
  await stopMacroRunner()
  await stopLogger()
  await limit(false)
  if (tray) {
    tray.destroy()
    tray = null
  }
  mainWindow = null
}

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
      click() {
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
      sandbox: true,
      preload: path.join(import.meta.dirname, 'preload.cjs'),
    },
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(import.meta.dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  if (await isElevated()) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})

let allowCloseApp = false
app.on('before-quit', async (e) => {
  if (!allowCloseApp) {
    e.preventDefault()
    await clearApp()
    allowCloseApp = true
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

process.on('uncaughtException', (err) => {
  mainToRenderer(err.message, err.stack, err.cause)
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
