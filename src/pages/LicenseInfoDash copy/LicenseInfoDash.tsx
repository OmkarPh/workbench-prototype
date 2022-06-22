import React, { useEffect, useState } from 'react'
import { Op } from 'sequelize';
import c3 from 'c3';

import { formatChartData } from '../../utils/format';
import { useWorkbenchDB } from '../../contexts/workbenchContext';
import { LEGEND_COLORS } from '../../constants/colors';
import { Row, Col } from 'react-bootstrap';

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
    console.log("DB updated");
    console.log(db, initialized);

    console.log('Selected path:',);

    db.sync
      .then((db) => db.File.findOne({ where: { id: 0 }}))
      .then(root => {
        console.log("Root dir path", root.getDataValue('path'), root);
        const rootPath = root.getDataValue('path');
        console.log({where: {path: {[Op.like]: `%${rootPath}%`}}});
        return db.sync.then(db => db.File.findAll({
          where: {path: {[Op.like]: `%${rootPath}%`}},
          // where: {path: {[Op.like]: `${rootPath}%`}},
          // attributes: ['id'],
        }))
      })
      .then(files => {
        console.log("all files", files)
        return files;
      })
      .then((files) => files.map(val => val.getDataValue('id')))
      .then((fileIds) => {
        console.log("FileIDs to work on: ", fileIds);

        // Query and prepare chart for license expression
        db.sync
          .then(db => db.LicenseExpression.findAll({where: { id: fileIds }}))
          .then((expressions) => expressions.map(val => val.getDataValue('license_expression') || 'No Value Detected'))
          .then((expressions) => {
            console.log("Pre processed expressions:", expressions);
            const { chartData: chartData } = formatChartData(expressions, 'expressions');
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

          // Query and prepare chart for license expression
          db.sync
            .then((db) => db.License.findAll({where: { id: fileIds }}))
            .then(licenses => {
              // Prepare aggregate data
              console.log('All licenses', licenses);
              
              const licenseFileIds = licenses.map((val) => val.getDataValue('fileId'));
              const spdxKeys = licenses.map((val) => val.getDataValue('spdx_license_key'));
              console.log("LicensefileIds", licenseFileIds);
              console.log("licensefileIds set", new Set(licenseFileIds));
              console.log("licensefileIds size", new Set(licenseFileIds).size);
              setScanData(oldScanData => ({
                ...oldScanData,
                totalLicenseFiles: (new Set(licenseFileIds)).size,
                totalSPDXLicenses: (new Set(spdxKeys)).size,
              }));

              return licenses;
            })
            .then((licenses) => licenses.map(val => val.getDataValue('key') || 'No Value Detected'))
            .then(keys => {
              const { chartData: chartData, untrimmedLength } = formatChartData(keys, 'keys');
              console.log("License keys:", chartData);
              console.log("licensekeys untrimmed length: ", untrimmedLength);
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
          
          // Query and prepare chart for license expression
          db.sync
            .then((db) => db.LicensePolicy.findAll({where: { id: fileIds }}))
            .then((licenses) => licenses.map(val => val.getDataValue('label') || 'No Value Detected'))
            .then(labels => {
              console.log("Policy", labels);
              const { chartData: chartData } = formatChartData(labels, 'policy');
              console.log("Policy formatted", chartData);
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
          File info dash here !!
        </h3>
      <br/><br/>
      <Row className="dash-cards">
        <Col sm={4}>
          <div className='card info-card'>
            <h4 className='value'>
              { scanData.totalLicenses || "...." }
            </h4>
            <h5 className='title'>
              Total licenses
            </h5>
          </div>
        </Col>
        <Col sm={4}>
          <div className='card info-card'>
            <h4 className='value'>
              { scanData.totalLicenseFiles || "...." }
            </h4>
            <h5 className='title'>
              Total files with licenses
            </h5>
          </div>
        </Col>
        <Col sm={4} >
          <div className='card info-card'>
            <h4 className='value'>
              { scanData.totalSPDXLicenses || "...." }
            </h4>
            <h5 className='title'>
              Total SPDX licenses
            </h5>
          </div>
        </Col>
      </Row>
      <br/><br/>
      <Row className="dash-cards">
        <Col sm={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              License expression
            </h5>
            <div id={LICENSE_EXP_ID} />
          </div>
        </Col>
        <Col sm={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              License keys
            </h5>
            <div id={LICENSE_KEYS_ID} />
          </div>
        </Col>
        <Col sm={4} >
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