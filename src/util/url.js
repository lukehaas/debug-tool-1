const { URL } = require('url');

exports.getPath = function ({ filename = '', hash = '', isDev }) {
  if (isDev) {
    return new URL(`http://localhost:3001${filename}${hash}`).href;
  }
  return new URL(`file:${__dirname}${filename}${hash}`).href;
};
