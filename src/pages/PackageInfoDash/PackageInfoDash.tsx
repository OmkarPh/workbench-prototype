import c3 from 'c3';
import { Op } from 'sequelize';
import { Row, Col } from 'react-bootstrap';
import React, { useEffect, useState } from 'react'

import { formatChartData } from '../../utils/format';
import { LEGEND_COLORS } from '../../constants/colors';
import { useWorkbenchDB } from '../../contexts/workbenchContext';

const PACKAGE_TYPE_ID = "package-type-chart";
const PACKAGE_LANG_ID = "package-language-chart";
const PACKAGE_LICENSE_ID = "package-license-chart";

interface ScanData {
  totalPackages: number | null,
}

import "./PackageInfoDash.css";

const PackageInfoDash = () => {

  const workbenchDB = useWorkbenchDB();
  const [scanData, setScanData] = useState<ScanData>({
    totalPackages: null,
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

        // Query and prepare chart for package types
        db.sync
          .then(db => db.Package.findAll({where: { id: fileIDs }}))
          .then(packages => {
            // Prepare count of total packages
            console.log("All packages", packages);
            setScanData({ totalPackages: packages.length });
            return packages;
          })
          .then((packages) => {
            // Prepare chart for package types
            const packageTypes = packages.map(
              packageEntry => packageEntry.getDataValue('type') || 'No Value Detected'
            );
            const { chartData: packageTypesChartData } = formatChartData(packageTypes, 'package types');
            console.log("Result packages types:", packageTypesChartData);
            c3.generate({
              bindto: '#' + PACKAGE_TYPE_ID,
              data: {
                columns: packageTypesChartData,
                type : 'pie',
              },
              color: {
                pattern: LEGEND_COLORS,
              }
            });

            // Prepare chart for package languages
            const packageLangs = packages.map(
              packageEntry => packageEntry.getDataValue('primary_language') || 'No Value Detected'
            );
            const { chartData: packageLangsChartData } = formatChartData(packageLangs, 'package langs');
            console.log("Result packages languages:", packageLangsChartData);
            c3.generate({
              bindto: '#' + PACKAGE_LANG_ID,
              data: {
                columns: packageLangsChartData,
                type : 'pie',
              },
              color: {
                pattern: LEGEND_COLORS,
              }
            });

            // Prepare chart for package license expression
            const packageLicenseExp = packages.map(
              packageEntry => packageEntry.getDataValue('license_expression') || 'No Value Detected'
            );
            const { chartData: packageLicenseExpChartData } = 
              formatChartData(packageLicenseExp, 'package license exp');
            console.log("Result packages license exp:", packageLicenseExpChartData);
            c3.generate({
              bindto: '#' + PACKAGE_LICENSE_ID,
              data: {
                columns: packageLicenseExpChartData,
                type : 'pie',
              },
              color: {
                pattern: LEGEND_COLORS,
              }
            });
          });
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
        <Col sm={4} >
          <div className='card info-card'>
            <h4 className='value'>
              {
                scanData.totalPackages !== null ?
                  scanData.totalPackages
                : "...."
              }
            </h4>
            <h5 className='title'>
              Total Number of packages
            </h5>
          </div>
        </Col>
      </Row>
      <br/><br/>
      <Row className="dash-cards">
        <Col sm={6} md={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              Package Types
            </h5>
            <div id={PACKAGE_TYPE_ID} />
          </div>
        </Col>
        <Col sm={6} md={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              Package languages
            </h5>
            <div id={PACKAGE_LANG_ID} />
          </div>
        </Col>
        <Col sm={6} md={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              Package Licenses
            </h5>
            <div id={PACKAGE_LICENSE_ID} />
          </div>
        </Col>
      </Row>
      <br/><br/>
    </div>
  )
}

export default PackageInfoDash