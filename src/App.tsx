import React from 'react'
import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";

import Help from './pages/Help';
import Home from './pages/Home'

// import c3 from 'c3';

import Footer from './components/Footer/Footer';
import TemporaryPage from './pages/TemporaryPage';
import Navbar2 from './components/Navbar/Navbar2';
import { WorkbenchDBProvider } from './contexts/workbenchContext';

import TableView from './pages/TableView';
import LicenseInfoDash from './pages/LicenseInfoDash/LicenseInfoDash';

import 'startbootstrap-simple-sidebar/dist/css/styles.css';
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import './app.css';
import './dashStyles.css';
import FileInfoDash from './pages/FileInfoDash/FileInfoDash';
import PackageInfoDash from './pages/PackageInfoDash/PackageInfoDash';

const App = () => {
  return (
    <WorkbenchDBProvider>
      <HashRouter>
      <Navbar2 />
      {/* <Navbar /> */}
      {/* <FileTree style={{ marginLeft: 80, minHeight: "100vh" }} /> */}
      <div style={{ marginLeft: 80, minHeight: "100vh" }}>
        <Routes>
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="help" element={<Help />} />
            <Route path="table-view" element={<TableView />} />
            <Route path="file-dashboard" element={<FileInfoDash />} />
            <Route path="license-dashboard" element={<LicenseInfoDash />} />
            <Route path="package-dashboard" element={<PackageInfoDash />} />
            <Route path="chart-summary" element={<TemporaryPage text='Chart summary view' />} />
          </Route>
        </Routes>
        <Footer />
      </div>
    </HashRouter>
  </WorkbenchDBProvider>
  )
}

export default App