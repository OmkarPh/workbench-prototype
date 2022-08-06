import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'
import React, { useEffect, useMemo, useState } from 'react'
import * as electronFs from "fs"
import * as electronOs from "os"
// import sqlite3 from 'sqlite3'
import moment from 'moment';
// import remote from '@electron/remote'
// import remoteMain from '@electron/remote/main'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs, faFileImport, faFloppyDisk, faFolder } from '@fortawesome/free-solid-svg-icons'

import { useWorkbenchDB } from '../../contexts/workbenchContext'
import CoreButton from '../../components/CoreButton/CoreButton';

import { ROUTES } from '../../constants/routes'
import { AddEntry, GetHistory, HistoryItem, RemoveEntry } from '../../services/historyStore'
import { WorkbenchDB } from '../../services/workbenchDB'
import packageJson from '../../../package.json';

import {
  OPEN_DIALOG_CHANNEL,
  OPEN_ERROR_DIALOG_CHANNEL,
  IMPORT_REPLY_CHANNEL,
  SAVE_REPLY_CHANNEL, 
  JSON_IMPORT_REPLY_FORMAT,
  SQLITE_IMPORT_REPLY_FORMAT,
  SQLITE_SAVE_REPLY_FORMAT,
} from '../../constants/IpcConnection';

import { isSchemaChanged } from '../../utils/checks';

import './home.css'

const { version: workbenchVersion } = packageJson;
const electron = window.require("electron");
const { ipcRenderer } = electron;

// const electronDialog = remote.require('dialog');
console.log("Deps:", {
  electron,
  electronFs,
  electronOs,
  ipcRenderer,
  // remote,
  // sqlite3,
  // remoteMain,
});
console.log(electronOs.platform());

// const electronDialog = electron.dialog;
// console.log('electron.dialog', electronDialog);

// const sqlite3Window = window.require('sqlite3');
// console.log("Sqlite 3 required", sqlite3Window);
// console.log("Sqlite 3 imported === required", sqlite3Window === sqlite3);


const Home = () => {
  const navigate = useNavigate();
  const { db, updateCurrentPath, updateWorkbenchDB, importedSqliteFilePath } = useWorkbenchDB();
  
  const [refreshToken, setRefreshToken] = useState(0);
  const refreshHistory = () => setRefreshToken(Math.random());
  const history = useMemo(() => GetHistory(), [importedSqliteFilePath, db, refreshToken]);

  function sqliteParser(sqliteFilePath: string, preventNavigation?: boolean){
    // Create a new database when importing a sqlite file
    const newWorkbenchDB = new WorkbenchDB({
      dbName: 'workbench_db',
      dbStorage: sqliteFilePath
    });

    // Check that that the database schema matches current schema.
    newWorkbenchDB.sync
      .then((db) => db.Header.findAll())
      .then((headers) => {
        const infoHeader = headers[0];

        // Check that the database has the correct header information.
        if (!headers || headers.length === 0 || !infoHeader) {
          const errTitle = 'Invalid SQLite file';
          const errMessage = 'Invalid SQLite file: ' + sqliteFilePath + "\n" +
            'The SQLite file is invalid. Try re-importing the ScanCode JSON ' +
            'file and creating a new SQLite file.';

          console.error(
            "Handled invalid sqlite import",
            {
              title: errTitle,
              message: errMessage,
            }
          );

          ipcRenderer.send(
            OPEN_ERROR_DIALOG_CHANNEL,
            {
              title: errTitle,
              message: errMessage,
            }
          );
          return;
        }

        const dbVersion = infoHeader.getDataValue('workbench_version').toString({});
        
        if (!dbVersion || isSchemaChanged(dbVersion, workbenchVersion)) {
          const errTitle = 'Old SQLite schema found';
          const errMessage = 'Old SQLite schema found at file: ' + sqliteFilePath + "\n" +
          'The SQLite schema has been updated since the last time you loaded this file. \n\n' +
          'Some features may not work correctly until you re-import the original' +
          'ScanCode JSON file to create an updated SQLite database.';

          console.error(
            "Handled schema mismatch error when importing sqlite file ",
            {
              title: errTitle,
              message: errMessage,
            }
          );

          ipcRenderer.send(
            OPEN_ERROR_DIALOG_CHANNEL,
            {
              title: errTitle,
              message: errMessage,
            }
          );
          return;
        }

        AddEntry({
          sqlite_path: sqliteFilePath,
          opened_at: moment().format(),
        });

        newWorkbenchDB.sync
        .then(db => db.File.findOne({ where: { parent: '#' }}))
        .then(root => {
          if(!root){
            console.error("Root directory not found !!!!");
            console.error("Root:", root);
            return;
          }

          console.log("Root dir", root);
          const defaultPath = root.getDataValue('path');

          updateWorkbenchDB(newWorkbenchDB, sqliteFilePath)

          if(defaultPath)
            updateCurrentPath(defaultPath);
          
          if(!preventNavigation)
            navigate(ROUTES.TABLE_VIEW);
        });
      });
  }

  function jsonParser(jsonFilePath: string, sqliteFilePath: string, preventNavigation?: boolean){
    if (!sqliteFilePath || !jsonFilePath) {
      console.error("Sqlite or json file path isn't valid:", sqliteFilePath);
      return;
    }
      
    // Overwrite existing sqlite file
    if (electronFs.existsSync(sqliteFilePath)) {
      electronFs.unlink(sqliteFilePath, (err: Error) => {
        if (err) {
          throw err;
        }
        console.info(`Deleted ${sqliteFilePath}`);
      });
    }


    // Create a new database when importing a json file
    const newWorkbenchDB = new WorkbenchDB({
        dbName: 'demo_schema',
        dbStorage: sqliteFilePath,
    });

    // const progressbar = new Progress('#content', {
    //     title: 'Creating Database...',
    //     size: 100,
    // });

    newWorkbenchDB.sync
      // .then(() => progressbar.showDeterminate())
      .then(() => newWorkbenchDB.addFromJson(
        jsonFilePath,
        workbenchVersion,
        (response: number) => {
          console.log("Import progress @", response)
        },
        // (progress) => progressbar.update(progress / 100)
      ))
      // .then(() => progressbar.hide())
      .then(() => {
        console.log("JSON parsing completed");
        
        AddEntry({
          json_path: jsonFilePath,
          sqlite_path: sqliteFilePath,
          opened_at: moment().format(),
        });

        newWorkbenchDB.sync
          .then((db) => db.File.findOne({ where: { parent: '#' }}))
          .then(root => {
            if(!root){
              console.error("Root directory not found !!!!");
              console.error("Root:", root);
              return;
            }
            const defaultPath = root.getDataValue('path');
            console.log("Root dir", defaultPath);

            updateWorkbenchDB(newWorkbenchDB, sqliteFilePath)

            if(defaultPath)
              updateCurrentPath(defaultPath);

            if(!preventNavigation)
              navigate(ROUTES.TABLE_VIEW);
        });
      });
  }

  function ReportInvalidEntry(entry: HistoryItem, entryType: string){
    toast(`Selected ${entryType} file doesn't exist`, { type: 'error' });
    RemoveEntry(entry);
    refreshHistory();
  }
  function historyItemParser(historyItem: HistoryItem){
    if(historyItem.json_path){
      if (!electronFs.existsSync(historyItem.json_path)) {
        return ReportInvalidEntry(historyItem, "JSON");
      }
      jsonParser(historyItem.json_path, historyItem.sqlite_path);
    } else {
      if (!electronFs.existsSync(historyItem.sqlite_path)) {
        return ReportInvalidEntry(historyItem, "SQLite");
      }
      sqliteParser(historyItem.sqlite_path)
    }
  }

  function removeIpcListeners(){
    ipcRenderer.removeAllListeners(IMPORT_REPLY_CHANNEL.JSON);
    ipcRenderer.removeAllListeners(IMPORT_REPLY_CHANNEL.SQLITE);
    ipcRenderer.removeAllListeners(SAVE_REPLY_CHANNEL.SQLITE);
  }

  useEffect(() => {
    removeIpcListeners();

    ipcRenderer.on(IMPORT_REPLY_CHANNEL.JSON, (_, message: JSON_IMPORT_REPLY_FORMAT) => {
      jsonParser(message.jsonFilePath, message.sqliteFilePath);
    });
    ipcRenderer.on(IMPORT_REPLY_CHANNEL.SQLITE, (_, message: SQLITE_IMPORT_REPLY_FORMAT) => {
      sqliteParser(message.sqliteFilePath);
    });
    ipcRenderer.on(SAVE_REPLY_CHANNEL.SQLITE, (_, message: SQLITE_SAVE_REPLY_FORMAT) => {
      const newFileName = message?.sqliteFilePath;
      const oldFileName =
        (db?.sequelize as unknown as { options: { storage: string } }).options.storage;
      
      if (newFileName && oldFileName) {
        const reader = electronFs.createReadStream(oldFileName);
        const writer = electronFs.createWriteStream(newFileName);
        reader.pipe(writer);
        reader.on('end', () => {
          console.log("Saved", newFileName)
          sqliteParser(newFileName, true);
        });
      }
    });

    const AUTO_IMPORT_LAST_FILE = false;
    if(AUTO_IMPORT_LAST_FILE){
      const lastEntry = history[history.length - 1];
      historyItemParser(lastEntry);
    }

    return () => {
      removeIpcListeners();
    }
  }, []);

  // Import a ScanCode JSON file and create a SQLite database
  function openJsonFile() {
    ipcRenderer.send(OPEN_DIALOG_CHANNEL.JSON);
  }

  // Import already created SQLite database
  function openSqliteFile() {
    ipcRenderer.send(OPEN_DIALOG_CHANNEL.SQLITE);
  }

  // Copy already created/imported sqlite file to new sqlite file, and
  // update path of workbench DB to new sqlite DB
  function saveSqliteFile(){
    ipcRenderer.send(OPEN_DIALOG_CHANNEL.SAVE_SQLITE);
  }

  return (
    <div className="home-page">
      <div className="tab-pane" id="tab-welcomepage">
        <div id="welcomepage-container">
          <div id="welcomepage-title">
            <h2>ScanCode Workbench</h2>
          </div>
          <div id="welcomepage-view">
            <div className="quickActions">
              <div onClick={openJsonFile}>
                <FontAwesomeIcon icon={faCogs} className="quickActionIcon" />
                <h5>Import ScanCode JSON</h5>
              </div>
              <div onClick={openSqliteFile}>
                <FontAwesomeIcon
                  icon={faFolder}
                  className="quickActionIcon"
                />
                <h5>Open SQLite File</h5>
              </div>
              <div onClick={saveSqliteFile}>
                <FontAwesomeIcon
                  icon={faFloppyDisk}
                  className="quickActionIcon"
                />
                <h5>Save SQLite File</h5>
              </div>
            </div>
            <div className="history">
              <br/>
              <h4>Recent files </h4>
              <table>
                <tbody>
                {
                  history.map((historyItem, idx) => (
                    <tr key={historyItem.json_path + idx}>
                      <td>
                        <CoreButton onClick={() => historyItemParser(historyItem)}>
                          Import
                          <FontAwesomeIcon icon={faFileImport} />
                        </CoreButton>
                      </td>

                      <td className='file-path'>
                        { historyItem.json_path || historyItem.sqlite_path }
                      </td>

                      <td>
                        <span style={{ marginLeft: 20 }}>
                          {moment(historyItem.opened_at).fromNow()}
                        </span>
                      </td>
                    </tr>
                  ))
                }
                </tbody>
              </table>
            </div>
            <div className="quicklinks">
              <br/>
              <h4>Quick Links </h4>
              <div
                className="btn-group-horizontal"
                role="group"
              >
                <CoreButton
                  large
                  href="https://github.com/nexB/scancode-workbench/"
                >
                  GitHub Repository
                </CoreButton>
                <CoreButton
                  large
                  href="https://scancode-workbench.readthedocs.io/"
                >
                  Getting Started with Scancode Workbench
                </CoreButton>
                <CoreButton
                  large
                  href="https://github.com/nexB/scancode-workbench/issues"
                >
                  Report a Bug or Request a Feature
                </CoreButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;