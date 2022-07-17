import { ipcMain, dialog, app, BrowserWindow, Menu, MenuItem, shell, contextBridge, ipcRenderer } from 'electron';
import * as electronFs from "fs"
import * as electronOs from "os"
// import elec from '@electron/remote/main';
import packageJson from '../package.json';

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}
// app.allowRendererProcessReuse = false;

const createWindow = (): void => {
  // ipcMain.handle('dialog', (event, method, params) => {
  //   dialog[method](params);
  // });
  // contextBridge.exposeInMainWorld('electron', {
  //   openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config),
  //   // dialog: dialog
  // });
  // app.allowRendererProcessReuse = false;

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: "Scancode workbench Prototype",
    width: 1200,
    height: 800,
    icon: 'assets/app-icon/png/scwb_layered_01.png',
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      // nodeIntegrationInSubFrames: true,
      contextIsolation: false,
      // enable
      // enableRemoteModule: true,
    }
  });
  // remoteMain.enable(mainWindow.webContents);
  
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // open all URLs in default browser window
  // mainWindow.webContents.on('will-navigate', (event, url) => {
  //   event.preventDefault();
  //   shell.openExternal(url);
  // });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    Menu.setApplicationMenu(Menu.buildFromTemplate(getTemplate()));
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

/** Returns a 'lambda' that sends the event to the renderer process. */
function sendEventToRenderer(eventKey: string) {
  return (menuItem: MenuItem, currentWindow: BrowserWindow) => currentWindow.webContents.send(eventKey);
}

ipcMain.on('open-file-dialog', (event, arg) => {
  console.log("mylog", arg)

  dialog.showOpenDialog({
    title: 'Open a JSON File',
    filters: [{
        name: 'JSON File',
        extensions: ['json']
    }]
    }).then(({filePaths}) => {
        if (filePaths === undefined) {
          return;
        }
        const jsonFilePath = filePaths[0];
        let defaultPath;
        
        if (electronOs.platform() === 'linux') {
        //     // remove the .json (or other) extention of the path.
            defaultPath = jsonFilePath.substring(0, jsonFilePath.lastIndexOf('.')) + '.sqlite';
        } else {
        //     // FIXME: this is some ugly regex used to get filename with no extension.
        //     // see: https://stackoverflow.com/questions/4250364/how-to-trim-a-file-extension-from-a-string-in-javascript
            defaultPath = jsonFilePath.replace(/^.*[\\/]/, '').replace(/\.[^/.]+$/, '');
        }
        console.log("jsonFilePath", jsonFilePath);
        console.log("defaultPath", defaultPath);
        
        // Immediately ask for a SQLite to save and create the database
        dialog.showSaveDialog({
            title: 'Save a SQLite Database File',
            defaultPath: defaultPath,
            filters: [{
            name: 'SQLite File',
            extensions: ['sqlite']
            }]
        }).then((sqliteFile) => {
            const sqliteFilePath = sqliteFile.filePath;
            if (sqliteFilePath === undefined) {
              console.log("Sqlite file path isn't valid:", sqliteFilePath);
              return;
            }
            event.sender.send('import-reply', {
              jsonFilePath,
              sqliteFilePath
            });
        });
    });

})

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
          // TODO: make this version specific?
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