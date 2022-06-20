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

import 'startbootstrap-simple-sidebar/dist/css/styles.css';
import 'font-awesome/css/font-awesome.min.css';
import './app.css';
import TableView from './pages/TableView';
import LicenseInfoDash from './pages/LicenseInfoDash';

const App = () => {
  return (
    <WorkbenchDBProvider>
      <HashRouter>
      <Navbar2 />
      {/* <Navbar /> */}
      <div style={{ marginLeft: 80, minHeight: "100vh" }}>
        <Routes>
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="help" element={<Help />} />
            <Route path="table-view" element={<TableView />} />
            <Route path="file-dashboard" element={<TemporaryPage text='File Info Dashboard' />} />
            <Route path="license-dashboard" element={<LicenseInfoDash />} />
            <Route path="package-dashboard" element={<TemporaryPage text='Package Info dashboard' />} />
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