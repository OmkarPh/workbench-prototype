import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as electronFs from "fs"
import * as electronOs from "os"
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


const Home = () => {
    console.log(electronOs.platform());
    const navigate = useNavigate();
    const { updateWorkbenchDB } = useWorkbenchDB();

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

            console.log("Final sqlitefile path", sqliteFilePath);

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
                () => { console.log("Import done !", workbenchDB)},
                // (progress) => progressbar.update(progress / 100)
            ))
            // .then(() => progressbar.hide())
            .then(() => {
                console.log("Go to table-view with db:", workbenchDB);
                updateWorkbenchDB(workbenchDB)
                navigate(ROUTES.TABLE_VIEW);
            });
        }
        ipcRenderer.removeAllListeners('import-reply');
        ipcRenderer.on('import-reply', (event, message) => {
            console.log("import reply in home.ts", message);
            sqliteParser(message.sqliteFilePath, message.jsonFilePath);
        });
        return () => {
            ipcRenderer.removeAllListeners('import-reply');
        }
    }, []);

    /** Import a ScanCode JSON file and create a SQLite database */
    function importJson() {
        console.log("Importing json guys");
        ipcRenderer.send('open-file-dialog')
        console.log("done");
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