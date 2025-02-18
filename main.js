const {
  app,
  globalShortcut,
  BrowserWindow,
  screen,
  ipcMain,
  systemPreferences,
  shell,
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

  globalShortcut.register("alt+q", () => {
    if (process.platform === "darwin") {
      // Check screen capture permission status on macOS:
      const status = systemPreferences.getMediaAccessStatus("screen");
      if (status !== "granted") {
        // Inform the user and open the Screen Recording settings page
        console.log(
          "Screen capture permission not granted. Please enable it in System Preferences."
        );
        shell.openExternal(
          "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenRecording"
        );
        return;
      }
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
    fullscreen: true,
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

ipcMain.on("cancel-selection", () => {
  if (overlayWindow) {
    console.log("Cancel selection");
    overlayWindow.close();
  }
});