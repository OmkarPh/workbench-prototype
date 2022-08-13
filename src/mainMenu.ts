import { GENERAL_ACTIONS, NAVIGATION_CHANNEL } from './constants/IpcConnection';
import packageJson from '../package.json';
import { app, BrowserWindow, MenuItem, shell } from 'electron';
import { importJsonFile, openSqliteFile, saveSqliteFile, showErrorDialog } from './mainActions';
import { ROUTES } from './constants/routes';

/** Returns a 'lambda' that sends the event to the renderer process. */
export function sendNavEventToRenderer(route: string) {
  return (_: MenuItem, currentWindow: BrowserWindow) => 
    currentWindow.webContents.send(NAVIGATION_CHANNEL, route);
}
export function sendEventToRenderer(eventKey: string, ...args: unknown[]) {
  return (_: MenuItem, currentWindow: BrowserWindow) => 
    currentWindow.webContents.send(eventKey, args);
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
          click: (_: MenuItem, currentWindow: BrowserWindow) => openSqliteFile(currentWindow),
        },
        {
          label: 'Save As New SQLite File',
          accelerator: 'CmdOrCtrl+S',
          click: (_: MenuItem, currentWindow: BrowserWindow) => saveSqliteFile(currentWindow),
        },
        {
          label: 'Import JSON File',
          accelerator: 'CmdOrCtrl+I',
          click: (_: MenuItem, currentWindow: BrowserWindow) => importJsonFile(currentWindow),
        },
        {
          label: 'Export JSON File',
          accelerator: 'CmdOrCtrl+E',
          // @TODO
          click: () => showErrorDialog({
            title: "Not implemented",
            message: "This feature is yet to be discussed"
          })
        },
        // @TODO-discuss This is duplicated in App's menu tab, is it necessary under file tab also ??
        // ...(
        //   isMac ? [
        //     {
        //       label: 'Quit',
        //       accelerator: 'CmdOrCtrl+Q',
        //       click: () => app.quit()
        //     }
        //   ] : []
        // )
      ]
    },
    {
      label: '&View',
      submenu: [
        {
          label: 'Table View',
          accelerator: process.platform === 'darwin' ?
            'Cmd+Shift+T' : 'Ctrl+Shift+T',
          click: sendNavEventToRenderer(ROUTES.TABLE_VIEW),
        },
        {
          label: 'Chart Summary View',
          accelerator: process.platform === 'darwin' ?
            'Cmd+Shift+D' : 'Ctrl+Shift+D',
          click: sendNavEventToRenderer(ROUTES.CHART_SUMMARY),
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
          click: sendEventToRenderer(GENERAL_ACTIONS.ZOOM_RESET)
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+=',
          click: sendEventToRenderer(GENERAL_ACTIONS.ZOOM_IN)
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: sendEventToRenderer(GENERAL_ACTIONS.ZOOM_OUT)
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

  // Mac OS specific menu items
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