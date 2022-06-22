import c3 from 'c3';
import { Op } from 'sequelize';
import { Row, Col } from 'react-bootstrap';
import React, { useEffect, useState } from 'react'

import { formatChartData } from '../../utils/format';
import { LEGEND_COLORS } from '../../constants/colors';
import { useWorkbenchDB } from '../../contexts/workbenchContext';

const LICENSE_EXP_ID = "license-expression-chart";
const LICENSE_POLICY_ID = "license-policy-chart";
const LICENSE_KEYS_ID = "license-keys-chart";

interface ScanData {
  totalLicenses: number | null,
  totalLicenseFiles: number | null,
  totalSPDXLicenses: number | null,
}

import "./licenseInfoDash.css";

const LicenseInfoDash = () => {

  const workbenchDB = useWorkbenchDB();
  const [scanData, setScanData] = useState<ScanData>({
    totalLicenses: null,
    totalLicenseFiles: null,
    totalSPDXLicenses: null,
  })
  
  useEffect(() => {
    const { db, initialized } = workbenchDB;
    if(!initialized || !db)
      return;

    console.log("DB updated", db, initialized);

    db.sync
      .then((db) => db.File.findOne({ where: { id: 0 }}))
      .then(root => {
        console.log("Root dir", root);
        const rootPath = root.getDataValue('path');
        console.log("Root dir path", rootPath);
        console.log("Path query", {where: {path: {[Op.like]: `%${rootPath}%`}}});

        return db.sync.then(db => db.File.findAll({
          where: {path: {[Op.like]: `%${rootPath}%`}},
          // where: {path: {[Op.like]: `${rootPath}%`}},
          // attributes: ['id'],
        }))
      })
      .then((files) =>{
        const fileIDs = files.map(file => file.getDataValue('id'));
        console.log("FileIDs to work on: ", fileIDs);

        // Query and prepare chart for license expression
        db.sync
          .then(db => db.LicenseExpression.findAll({where: { id: fileIDs }}))
          .then((expressions) => expressions.map(
            expression => expression.getDataValue('license_expression') || 'No Value Detected'
          ))
          .then((expressions) => {
            // Prepare chart for license expressions
            const { chartData } = formatChartData(expressions, 'expressions');
            console.log("Result expressions:", chartData);
            c3.generate({
              bindto: '#' + LICENSE_EXP_ID,
              data: {
                columns: chartData,
                type : 'pie',
              },
              color: {
                pattern: LEGEND_COLORS,
              }
            });
          });

        // Query and prepare chart for license keys
        db.sync
          .then((db) => db.License.findAll({where: { id: fileIDs }}))
          .then(licenses => {

            // Prepare aggregate data
            const licenseFileIDs = licenses.map((val) => val.getDataValue('fileId'));
            const spdxKeys = licenses.map((val) => val.getDataValue('spdx_license_key'));
            
            console.log('All licenses', licenses);
            console.log("LicensefileIds", licenseFileIDs);

            setScanData(oldScanData => ({
              ...oldScanData,
              totalLicenseFiles: (new Set(licenseFileIDs)).size,
              totalSPDXLicenses: (new Set(spdxKeys)).size,
            }));

            return licenses;
          })
          .then((licenses) => licenses.map(val => val.getDataValue('key') || 'No Value Detected'))
          .then(keys => {
            // Prepare chart for license keys
            const { chartData, untrimmedLength } = formatChartData(keys, 'keys');
            console.log("License keys:", chartData);
            console.log("licensekeys untrimmed length: ", untrimmedLength);

            // Prepare aggregate data
            setScanData(oldScanData => ({...oldScanData, totalLicenses: untrimmedLength}));

            c3.generate({
              bindto: '#' + LICENSE_KEYS_ID,
              data: {
                columns: chartData,
                type : 'pie',
              },
              color: {
                pattern: LEGEND_COLORS,
              }
            });
          })
          
        // Query and prepare chart for license policy
        db.sync
          .then((db) => db.LicensePolicy.findAll({where: { id: fileIDs }}))
          .then((licenses) => licenses.map(val => val.getDataValue('label') || 'No Value Detected'))
          .then(labels => {
            const { chartData } = formatChartData(labels, 'policy');
            console.log("Result License policy formatted", chartData);
            c3.generate({
              bindto: '#' + LICENSE_POLICY_ID,
              data: {
                columns: chartData,
                type : 'pie',
              },
              color: {
                pattern: LEGEND_COLORS,
              }
            });
          })
      });
  }, [workbenchDB]);

  return (
    <div className='text-center'>
      <br/><br/>
        <h3>
          License info - {'{path}'}
        </h3>
      <br/><br/>
      <Row className="dash-cards">
        <Col sm={4}>
          <div className='card info-card'>
            <h4 className='value'>
              {
                scanData.totalLicenses !== null ?
                  scanData.totalLicenses
                : "...."
              }
            </h4>
            <h5 className='title'>
              Total licenses
            </h5>
          </div>
        </Col>
        <Col sm={4}>
          <div className='card info-card'>
            <h4 className='value'>
              {
                scanData.totalLicenseFiles !== null ?
                  scanData.totalLicenseFiles
                : "...."
              }
            </h4>
            <h5 className='title'>
              Total files with licenses
            </h5>
          </div>
        </Col>
        <Col sm={4} >
          <div className='card info-card'>
            <h4 className='value'>
              {
                scanData.totalSPDXLicenses !== null ?
                  scanData.totalSPDXLicenses
                : "...."
              }
            </h4>
            <h5 className='title'>
              Total SPDX licenses
            </h5>
          </div>
        </Col>
      </Row>
      <br/><br/>
      <Row className="dash-cards">
        <Col sm={6} md={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              License expression
            </h5>
            <div id={LICENSE_EXP_ID} />
          </div>
        </Col>
        <Col sm={6} md={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              License keys
            </h5>
            <div id={LICENSE_KEYS_ID} />
          </div>
        </Col>
        <Col sm={6} md={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              License policy
            </h5>
            <div id={LICENSE_POLICY_ID} />
          </div>
        </Col>
      </Row>
      <br/><br/>
    </div>
  )
}

export default LicenseInfoDash