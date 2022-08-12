import packageJson from '../package.json';
import { app, BrowserWindow, MenuItem, shell } from 'electron';

/** Returns a 'lambda' that sends the event to the renderer process. */
export function sendEventToRenderer(eventKey: string) {
  return (_: MenuItem, currentWindow: BrowserWindow) => currentWindow.webContents.send(eventKey);
}

/** Returns a template for building the main electron menu */
function getTemplate() {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '&File',
      submenu: [
        {
          label: 'Open SQLite File',
          accelerator: 'CmdOrCtrl+O',
          click: sendEventToRenderer('open-SQLite')
        },
        {
          label: 'Save As New SQLite File',
          accelerator: 'CmdOrCtrl+S',
          click: sendEventToRenderer('save-SQLite')
        },
        {
          label: 'Import JSON File',
          accelerator: 'CmdOrCtrl+I',
          click: sendEventToRenderer('import-JSON')
        },
        {
          label: 'Export JSON File',
          accelerator: 'CmdOrCtrl+E',
          click: sendEventToRenderer('export-JSON')
        },
        {
          label: 'Export Conclusions JSON File',
          accelerator: 'CmdOrCtrl+J',
          click: sendEventToRenderer('export-JSON-conclusions-only')
        },
        ...(
          isMac ? [
            {
              label: 'Quit',
              accelerator: 'CmdOrCtrl+Q',
              click: () => app.quit()
            }
          ] : []
        )
      ]
    },
    {
      label: '&Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll'
        },



      ]
    },
    {
      label: '&View',
      submenu: [
        {
          label: 'Table View',
          accelerator: process.platform === 'darwin' ?
            'Cmd+Shift+T' : 'Ctrl+Shift+T',
          click: sendEventToRenderer('table-view')
        },
        {
          label: 'Chart Summary View',
          accelerator: process.platform === 'darwin' ?
            'Cmd+Shift+D' : 'Ctrl+Shift+D',
          click: sendEventToRenderer('chart-summary-view')
        },
        {
          label: 'Conclusion Summary View',
          accelerator: process.platform === 'darwin' ?
            'Cmd+Shift+C' : 'Ctrl+Shift+C',
          click: sendEventToRenderer('conclusion-summary-view')
        },
        {
          type: 'separator'
        },
        {
          label: 'Reload',
          accelerator: process.platform === 'darwin' ?
            'Cmd+R' : 'Ctrl+R',
          click: (item: MenuItem, focusedWindow: BrowserWindow) => {
            if (focusedWindow) {
              focusedWindow.reload();
            }
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: process.platform === 'darwin' ?
            'Ctrl+Command+F' : 'F11',
          click: (item: MenuItem, focusedWindow: BrowserWindow) => {
            if (focusedWindow) {
              focusedWindow.setFullScreen(
                !focusedWindow.isFullScreen());
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ?
            'Alt+Command+I' : 'Alt+Ctrl+I',
          click: (item: MenuItem, focusedWindow: BrowserWindow) => {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: sendEventToRenderer('zoom-reset')
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+=',
          click: sendEventToRenderer('zoom-in')
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: sendEventToRenderer('zoom-out')
        },
      ]
    },
    {
      label: '&Window',
      role: 'window',
      type: 'submenu',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
        ...(
          isMac ? [
            // {
            //   type: 'separator',
            //   role: 'separator',
            // },
            // {
            //   label: 'Bring All to Front',
            //   role: 'quit',
            //   accelerator: '',
            // },
          ]  : []
        )
      ]
    },
    {
      label: '&Help',
      role: 'help',
      submenu: [
        {
          label: `ScanCode Workbench Version ${packageJson.version}`,
          enabled: false
        },
        {
          label: 'Show ScanCode Header Information',
          accelerator: 'CmdOrCtrl+G',
          click: sendEventToRenderer('get-ScanHeader')
        },
        {
          type: 'separator'
        },
        {
          label: 'GitHub Repository',
          click: () => shell.openExternal(
            'https://github.com/nexB/scancode-workbench/')
        },
        {
          label: 'Licensing Information',
          click: () => {
            let win = new BrowserWindow({frame: true});
            win.setMenu(null);
            win.on('closed', ():void => win = null);
            win.loadURL('file://' + __dirname + '/attribution.html');
            win.show();
          }
        },
        {
          // @TODO: make this version specific?
          label: 'Documentation',
          click: () => shell.openExternal(
            `https://scancode-workbench.readthedocs.io`)
        },
        {
          label: 'Issue Tracker',
          click: () => shell.openExternal(
            'https://github.com/nexB/scancode-workbench/issues')
        }
      ]
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: 'ScanCode Workbench',
      submenu: [
        {
          label: 'About ScanCode Workbench',
          click: () => {
            let win = new BrowserWindow({
              frame: true,
              width: 250,
              height: 200
            });
            win.on('closed', ():void => win = null);
            win.loadURL('file://' + __dirname + '/about.html');
            win.show();
          }
        },
        {
          type: 'separator'
        },
        {
          label: `Version ${packageJson.version}`,
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          role: 'services',
          accelerator: ''
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide Electron',
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideOthers'
        },
        {
          label: 'Show All',
          role: 'unhide',
          accelerator: '',
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => app.quit()
        },
      ]
    })
  }

  return template;
}

export default getTemplate;