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
import { AddEntry, GetHistory } from '../../services/historyStore'
import { IMPORT_REPLY, JSON_IMPORT_REPLY_FORMAT, OPEN_DIALOG, SQLITE_IMPORT_REPLY_FORMAT } from '../../constants/IpcConnection';
import { Button } from 'react-bootstrap';

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
    const { updateCurrentPath, updateWorkbenchDB, importedFile } = useWorkbenchDB();

    const history = useMemo(() => GetHistory(), [importedFile]);
    useEffect(() => {
        console.log("History", GetHistory());
    }, [importedFile]);

    function jsonParser(jsonFilePath: string, sqliteFilePath: string, ){
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
        const workbenchDB = new WorkbenchDB({
            dbName: 'demo_schema',
            dbStorage: sqliteFilePath,
        });

        // const progressbar = new Progress('#content', {
        //     title: 'Creating Database...',
        //     size: 100,
        // });

        workbenchDB.sync
        // .then(() => progressbar.showDeterminate())
        .then(() => workbenchDB.addFromJson(
            jsonFilePath,
            workbenchVersion,
            (response: number) => { console.log("Import done with progress @", response, workbenchDB)},
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
            workbenchDB.sync
                .then((db) => db.File.findOne({ where: { parent: '#' }}))
                .then(root => {
                    if(!root){
                        console.log("Default path not found, trying after 2s !!");
                        setTimeout(() => {
                            // TODO -- There shouldn't be a need to do this timeout, this code 
                            // should be executed only when importing is completed 

                            // Try after 2s for large imports
                            workbenchDB.sync
                                .then(db => db.File.findOne({ where: { parent: '#' }}))
                                .then(root => {
                                    console.log("Root dir", root);
                                    const defaultPath = root.getDataValue('path');
                                    console.log("Root dir / default path", defaultPath);
            
                                    console.log("Go to table-view with db:", workbenchDB);
                                    updateWorkbenchDB(workbenchDB, sqliteFilePath)
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

                    console.log("Go to table-view with db:", workbenchDB);
                    updateWorkbenchDB(workbenchDB, sqliteFilePath)
                    navigate(ROUTES.TABLE_VIEW);

                    if(defaultPath)
                        updateCurrentPath(defaultPath);
                });
        });
    }
    useEffect(() => {
        ipcRenderer.removeAllListeners(IMPORT_REPLY.JSON);
        ipcRenderer.removeAllListeners(IMPORT_REPLY.SQLITE);

        ipcRenderer.on(IMPORT_REPLY.JSON, (_, message: JSON_IMPORT_REPLY_FORMAT) => {
            console.log("importing json:", message.jsonFilePath, message);
            jsonParser(message.jsonFilePath, message.sqliteFilePath);
        });
        ipcRenderer.on(IMPORT_REPLY.SQLITE, (_, message: SQLITE_IMPORT_REPLY_FORMAT) => {
            console.log("importing sqlite:", message.sqliteFilePath, message);
        });
        

        const AUTO_IMPORT_LAST_FILE = false;
        if(AUTO_IMPORT_LAST_FILE){
            const lastEntry = history[history.length - 1];
            jsonParser(lastEntry.json_path, lastEntry.sqlite_path);
        }

        return () => {
            ipcRenderer.removeAllListeners(IMPORT_REPLY.JSON);
            ipcRenderer.removeAllListeners(IMPORT_REPLY.SQLITE);
        }
    }, []);

    /** Import a ScanCode JSON file and create a SQLite database */
    function openJsonFile() {
        ipcRenderer.send(OPEN_DIALOG.JSON)
        console.log("Json file dialog opened");
        return;
    }
    function openSqliteFile() {
        ipcRenderer.send(OPEN_DIALOG.SQLITE)
        console.log("Sqlite file dialog opened");
        return;
    }

    return (
      <div>
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
                                { historyItem.json_path }
                                <span style={{ marginLeft: 20 }}>
                                    {moment(historyItem.opened_at).fromNow()}
                                </span>

                                <Button
                                    variant="light"
                                    className="mx-4"
                                    onClick={() =>
                                        jsonParser(
                                            historyItem.json_path,
                                            historyItem.sqlite_path
                                        )
                                    }
                                >
                                    {" <- "} Import
                                </Button>

                                {/* <button
                                    style={{ marginLeft: 25 }}
                                    onClick={() => jsonParser(
                                        historyItem.json_path,
                                        historyItem.sqlite_path,
                                    )}
                                >
                                    {' < -- '} Import
                                </button>  */}
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

export default Home