// This is the entry point of the app

const { app, BrowserWindow } = require('electron')
const path = require('node:path')

// Function to open index.html in a browser window as a webapp
const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  
    win.loadFile('index.html')
  }

// Lots of errors interacting with GPU and networking if this isnt included
app.commandLine.appendSwitch('no-sandbox')

// Call the createWindow function as soon as possible
app.whenReady().then(() => {
    createWindow()
  })

// Quit app if all windows are closed
app.on('window-all-closed', () => {
    app.quit()
  })