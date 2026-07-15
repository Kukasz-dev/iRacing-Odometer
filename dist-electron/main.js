import { app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { IRacingSDK } from "irsdk-node";
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow == null ? void 0 : mainWindow.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    mainWindow = null;
  }
});
function checkForSim(sdk) {
  const interval = setInterval(async () => {
    const isRunning = await IRacingSDK.IsSimRunning();
    if (isRunning) {
      console.log("iRacing detected! Start data reading... ");
      clearInterval(interval);
      sdk.startSDK();
      startTelemetryLoop(sdk);
    }
  }, 1e3);
}
function startTelemetryLoop(sdk) {
  const TIMEOUT = Math.floor(1 / 60 * 1e3);
  loop();
  function loop() {
    if (sdk.waitForData(TIMEOUT)) {
      const telemetry = sdk.getTelemetry();
      const session = sdk.getSessionData();
      if (session) {
        let trackName = session.WeekendInfo.TrackDisplayName;
        let trackShortName = session.WeekendInfo.TrackDisplayShortName;
        console.log(trackName);
        console.log(trackShortName);
      }
      if (telemetry) {
        const myCarIdx = session.DriverInfo.DriverCarIdx;
        const driverList = session.DriverInfo.Drivers;
        const myDriverData = driverList.find((driver) => driver.CarIdx === myCarIdx);
        console.log(myDriverData.CarScreenName);
        setImmediate(loop);
      } else {
        console.log("Rozłączono z iRacing. Ponowne szukanie symulatora...");
        checkForSim(sdk);
      }
    }
    loop();
  }
}
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  console.log("iRacing Odometer work");
  console.log("Looking for iRacing simulator...");
  const sdk = new IRacingSDK({
    autoEnableTelemetry: true
  });
  checkForSim(sdk);
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
