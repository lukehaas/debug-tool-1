const path = require('path');
const util = require('util');

const execFile = util.promisify(require('child_process').execFile);

const escape = p => `"${p}"`;

const getNpmPath = (isDevelopment, appPath) => {
  return isDevelopment
    ? path.resolve(appPath, '../../node_modules/npm/bin/npm-cli.js')
    : escape(
        path.resolve(appPath, '../app.asar.unpacked/node_modules/npm/bin/npm-cli.js')
      );
};

const initializePackage = ({ isDevelopment, appPath, userDataPath }) => {
  return execFile(
    escape(process.execPath),
    [getNpmPath(isDevelopment, appPath), 'init', '-y'],
    {
      timeout: 5 * 60 * 1000,
      maxBuffer: 1024 * 1024,
      shell: true,
      cwd: userDataPath,
      env: {
        NODE_ENV: 'production',
        ELECTRON_RUN_AS_NODE: 'true',
      },
    }
  );
};

module.exports = {
  initializePackage,
};
