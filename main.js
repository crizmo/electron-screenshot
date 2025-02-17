const {
  app,
  globalShortcut,
  BrowserWindow,
  screen,
  ipcMain,
} = require("electron");
const Screenshots = require("./screenshots");

let mainWindow;
let overlayWindow;
const screenshots = new Screenshots();

app.on("ready", () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  app.commandLine.appendSwitch("disable-renderer-backgrounding");
  mainWindow = new BrowserWindow({
    show: false,
    width: width,
    height: height,
    transparent: true,
    frame: false,
  });

  mainWindow.loadFile("select_area.html");

  globalShortcut.register("CommandOrControl+I", () => {
    const { systemPreferences, shell } = require("electron");

    // Check screen capture permission status:
    const status = systemPreferences.getMediaAccessStatus("screen");
    if (status !== "granted") {
      // Inform the user and open the Screen Recording settings page
      console.log(
        "Screen capture permission not granted. Please enable it in System Preferences."
      );
      shell.openExternal(
        "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenRecording"
      );
    }
    mainWindow.show();
    createOverlayWindow();
  });
});

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  overlayWindow = new BrowserWindow({
    width,
    height,
    frame: false,
    transparent: true,
    fullscreen: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    movable: false,
    resizable: false,
    enableLargerThanScreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  overlayWindow.setIgnoreMouseEvents(false);
  overlayWindow.loadFile("select_area.html");

  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });

  overlayWindow.webContents.on("did-finish-load", () => {
    overlayWindow.webContents.send("window-loaded");
  });
}

ipcMain.on("area-selected", (event, args) => {
  screenshots.captureArea(args.x, args.y, args.width, args.height);
  console.log(args);
  overlayWindow.close();
});
