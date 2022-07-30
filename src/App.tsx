import React from 'react'
import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";

import { ROUTES } from './constants/routes';
import { WorkbenchDBProvider } from './contexts/workbenchContext';

import Layout from './components/Layout/Layout';
import TemporaryPage from './pages/TemporaryPage';

import Help from './pages/Help';
import Home from './pages/Home/Home'
import TableViewAG from './pages/TableView/TableView';
import ChartView from './pages/ChartView/ChartView';
import FileInfoDash from './pages/FileInfoDash/FileInfoDash';
import LicenseInfoDash from './pages/LicenseInfoDash/LicenseInfoDash';
import PackageInfoDash from './pages/PackageInfoDash/PackageInfoDash';

import './fontawesome';
import 'rc-tree/assets/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'startbootstrap-simple-sidebar/dist/css/styles.css';

import './app.css';
import './dashStyles.css';


const App = () => {
  return (
    <WorkbenchDBProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path={ROUTES.HOME}>
              <Route index element={<Home />} />
              <Route path={ROUTES.HELP} element={<Help />} />
              <Route path={ROUTES.TABLE_VIEW} element={<TableViewAG />} />
              <Route path={ROUTES.FILE_DASHBOARD} element={<FileInfoDash />} />
              <Route path={ROUTES.LICENSE_DASHBOARD} element={<LicenseInfoDash />} />
              <Route path={ROUTES.PACKAGE_DASHBOARD} element={<PackageInfoDash />} />
              <Route path={ROUTES.CHART_SUMMARY} element={<ChartView />} />
              <Route element={<TemporaryPage text='4 0 4 ¯\_(ツ)_/¯' />} />
            </Route>
          </Routes>
        </Layout>
      </HashRouter>
    </WorkbenchDBProvider>
  )
}

export default App