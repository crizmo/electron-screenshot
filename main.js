const { app, globalShortcut, BrowserWindow, screen, ipcMain } = require("electron");
const Screenshots = require("./screenshots");

let mainWindow;
let overlayWindow;
const screenshots = new Screenshots();

app.on("ready", () => {
  app.commandLine.appendSwitch('disable-renderer-backgrounding');
  mainWindow = new BrowserWindow({
    show: false,
    fullscreen: true,
    transparent: true,
    frame: false
  });
  
  mainWindow.loadFile("select_area.html");

  globalShortcut.register("alt+q", () => {
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