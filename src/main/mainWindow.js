const electron = require('electron');
const { is } = require('electron-util');
const { getPath } = require('../util/url');

const { app, BrowserWindow, screen } = electron;

let mainWindow = null;

function createMainWindow() {
  const display = screen.getPrimaryDisplay();

  const screenWidth = display.workAreaSize.width;
  const screenHeight = display.workAreaSize.height;

  const appWidth = 800;
  const appHeight = 600;

  const width = appWidth > screenWidth ? screenWidth : appWidth;
  const height = appHeight > screenHeight ? screenHeight : appHeight;

  const userDataPath = app.getPath('userData');
  const appPath = app.getAppPath();

  const additionalArguments = [
    `--userDataPath=${userDataPath}`,
    `--appPath=${appPath}`,
    `--isDev=${is.development}`,
  ];

  const windowOptions = {
    width,
    height,
    minWidth: 400,
    minHeight: 250,
    backgroundColor: '#282a36',
    darkTheme: true,
    textAreasAreResizable: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      devTools: true,
      enableRemoteModule: true,
      additionalArguments,
      contextIsolation: false,
    },
    show: false,
    center: true,
  };

  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.loadURL(getPath({ filename: '/index.html', isDev: is.development }));

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (process.platform !== 'darwin') {
      const windows = BrowserWindow.getAllWindows();
      windows.forEach(window => {
        window.close();
      });
      app.quit();
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  return mainWindow;
}

exports.getOrCreateMainWindow = function () {
  return mainWindow || createMainWindow();
};

exports.closeMainWindow = function () {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
};
