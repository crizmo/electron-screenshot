const { desktopCapturer, screen, shell, nativeImage } = require("electron");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

class Screenshots extends EventEmitter {
  constructor() {
    super();
    this.bounds = null;
  }

  startCapture() {
    this.bounds = screen.getPrimaryDisplay().bounds;
    this.captureScreen(this.bounds);
  }

  captureArea(x, y, width, height) {
    this.bounds = { x, y, width, height };
    this.captureScreen(screen.getPrimaryDisplay().bounds);
  }

  captureScreen(fullBounds) {
    try {
      const { width, height } = fullBounds;
      const scaleFactor = screen.getPrimaryDisplay().scaleFactor;
      const thumbnailSize = {
        width: Math.round(width * scaleFactor),
        height: Math.round(height * scaleFactor),
      };

      desktopCapturer
        .getSources({ types: ["screen"], thumbnailSize })
        .then(async (sources) => {
          for (const source of sources) {
            console.log("Source: ", source);
            if (source.name === "Entire screen" || source.name === "Screen 1") {
              const fullScreenshot = source.thumbnail;
              // Multiply the bounds by the scaleFactor so cropping happens at the correct position.
              const croppedImage = nativeImage
                .createFromBuffer(fullScreenshot.toPNG())
                .crop({
                  x: Math.round(this.bounds.x * scaleFactor),
                  y: Math.round(this.bounds.y * scaleFactor),
                  width: Math.round(this.bounds.width * scaleFactor),
                  height: Math.round(this.bounds.height * scaleFactor),
                });
              const timestamp = new Date().getTime();
              const screenshotPath = path.join(
                __dirname,
                "",
                "uploads",
                `screenshot_${timestamp}.png`
              );
              fs.writeFile(screenshotPath, croppedImage.toPNG(), (error) => {
                if (error) {
                  this.emit("cancel", error);
                  return console.log("Error saving screenshot: ", error);
                }
                this.emit("ok", croppedImage.toPNG(), this.bounds);
                this.emit("afterSave", croppedImage.toPNG(), this.bounds, true);
                shell.openExternal(`file://${screenshotPath}`);
              });
            }
          }
        })
        .catch((error) => {
          console.log("Error capturing screen: ", error);
        });
    } catch (error) {
      console.log("Error capturing screen: ", error);
    }
  }
}

module.exports = Screenshots;
