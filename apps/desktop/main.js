const { app, BrowserWindow } = require('electron');
const { IRacingSDK } = require('irsdk-node');
const path = require('path');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 300,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    })
}

function checkForSim(sdk){
    const interval = setInterval(async () => {
        const isRunning = await IRacingSDK.IsSimRunning();

        if(isRunning){
            console.log("Wykryto iRacing! Uruchamiam odczyt danych...");
            clearInterval(interval);

            sdk.startSDK();
            startTelemetryLoop(sdk);
        }
    }, 1000);
}

function startTelemetryLoop(sdk) {
    const TIMEOUT = Math.floor((1/60) * 1000);

    function loop() {
        if(sdk.waitForData(TIMEOUT)) {
            const telemetry = sdk.getTelemetry();
            const session = sdk.getSessionData();

            if(session) {
                const trackName = session.WeekendInfo.TrackDisplayName;
                const trackShortName = session.WeekendInfo.TrackDisplayShortName;

                // Track Name Full and Short
                console.log(trackName);
                console.log(trackShortName);

            };

            if(telemetry) {
                const myCarIdx = session.DriverInfo.DriverCarIdx;
                const driverList = session.DriverInfo.Drivers;
                const myDriverData = driverList.find(driver => driver.CarIdx === myCarIdx);

                // Car Name 
                console.log(myDriverData.CarScreenName); 
            }
        

            setImmediate(loop);
        } else {
            console.log("Rozłączono z iRacing. Ponowne szukanie symulatora...")
            checkForSim(sdk);
        }
    }

    loop();
}

app.whenReady().then(() => {
    createWindow();

    console.log("=== iRacing Odometer work ===");
    console.log("Looking for iRacing symulator...");

    const sdk = new IRacingSDK({
        autoEnableTelemetry: true
    });

    checkForSim(sdk);
})

app.on('window-all-closed', () => {
    if( process.platform !== 'darwin') {
        app.quit();
    }
})