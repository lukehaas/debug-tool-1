console.time('init');
const { app, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { is } = require('electron-util');

const { initializePackage } = require('../util/npm');
const { initializeLanguageServer } = require('./languageServer');
const { ipcEvents } = require('../ipcEvents');
const { setupMenu } = require('./menu');
const { getOrCreateMainWindow, closeMainWindow } = require('./mainWindow');

const appPath = app.getAppPath();
const userDataPath = path.resolve(app.getPath('userData'), 'debug-tool');

if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', closeMainWindow);

const statuses = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  FAILED: 'FAILED',
};

const getTsconfig = () => ({
  compilerOptions: {
    allowJs: true,
    jsx: 'preserve',
    checkJs: true,
    allowSyntheticDefaultImports: true,
    allowNonTsExtensions: true,
    lib: ['dom', 'esnext'],
    target: 'es6',
    module: 'commonjs',
    strict: true,
    typeRoots: ['./node_modules/@types'],
  },
  include: [],
  exclude: ['node_modules'],
});

const initializeNpm = () => {
  if (!fs.existsSync(path.join(userDataPath, 'package.json'))) {
    try {
      initializePackage({
        isDevelopment: is.development,
        appPath,
        userDataPath,
      });
    } catch (err) {
      console.log(err);
      return err;
    }
  }
};

const createTSconfig = () => {
  try {
    fs.writeFileSync(
      path.join(userDataPath, 'tsconfig.json'),
      JSON.stringify(getTsconfig())
    );
  } catch (err) {
    return err;
  }
};

const lspStatus = {
  status: statuses.PENDING,
};

ipcMain.once(ipcEvents.INIT_SERVICES, () => {
  console.timeEnd('init');
  createTSconfig();
  initializeNpm();

  initializeLanguageServer()
    .then(port => {
      lspStatus.port = port;
      lspStatus.status = statuses.RUNNING;
    })
    .catch(err => {
      console.log(err);
      lspStatus.status = statuses.FAILED;
    });
});

const getLspPort = () => {
  if (lspStatus.status === statuses.FAILED) {
    return { done: true, port: false };
  } else if (lspStatus.status === statuses.RUNNING) {
    return { done: true, port: lspStatus.port };
  }
  return { done: false };
};

const waitForLspServer = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getLspPort());
    }, 1000);
  });
};

ipcMain.handle(ipcEvents.GET_LSP_PORT, async () => {
  let response = getLspPort();
  while (!response.done) {
    /* eslint-disable  no-await-in-loop */
    response = await waitForLspServer();
    if (response.done) return response;
  }
  return response;
});

function ready() {
  getOrCreateMainWindow();
  setupMenu();
}

app.whenReady().then(ready);
app.on('activate', getOrCreateMainWindow);
