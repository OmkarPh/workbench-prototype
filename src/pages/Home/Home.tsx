import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import * as electronFs from "fs"
import * as electronOs from "os"
// import sqlite3 from 'sqlite3'
import moment from 'moment';
// import remote from '@electron/remote'
// import remoteMain from '@electron/remote/main'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs, faFloppyDisk, faFolder } from '@fortawesome/free-solid-svg-icons'

import packageJson from '../../../package.json';

import { WorkbenchDB } from '../../services/workbenchDB'

import './home.css'
import { useWorkbenchDB } from '../../contexts/workbenchContext'
import { ROUTES } from '../../constants/routes'
import { AddEntry, GetHistory, HistoryItem } from '../../services/historyStore'
import { IMPORT_REPLY_CHANNEL, JSON_IMPORT_REPLY_FORMAT, OPEN_DIALOG_CHANNEL, OPEN_ERROR_DIALOG_CHANNEL, SQLITE_IMPORT_REPLY_FORMAT } from '../../constants/IpcConnection';
import { Button } from 'react-bootstrap';
import { isSchemaChanged } from '../../utils/checks';

const { version: workbenchVersion } = packageJson;
const electron = window.require("electron");
const { ipcRenderer } = electron;

// const electronDialog = remote.require('dialog');
console.log("Electron", electron);
console.log('ipcrenderer', ipcRenderer);
// console.log('remote', remote);
// console.log('remotemain', remoteMain);
// const electronDialog = electron.dialog;
// console.log('electron.dialog', electronDialog);

console.log("FS", electronFs);
console.log("OS", electronOs);
// console.log("Sqlite 3 imported ", sqlite3);

// const sqlite3Window = window.require('sqlite3');
// console.log("Sqlite 3 required", sqlite3Window);
// console.log("Sqlite 3 imported === required", sqlite3Window === sqlite3);


const Home = () => {
  console.log(electronOs.platform());
  const navigate = useNavigate();
  const { updateCurrentPath, updateWorkbenchDB, importedSqliteFilePath } = useWorkbenchDB();


  const history = useMemo(() => GetHistory(), [importedSqliteFilePath]);
  useEffect(() => {
      console.log("History", GetHistory());
  }, [importedSqliteFilePath]);

  function sqliteParser(sqliteFilePath: string){
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
        console.log(dbVersion, typeof dbVersion);
        console.log(workbenchVersion, typeof workbenchVersion);
        
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

        console.log("Storing history");
        AddEntry({
          sqlite_path: sqliteFilePath,
          opened_at: moment().format(),
        });

        newWorkbenchDB.sync
        .then(db => db.File.findOne({ where: { parent: '#' }}))
        .then(root => {
          console.log("Root dir", root);
          const defaultPath = root.getDataValue('path');
          console.log("Root dir / default path", defaultPath);

          console.log("Go to table-view with db:", newWorkbenchDB);
          updateWorkbenchDB(newWorkbenchDB, sqliteFilePath)
          navigate(ROUTES.TABLE_VIEW);

          if(defaultPath)
              updateCurrentPath(defaultPath);
        });
      });
  }

  function jsonParser(jsonFilePath: string, sqliteFilePath: string){
    if (!sqliteFilePath || !jsonFilePath) {
      console.log("Sqlite or json file path isn't valid:", sqliteFilePath);
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

    console.log("SQlitefile path", sqliteFilePath);

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
        (response: number) => { console.log("Import done with progress @", response, newWorkbenchDB)},
        // (progress) => progressbar.update(progress / 100)
      ))
      // .then(() => {
      //     return new Promise<void>((resolve) => {
      //         setTimeout(() => {
      //             console.log("Wait completed");
      //             resolve();
      //         }, 2000);
      //     })
      // })
      // .then(() => progressbar.hide())
      .then(() => {
        console.log("add from json resolved");

        console.log("Storing history");
        AddEntry({
          json_path: jsonFilePath,
          sqlite_path: sqliteFilePath,
          opened_at: moment().format(),
        });

        console.log("Finding default path");
        newWorkbenchDB.sync
          .then((db) => db.File.findOne({ where: { parent: '#' }}))
          .then(root => {
            if(!root){
              console.log("Default path not found, trying after 2s !!");
              setTimeout(() => {
                  // TODO -- There shouldn't be a need to do this timeout, this code 
                  // should be executed only when importing is completed 

                  // Try after 2s for large imports
                  newWorkbenchDB.sync
                      .then(db => db.File.findOne({ where: { parent: '#' }}))
                      .then(root => {
                          console.log("Root dir", root);
                          const defaultPath = root.getDataValue('path');
                          console.log("Root dir / default path", defaultPath);
  
                          console.log("Go to table-view with db:", newWorkbenchDB);
                          updateWorkbenchDB(newWorkbenchDB, sqliteFilePath)
                          navigate(ROUTES.TABLE_VIEW);
  
                          if(defaultPath)
                              updateCurrentPath(defaultPath);
                      });
              }, 2000)
              return;
            }
            console.log("Root dir", root);
            const defaultPath = root.getDataValue('path');
            console.log("Root dir / default path", defaultPath);

            console.log("Go to table-view with db:", newWorkbenchDB);
            updateWorkbenchDB(newWorkbenchDB, sqliteFilePath)
            navigate(ROUTES.TABLE_VIEW);

            if(defaultPath)
              updateCurrentPath(defaultPath);
          });
      });
  }

  function historyItemParser(historyItem: HistoryItem){
    if(historyItem.json_path){
      console.log("Attempting json import", historyItem);
      jsonParser(historyItem.json_path, historyItem.sqlite_path);
    } else {
      console.log("Attempting sqlite import", historyItem);
      sqliteParser(historyItem.sqlite_path)
    }
  }

  function removeIpcListeners(){
    ipcRenderer.removeAllListeners(IMPORT_REPLY_CHANNEL.JSON);
    ipcRenderer.removeAllListeners(IMPORT_REPLY_CHANNEL.SQLITE);
  }

  useEffect(() => {
    removeIpcListeners();

    ipcRenderer.on(IMPORT_REPLY_CHANNEL.JSON, (_, message: JSON_IMPORT_REPLY_FORMAT) => {
      console.log("importing json:", message.jsonFilePath, message);
      jsonParser(message.jsonFilePath, message.sqliteFilePath);
    });
    ipcRenderer.on(IMPORT_REPLY_CHANNEL.SQLITE, (_, message: SQLITE_IMPORT_REPLY_FORMAT) => {
      console.log("importing sqlite:", message.sqliteFilePath, message);
      sqliteParser(message.sqliteFilePath);
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
    console.log("Json file dialog opened");
    return;
  }

  // Import already created SQLite database
  function openSqliteFile() {
    ipcRenderer.send(OPEN_DIALOG_CHANNEL.SQLITE);
    console.log("Sqlite file dialog opened");
    return;
  }

  return (
    <div className="home-page">
      <div className="tab-pane" id="tab-welcomepage">
        <div id="welcomepage-container">
          <div id="welcomepage-title">
            <h1>Welcome to ScanCode Workbench !!</h1>
          </div>
          <div id="welcomepage-view">
            <div className="quickActions">
              <div id="import-json" onClick={openJsonFile}>
                <FontAwesomeIcon icon={faCogs} className="quickActionIcon" />
                <h5>Import ScanCode JSON</h5>
              </div>
              <div id="open-file" onClick={openSqliteFile}>
                <FontAwesomeIcon
                  icon={faFolder}
                  className="quickActionIcon"
                />
                <h5>Open SQLite File</h5>
              </div>
              <div id="save-file">
                <FontAwesomeIcon
                  icon={faFloppyDisk}
                  className="quickActionIcon"
                />
                <h5>Save SQLite File</h5>
              </div>
            </div>
            <div className="history">
              <h5>Recent files</h5>
              <ul>
                {
                  history.map((historyItem, idx) => (
                    <li
                      style={{ marginBottom: 10 }}
                      key={historyItem.json_path + idx}
                    >
                      { historyItem.json_path || historyItem.sqlite_path }
                      <span style={{ marginLeft: 20 }}>
                        {moment(historyItem.opened_at).fromNow()}
                      </span>

                      <Button
                        variant="light"
                        className="mx-4"
                        onClick={() => historyItemParser(historyItem)}
                      >
                        {" <- "} Import
                      </Button>
                    </li>
                  ))
                }
              </ul>
            </div>
            <div className="quicklinks">
              <h3>Quick Links: </h3>
              <div
                className="btn-group-horizontal"
                role="group"
              >
                <Button
                  variant='light'
                  size='lg'
                  href="https://github.com/nexB/scancode-workbench/"
                >
                  GitHub Repository
                </Button>
                <Button
                  variant='light'
                  size='lg'
                  href="https://scancode-workbench.readthedocs.io/"
                >
                  Getting Started with Scancode Workbench
                </Button>
                <Button
                  variant='light'
                  size='lg'
                  href="https://github.com/nexB/scancode-workbench/issues"
                >
                  Report a Bug or Request a Feature
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;