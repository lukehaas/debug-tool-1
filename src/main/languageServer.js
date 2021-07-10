const { app } = require('electron');
const { is } = require('electron-util');
const path = require('path');
const { spawn } = require('child_process');
const kill = require('tree-kill');
const killPort = require('kill-port');

const getLanguageServerPath = (isDevelopment, appPath) => {
  return isDevelopment
    ? path.resolve(appPath, '../../packages/ws-ts-language-server/lib/cli.js')
    : path.resolve(appPath, '../packages/ws-ts-language-server/lib/cli.js');
};

const escape = p => `"${p}"`;
let port = null;

const initializeLanguageServer = async () => {
  const appPath = app.getAppPath();
  const userDataPath = app.getPath('userData');
  const execPath = is.development ? 'node' : escape(process.execPath);

  return new Promise((resolve, reject) => {
    const serverProcess = spawn(
      execPath,
      [getLanguageServerPath(is.development, appPath), `--execPath=${execPath}`],
      {
        shell: true,
        cwd: userDataPath,
        env: {
          NODE_ENV: 'production',
          ELECTRON_RUN_AS_NODE: 'true',
          ...process.env,
        },
      }
    );
    serverProcess.stderr.on('data', data => {
      reject(data.toString());
    });
    serverProcess.stdout.on('data', data => {
      port = data.toString();
      resolve(port);
    });
    app.on('before-quit', () => {
      kill(serverProcess.pid);
      killPort(port, 'tcp');
    });
  });
};

exports.initializeLanguageServer = initializeLanguageServer;
