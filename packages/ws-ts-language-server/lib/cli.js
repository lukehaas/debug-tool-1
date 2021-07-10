#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
const getPort = require('get-port');
const ws = require('ws');
const argv = require('minimist');
const path = require('path');

const rpcServer = require('@sourcegraph/vscode-ws-jsonrpc/lib/server');

const { execPath } = argv(process.argv.slice(2));

function toSocket(webSocket) {
  return {
    send: content => webSocket.send(content),
    onMessage: cb => {
      webSocket.onmessage = event => cb(event.data);
    },
    onError: cb => {
      webSocket.onerror = event => {
        if ('message' in event) {
          cb(event.message);
        }
      };
    },
    onClose: cb => {
      webSocket.onclose = event => cb(event.code, event.reason);
    },
    dispose: () => webSocket.close(),
  };
}
function nodeJSONRPC({ languageServers, port }) {
  const wss = new ws.Server({
    port,
    perMessageDeflate: false,
  });
  wss.on('connection', (client, request) => {
    let langServer;
    Object.keys(languageServers).forEach(key => {
      if (request.url === `/${key}`) {
        langServer = languageServers[key];
      }
    });
    if (!langServer || !langServer.length) {
      return client.close();
    }

    const localConnection = rpcServer.createServerProcess(
      'jsonrpc',
      langServer[0],
      langServer.slice(1)
    );
    const socket = toSocket(client);
    const connection = rpcServer.createWebSocketConnection(socket);
    rpcServer.forward(connection, localConnection);
    socket.onClose(() => {
      localConnection.dispose();
    });
  });
}

const languageServerPath = path.resolve(
  __dirname,
  '../node_modules/typescript-language-server/lib/cli.js'
);

getPort({ port: getPort.makeRange(9450, 9550) })
  .then(port => {
    nodeJSONRPC({
      port,
      languageServers: {
        typescript: [execPath, languageServerPath, '--stdio', '--tsserver-log-file=ts-logs.txt', '--tsserver-log-verbosity=verbose'],
      },
    });
    process.stdout.write(`${port}`);
  })
  .catch(() => {
    process.stderr.write('Failed to start server');
  });
