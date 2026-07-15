import { app, BrowserWindow } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { IRacingSDK } from 'irsdk-node'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: false
    },
  })

  // Test active push message to Renderer-process.
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    mainWindow = null
  }
})

// MAIN LOGIC

function checkForSim(sdk: any) {
  const interval = setInterval(async () => {
    const isRunning = await IRacingSDK.IsSimRunning()

    if(isRunning) {
      console.log("iRacing detected! Start data reading... ")
      clearInterval(interval)

      sdk.startSDK()
      startTelemetryLoop(sdk)
    }
  }, 1000)
}

function startTelemetryLoop(sdk: any) {
  const TIMEOUT = Math.floor((1/60) * 1000)
  
  loop()

  function loop() {
    if(sdk.waitForData(TIMEOUT)) {
      const telemetry = sdk.getTelemetry()
      const session = sdk.getSessionData()

      let dataToSend = {
        trackName: '',
        trackShortName: '',
        carName: ''
      }

      if(session) {
        let trackName = session.WeekendInfo.TrackDisplayName
        let trackShortName = session.WeekendInfo.TrackDisplayShortName

        console.log(trackName)
        console.log(trackShortName)
      }

      if(telemetry) {
        const myCarIdx = session.DriverInfo.DriverCarIdx
        const driverList = session.DriverInfo.Drivers
        const myDriverData = driverList.find((driver:any) => driver.CarIdx === myCarIdx)

        console.log(myDriverData.CarScreenName)

        setImmediate(loop)
      } else {
        console.log("Rozłączono z iRacing. Ponowne szukanie symulatora...")
        checkForSim(sdk)
      }
    }
    loop()
  }
}

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()

  console.log( "iRacing Odometer work")
  console.log( "Looking for iRacing simulator...")

  const sdk = new IRacingSDK({
    autoEnableTelemetry: true
  })

  checkForSim(sdk)
})
