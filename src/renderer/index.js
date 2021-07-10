import { ipcRenderer } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';
import { ipcEvents } from '../ipcEvents';
import '../static/scss/index.scss';

function ready() {
  ipcRenderer.send(ipcEvents.INIT_SERVICES);
}

const rootElement = document.getElementById('root');

ReactDOM.render(<App />, rootElement, ready);
