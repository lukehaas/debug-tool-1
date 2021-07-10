const { app, Menu } = require('electron');

const getMenuTemplate = () => {
  const menuTemplate = [
    {
      label: app.name,
      submenu: [
        { role: 'about', label: 'About debug-tool' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide', label: 'Hide debug-tool' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit', label: 'Quit debug-tool' },
      ],
    },
  ];
  return menuTemplate;
};

exports.setupMenu = function () {
  Menu.setApplicationMenu(Menu.buildFromTemplate(getMenuTemplate()));
};
