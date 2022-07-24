import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as electronFs from "fs"
import * as electronOs from "os"
// import sqlite3 from 'sqlite3'
import remote from '@electron/remote'

import remoteMain from '@electron/remote/main'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs, faFloppyDisk, faFolder } from '@fortawesome/free-solid-svg-icons'

import packageJson from '../../package.json';

import { WorkbenchDB } from '../services/workbenchDB'

import '../home.css'
import { useWorkbenchDB } from '../contexts/workbenchContext'
import { ROUTES } from '../constants/routes'

const { version: workbenchVersion } = packageJson;
const electron = window.require("electron");
const { ipcRenderer } = electron;

// const electronDialog = remote.require('dialog');
console.log("Electron", electron);
console.log('ipcrenderer', ipcRenderer);
console.log('remote', remote);
console.log('remotemain', remoteMain);
const electronDialog = electron.dialog;
console.log('electron.dialog', electronDialog);

console.log("FS", electronFs);
console.log("OS", electronOs);
// console.log("Sqlite 3 imported ", sqlite3);

// const sqlite3Window = window.require('sqlite3');
// console.log("Sqlite 3 required", sqlite3Window);
// console.log("Sqlite 3 imported === required", sqlite3Window === sqlite3);


const Home = () => {
    console.log(electronOs.platform());
    const navigate = useNavigate();
    const { updateCurrentPath, updateWorkbenchDB } = useWorkbenchDB();

    useEffect(() => {
        function sqliteParser(sqliteFilePath: string, jsonFilePath: string){
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
                
                // workbenchDB.sync
                //     .then(db => db.File.findAll().then(files => console.log(files)));
                

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
        ipcRenderer.removeAllListeners('import-reply');
        ipcRenderer.on('import-reply', (_, message) => {
            console.log("importing file:", message.jsonFilePath, message);
            sqliteParser(message.sqliteFilePath, message.jsonFilePath);
        });
        return () => {
            ipcRenderer.removeAllListeners('import-reply');
        }
    }, []);

    /** Import a ScanCode JSON file and create a SQLite database */
    function importJson() {
        ipcRenderer.send('open-file-dialog')
        console.log("Open file dialog opened");
        return;
    }

    return (
        <div>
        <br/><br/>

        {/* Welcome Page  */}
        <div className="tab-pane" id="tab-welcomepage">
            <div id="welcomepage-container">
                <div id="welcomepage-title">
                    <h1>Welcome to ScanCode Workbench</h1>
                </div>
                <div id="welcomepage-view">
                    <div className="quickActions">
                        <div id="import-json" onClick={importJson}>
                            <FontAwesomeIcon icon={faCogs}  className="quickActionIcon" />
                            <h4>Import ScanCode JSON</h4>
                        </div>
                        <div id="open-file">
                            <FontAwesomeIcon icon={faFolder} className="quickActionIcon"/>
                            <h4>Open SQLite File</h4>
                        </div>
                        <div id="save-file">
                            <FontAwesomeIcon icon={faFloppyDisk} className="quickActionIcon"/>
                            <h4>Save SQLite File</h4>
                        </div>
                    </div>
                    <div className="quicklinks">
                        <h3>Quick Links: </h3>
                        <div className="btn-group-horizontal" role="group" aria-label="...">
                            <a href="https://github.com/nexB/scancode-workbench/" className="btn btn-lg btn-default">GitHub Repository</a>
                            <a href="https://scancode-workbench.readthedocs.io/" className="btn btn-lg btn-default">Getting Started with Scancode Workbench</a>
                            <a href="https://github.com/nexB/scancode-workbench/issues" className="btn btn-lg btn-default">Report a Bug or Request a Feature</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}

export default Home