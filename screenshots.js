const { desktopCapturer, screen, shell, nativeImage } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const EventEmitter = require('events');

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
    desktopCapturer.getSources({ types: ['screen'], thumbnailSize: fullBounds }).then(async sources => {
      for (const source of sources) {
        if (source.name === 'Entire screen' || source.name === 'Screen 1') {
          const fullScreenshot = source.thumbnail;
          const croppedImage = nativeImage.createFromBuffer(fullScreenshot.toPNG()).crop(this.bounds);
          const timestamp = new Date().getTime();
          const screenshotPath = path.join(__dirname, '', 'uploads', `screenshot_${timestamp}.png`);
          fs.writeFile(screenshotPath, croppedImage.toPNG(), (error) => {
            if (error) {
              this.emit('cancel', error);
              return console.log("Error saving screenshot: ", error);
            }
            this.emit('ok', croppedImage.toPNG(), this.bounds);
            this.emit('afterSave', croppedImage.toPNG(), this.bounds, true);
            shell.openExternal(`file://${screenshotPath}`);
          });
        }
      }
    });
  }
}

module.exports = Screenshots;