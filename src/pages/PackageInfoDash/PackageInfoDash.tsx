import { Op } from 'sequelize';
import { Row, Col } from 'react-bootstrap';
import React, { useEffect, useState } from 'react'

import { formatChartData } from '../../utils/pie';
import { useWorkbenchDB } from '../../contexts/workbenchContext';
import PieChart from '../../components/PieChart/PieChart';

interface ScanData {
  totalPackages: number | null,
}

import "./PackageInfoDash.css";

const PackageInfoDash = () => {

  const workbenchDB = useWorkbenchDB();
  const [packageTypeData, setPackageTypeData] = useState(null);
  const [packageLangData, setPackageLangData] = useState(null);
  const [packageLicenseData, setPackageLicenseData] = useState(null);
  const [scanData, setScanData] = useState<ScanData>({
    totalPackages: null,
  })
  
  useEffect(() => {
    const { db, initialized, currentPath } = workbenchDB;
    
    if(!initialized || !db || !currentPath)
      return;

    db.sync.then(db => db.File.findAll({
      where: {
        path: {
          [Op.or]: [
            { [Op.like]: `${currentPath}`},      // Matches a file / directory.
            { [Op.like]: `${currentPath}/%`}  // Matches all its children (if any).
          ]
        }
      },
      // attributes: ['id'],
    }))
      .then((files) =>{
        const fileIDs = files.map(file => file.getDataValue('id'));
        // console.log("Files to work on: ", files.map(file => file.get({ plain: true })));
        // console.log("Files ids to work on: ", fileIDs);
        
        // Query and prepare chart for package types
        db.sync
          .then(db => db.Package.findAll({where: { fileId: fileIDs }}))
          .then(packages => {
            // Prepare count of total packages
            // console.log("All packages", packages.map(pkg => pkg.get({ plain: true })));
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
            setPackageTypeData(packageTypesChartData);

            // Prepare chart for package languages
            const packageLangs = packages.map(
              packageEntry => packageEntry.getDataValue('primary_language') || 'No Value Detected'
            );
            const { chartData: packageLangsChartData } = formatChartData(packageLangs, 'package langs');
            console.log("Result packages languages:", packageLangsChartData);
            setPackageLangData(packageLangsChartData);

            // Prepare chart for package license expression
            const packageLicenseExp = packages.map(
              packageEntry => packageEntry.getDataValue('license_expression') || 'No Value Detected'
            );
            const { chartData: packageLicenseExpChartData } = 
              formatChartData(packageLicenseExp, 'package license exp');
            
            console.log("Result packages license exp:", packageLicenseExpChartData);
            setPackageLicenseData(packageLicenseExpChartData);
          });
      });
  }, [workbenchDB]);

  return (
    <div className='text-center'>
      <br/>
        <h3>
          Package info - { workbenchDB.currentPath || ""}
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
            <PieChart chartData={packageTypeData} />
          </div>
        </Col>
        <Col sm={6} md={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              Package languages
            </h5>
            <PieChart chartData={packageLangData} />
          </div>
        </Col>
        <Col sm={6} md={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              Package Licenses
            </h5>
            <PieChart chartData={packageLicenseData} />
          </div>
        </Col>
      </Row>
      <br/><br/>
    </div>
  )
}

export default PackageInfoDash