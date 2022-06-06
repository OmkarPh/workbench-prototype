import React from 'react'

import '../home.css';

const Home = () => {
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
                  <div className="icons">
                      <div id="import-json">
                          <i className="fa fa-cogs"></i>
                          <h4>Import ScanCode JSON</h4>
                      </div>
                      <div id="open-file">
                          <i className="fa fa-folder"></i> 
                          <h4>Open SQLite File</h4>
                      </div>
                      <div id="save-file">
                          <i className="fa fa-floppy-o"></i> 
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