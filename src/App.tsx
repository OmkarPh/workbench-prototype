import React from 'react'
import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from './components/Navbar/Navbar'
import Help from './pages/Help';
import Home from './pages/Home'

// import c3 from 'c3';
import 'startbootstrap-simple-sidebar/dist/css/styles.css';
import 'font-awesome/css/font-awesome.min.css';
import './app.css';
import Footer from './components/Footer/Footer';
import TemporaryPage from './pages/TemporaryPage';

const App = () => {
  return (
    <HashRouter>
    <Navbar />
    <div style={{ marginLeft: 80, minHeight: "100vh" }}>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="help" element={<Help />} />
          <Route path="table-view" element={<TemporaryPage text='Table view page' />} />
          <Route path="file-dashboard" element={<TemporaryPage text='File Info Dashboard' />} />
          <Route path="license-dashboard" element={<TemporaryPage text='License info dashboard ' />} />
          <Route path="package-dashboard" element={<TemporaryPage text='Package Info dashboard' />} />
          <Route path="chart-summary" element={<TemporaryPage text='Chart summary view' />} />
        </Route>
      </Routes>
      <Footer />
    </div>
  </HashRouter>
  )
}

export default App