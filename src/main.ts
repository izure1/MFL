import type { IOEvent } from './types/index.js'

import path from 'node:path'
import { app, BrowserWindow, Menu, Tray, dialog, nativeImage, screen } from 'electron'
import { updateElectronApp } from 'update-electron-app'

import { handle as checkPermission } from './ipc/hardware/checkPermission.js'
import { handle as limit } from './ipc/app/limit.js'
import { handle as findMabinogiProcess } from './ipc/hardware/mabinogi.js'
import { createSubscriber as createProcessSubscriber } from './helpers/processObserver.js'
import { createSubscriber as createIOSubscriber } from './helpers/ioObserver.js'
import { auctionWatcher } from './helpers/auctionWatcher.js'
import { stop as stopMacroRunner } from './helpers/macroRunner.js'
import { stop as stopLogger } from './ipc/app/logging.js'
import { sendIOSignal } from './ipc/helpers/sendIOSignal.js'
import { handle as mainToRenderer } from './ipc/helpers/mainToRenderer.js'
import { unsubscribeAll } from './helpers/processObserver.js'
import { crashReport } from './helpers/crash.js'

import _iconImage from './renderer/assets/img/icon.png?url'
import { delay, createRepeat } from './utils/timer.js'

import { close as closeAuctionSubscribeDB } from './db/auctionSubscribe.js'
import { close as closeAuctionWatchDB } from './db/auctionWatch.js'
import { close as closeConfigDB } from './db/config.js'
import { close as closeMacroDB } from './db/macro.js'
import { getFilePathFromHomeDir } from './helpers/homedir.js'
import { startup } from './helpers/startup.js'


const iconImage = nativeImage.createFromDataURL(_iconImage)


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
  
  yield import('./ipc/auction/fetch.js')
  yield import('./ipc/auction/watchSet.js')
  yield import('./ipc/auction/watchRemove.js')
  yield import('./ipc/auction/watchGetFromCategory.js')
  yield import('./ipc/auction/inspect.js')
  yield import('./ipc/auction/getNonInspected.js')
  yield import('./ipc/auction/requestFetchWanted.js')
}

let mainWindow: BrowserWindow|null
let overlayWindow: BrowserWindow|null
let tray: Tray|null

let processSubscriber: ReturnType<typeof createProcessSubscriber>|null = null
let isMabinogiFocused = false

async function clearApp() {
  unsubscribeAll()

  await stopMacroRunner()
  await stopLogger()
  await limit(false)

  tray?.destroy()
  tray = null

  BrowserWindow.getAllWindows().forEach((w) => w.close())
  mainWindow = null
  overlayWindow = null
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
  appIcon.setToolTip('MFL')
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

async function listenProcess() {
  const repeat = createRepeat()
  const cancel = repeat(async () => {
    const process = await findMabinogiProcess()
    if (!process) {
      return
    }
    cancel()
    processSubscriber = createProcessSubscriber(process.pid)
    processSubscriber.onActivate(() => {
      isMabinogiFocused = true
      resetOverlayWindow()
    })
    processSubscriber.onDeactivate(() => {
      isMabinogiFocused = false
      resetOverlayWindow()
    })
    if (processSubscriber.windowActivated) {
      processSubscriber.emitActivate()
    }
  }, 15000, true)
}

async function listenIO() {
  const {
    onClick,
    onKeydown,
    onKeyup,
    onMousedown,
    onMouseup,
    onWheel,
  } = createIOSubscriber()
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

function resetOverlayWindow() {
  if (!overlayWindow) {
    return
  }
  if (isMabinogiFocused) {
    const { width, height } = screen.getPrimaryDisplay().size
    overlayWindow.setSize(width, height, false)
    overlayWindow.setAlwaysOnTop(true, 'screen-saver', 1)
    overlayWindow.setIgnoreMouseEvents(true, { forward: true })
    overlayWindow.show()
  }
  else {
    overlayWindow.setAlwaysOnTop(false)
    overlayWindow.setIgnoreMouseEvents(true)
    overlayWindow.blur()
    overlayWindow.hide()
  }
}

async function createWindow() {
  for await (const { ipc } of generateIpc()) {
    ipc()
  }

  const primaryWindowSize = screen.getPrimaryDisplay().size
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 950,
    height: 600,
    maxWidth: 950,
    maxHeight: 600,
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
      webSecurity: false,
      sandbox: true,
      preload: path.join(import.meta.dirname, 'preload.cjs'),
    },
  })

  overlayWindow = new BrowserWindow({
    x: 0,
    y: 0,
    parent: mainWindow,
    width: primaryWindowSize.width,
    height: primaryWindowSize.height,
    focusable: false,
    minimizable: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    resizable: false,
    frame: false,
    transparent: true,
    hasShadow: false,
    movable: false,
    skipTaskbar: true,
    show: false,
    fullscreen: false,
    webPreferences: {
      webSecurity: false,
      sandbox: true,
      preload: path.join(import.meta.dirname, 'preload.cjs'),
    }
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await Promise.all([
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + '#/main'),
      overlayWindow.loadURL(OVERLAY_WINDOW_VITE_DEV_SERVER_URL + '#/overlay'),
    ]).then(() => {
      mainWindow.webContents.openDevTools()
      overlayWindow.webContents.openDevTools()
    })
    // Open the DevTools.
  } else {
    await Promise.all([
      mainWindow.loadFile(path.join(import.meta.dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)),
      overlayWindow.loadFile(path.join(import.meta.dirname, `../renderer/${OVERLAY_WINDOW_VITE_NAME}/index.html`)),
    ]).then(() => delay(1000)).then(() => {
      mainWindow.webContents.send('set-hash', '/main')
      overlayWindow.webContents.send('set-hash', '/overlay')
      // mainWindow.webContents.openDevTools()
      // overlayWindow.webContents.openDevTools()
    })
  }

  mainWindow.on('minimize', (e: Event) => {
    e.preventDefault()
    mainWindow.setSkipTaskbar(true)
    mainWindow.blur()
    tray = createTray()
    resetOverlayWindow()
  })

  mainWindow.on('restore', () => {
    mainWindow.show()
    mainWindow.setSkipTaskbar(false)
    mainWindow.focus()
    tray.destroy()
    tray = null
    setImmediate(() => {
      isMabinogiFocused = false
      resetOverlayWindow()
    })
  })

  mainWindow.on('closed', () => {
    app.quit()
  })

  setTimeout(async () => {
    await listenProcess()
    await listenIO()

    auctionWatcher.run()
    auctionWatcher.on('notification-click', (tuples) => {
      mainWindow.show()
      mainToRenderer('auction-show-alerted')
    })
    
    // Show application to start
    mainWindow.show()
    resetOverlayWindow()
  }, 1000)
}


/**
 * 
 * START ELECTRON MAIN PROCESS
 * 
 */
app.setAppUserModelId('org.izure.mfl')

crashReport.setPath(getFilePathFromHomeDir('./Logs/Crashes'))
crashReport.start()


async function onStartup() {
  // close database safety
  await closeAuctionSubscribeDB()
  await closeAuctionWatchDB()
  await closeConfigDB()
  await closeMacroDB()
  // close app
  app.quit()
  process.exit(0)
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (!startup(onStartup)) {
  updateElectronApp()
  
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(async () => {
    if (await isElevated()) {
      createWindow()
    }
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
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
