import React from 'react'
import { Link } from 'react-router-dom'

const NavbarLegacy = () => {
  return (
    <div>
      Navbar
      <Link to="/">
        Home
      </Link>
      <Link to="/help">
        Help
      </Link>
      <br/><br/>


      {/* Sidebar */}
      <div id="sidebar-wrapper">
          <ul className="sidebar-nav">
              <li id="show-tab-welcomepage" data-toggle="tab" data-target="#tab-welcomepage" data-placement="right" title="Welcome Page">
                  <button className="btn btn-sidebar">
                      <i className="fa fa-home" aria-hidden="true"></i>
                  </button>
                  <p className="sidebar-nav-p">Welcome Page</p>
              </li>
              <li id="show-tab-scandata" data-toggle="tab" data-target="#tab-scandata" data-placement="right" title="Table View">
                  <button className="btn btn-sidebar">
                      <i className="fa fa-table" aria-hidden="true"></i>
                  </button>
                  <p className="sidebar-nav-p">Table View</p>
              </li>
              <li id="show-tab-file-dashboard" data-toggle="tab" data-target="#tab-file-dashboard" data-placement="right" title="File Info Dashboard">
                  <button className="btn btn-sidebar">
                      <i className="fa fa-info-circle" aria-hidden="true"></i>
                  </button>
                  <p className="sidebar-nav-p">File Info Dashboard</p>
              </li>
              <li id="show-tab-license-dashboard" data-toggle="tab" data-target="#tab-license-dashboard" data-placement="right" title="License Info Dashboard">
                  <button className="btn btn-sidebar">
                      <i className="fa fa-gavel" aria-hidden="true"></i>
                  </button>
                  <p className="sidebar-nav-p">License Info Dashboard</p>
              </li>
              <li id="show-tab-package-dashboard" data-toggle="tab" data-target="#tab-package-dashboard" data-placement="right" title="Package Info Dashboard">
                  <button className="btn btn-sidebar">
                      <i className="fa fa-archive" aria-hidden="true"></i>
                  </button>
                  <p className="sidebar-nav-p">Package Info Dashboard</p>
              </li>
              <li id="show-tab-barchart" data-toggle="tab" data-target="#tab-barchart" data-placement="right" title="Chart Summary View">
                  <button className="btn btn-sidebar">
                      <i className="fa fa-bar-chart" aria-hidden="true"></i>
                  </button>
                  <p className="sidebar-nav-p">Chart Summary View</p>
              </li>
              <li id="show-tab-conclusion" data-toggle="tab" data-target="#tab-conclusion" data-placement="right" title="Conclusion View">
                  <button className="btn btn-sidebar">
                      <i className="fa fa-list-ol" aria-hidden="true"></i>
                  </button>
                  <p className="sidebar-nav-p">Conclusion View</p>
              </li>
              <li id="show-help" data-toggle="modal" data-placement="right" title="Help with Application" data-target="#helpModal">
                  <button className="btn btn-sidebar">
                      <i className="fa fa-question" aria-hidden="true"></i>
                  </button>
                  <p className="sidebar-nav-p">Help with Application</p>
              </li>
          </ul>
          <button className="btn btn-sidebar" id="toggle-btn">
              <i className="fa fa-bars" aria-hidden="true"></i>
          </button>
      </div>
    </div>
  )
}

export default NavbarLegacy