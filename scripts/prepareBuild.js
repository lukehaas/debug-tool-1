const fs = require('fs-extra');
const path = require('path');

const filterFiles = name => {
  if (name.includes('/.git')) return false;
  return true;
};

fs.copySync(path.resolve(__dirname,'../package.json'), path.resolve(__dirname,'../dist/package.json'));
fs.emptyDirSync(path.resolve(__dirname,'../dist/packages/ws-ts-language-server'));
fs.emptyDirSync(path.resolve(__dirname,'../dist/packages/@types'));
fs.copySync(path.resolve(__dirname,'../packages/ws-ts-language-server'), path.resolve(__dirname,'../dist/packages/ws-ts-language-server'), { overwrite: true, filter: filterFiles });
