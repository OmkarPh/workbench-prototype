import React, { useEffect, useState } from 'react'
import { Op } from 'sequelize';
import c3 from 'c3';

import { formatChartData } from '../../utils/format';
import { useWorkbenchDB } from '../../contexts/workbenchContext';
import { LEGEND_COLORS } from '../../constants/colors';
import { Row, Col } from 'react-bootstrap';

const PROG_LANGS_ID = "programming-languages-id";
const FILE_TYPES_ID = "file-types-chart";
const COPYRIGHT_HOLDERS_ID = "copyright-holders-chart";

interface ScanData {
  totalFiles: number | null,
  totalDirectories: number | null,
  totalUniqueCopyrightHolders: number | null,
}

import "./FileInfoDash.css";

const FileInfoDash = () => {

  const workbenchDB = useWorkbenchDB();
  const [scanData, setScanData] = useState<ScanData>({
    totalFiles: null,
    totalDirectories: null,
    totalUniqueCopyrightHolders: null,
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
        console.log("Root dir", root);
        console.log("Root dir path", root, root.getDataValue('path'));
        const rootPath = root.getDataValue('path');
        console.log({where: {path: {[Op.like]: `%${rootPath}%`}}});


        const filesCount = root.getDataValue('type').toString({}) === 'directory' ? root.getDataValue('files_count') : 1;
        const dirsCount = root.getDataValue('type').toString({}) === 'directory' ? root.getDataValue('dirs_count') : 0;
        setScanData(oldScanData => ({
          ...oldScanData,
          totalFiles: Number(filesCount),
          totalDirectories: Number(dirsCount),
        }));


        return db.sync.then(db => db.File.findAll({
          where: {path: {[Op.like]: `%${rootPath}%`}},
          // where: {path: {[Op.like]: `${rootPath}%`}},
          // attributes: ['id'],
        }))
      })
      .then(files => {
        console.log("all files", files);

        // Prepare chart for file types
        const fileTypes = files.map(file => file.getDataValue('mime_type') || 'No Value Detected');
        const { chartData: fileTypesChartData } = formatChartData(fileTypes, 'file-types');
        c3.generate({
          bindto: '#' + FILE_TYPES_ID,
          data: {
            columns: fileTypesChartData,
            type : 'pie',
          },
          color: {
            pattern: LEGEND_COLORS,
          }
        });

      // Prepare chart for programming languages
        const langs = files.map(val => val.getDataValue('programming_language') || 'No Value Detected');
        const { chartData: langsChartData } = formatChartData(langs, 'programming-langs');
        c3.generate({
          bindto: '#' + PROG_LANGS_ID,
          data: {
            columns: langsChartData,
            type : 'pie',
          },
          color: {
            pattern: LEGEND_COLORS,
          }
        });

        return files;
      })
      .then((files) => files.map(val => val.getDataValue('id')))
      .then((fileIds) => {
        console.log("FileIDs to work on: ", fileIds);

        // Query and prepare chart for copyright holders
        db.sync
          .then((db) => db.Copyright.findAll({where: { id: fileIds }}))
          .then(copyrights => copyrights.map(
            copyright => copyright.getDataValue('holders') || 'No Value Detected'
          ))
          .then(copyrightHolders => {
            console.log("Copyright holders", copyrightHolders);
            setScanData(oldScanData => ({
              ...oldScanData,
              totalUniqueCopyrightHolders: new Set(copyrightHolders).size
            }));
            
            const { chartData } = formatChartData(copyrightHolders, 'policy');
            console.log("Copyright formatted", chartData);
            c3.generate({
              bindto: '#' + COPYRIGHT_HOLDERS_ID,
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
          File info - {'{path}'}
        </h3>
      <br/><br/>
      <Row className="dash-cards">
        <Col sm={4}>
          <div className='card info-card'>
            <h4 className='value'>
              { scanData.totalFiles || "...." }
            </h4>
            <h5 className='title'>
              Total Number of Files
            </h5>
          </div>
        </Col>
        <Col sm={4}>
          <div className='card info-card'>
            <h4 className='value'>
              { scanData.totalDirectories || "...." }
            </h4>
            <h5 className='title'>
              Total Number of Directories
            </h5>
          </div>
        </Col>
        <Col sm={6} md={4}>
          <div className='card info-card'>
            <h4 className='value'>
              { scanData.totalUniqueCopyrightHolders || "...." }
            </h4>
            <h5 className='title'>
              Unique Copyright Holders Detected
            </h5>
          </div>
        </Col>
      </Row>
      <br/><br/>
      <Row className="dash-cards">
        <Col sm={6} md={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              Programming languages
            </h5>
            <div id={PROG_LANGS_ID} />
          </div>
        </Col>
        <Col sm={6} md={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              File types
            </h5>
            <div id={FILE_TYPES_ID} />
          </div>
        </Col>
        <Col sm={6} md={4}>
          <div className='card chart-card'>
            <h5 className='title'>
              Copyright holders
            </h5>
            <div id={COPYRIGHT_HOLDERS_ID} />
          </div>
        </Col>
      </Row>
      <br/><br/>
    </div>
  )
}

export default FileInfoDash