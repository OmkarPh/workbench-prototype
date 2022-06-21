import React, { useEffect } from 'react'
import { Op } from 'sequelize';
import c3 from 'c3';

import { formatChartData, limitChartData } from '../helpers/utils';
import { useWorkbenchDB } from '../contexts/workbenchContext';
import { LEGEND_COLORS } from '../constants/colors';

const LEGEND_LIMIT = 8;
const LICENSE_EXP_ID = "license-expression-chart";

const LicenseInfoDash = () => {

  const workbenchDB = useWorkbenchDB();
  
  useEffect(() => {
    const { db, initialized } = workbenchDB;
    if(!initialized || !db)
      return;
    console.log("DB updated");
    console.log(db, initialized);
    console.log('Selected path:',);
    console.log({where: {path: {[Op.like]: "busybox-1.31.1.tar.bz2-extract%"}}});

    const result: any = db.sync
      .then((db) => db.File.findAll({
        where: {path: {[Op.like]: "busybox-1.31.1.tar.bz2-extract%"}},
        attributes: ['id'],
      }))
      // .then((db) => db.File.findAll({where: {path: {$like: `${this.selectedPath()}%`}}}))
      .then((files) => files.map(val => val.getDataValue('id')))
      .then((fileIds) => {
        console.log(fileIds);
        return db.sync.then(db => db.LicenseExpression.findAll({where: { id: fileIds }}));
      })
      .then((expressions) => expressions.map(val => val.getDataValue('license_expression') || 'No Value Detected'))
      .then((expressions) => {
        console.log("Pre processed expressions:", expressions);
        return expressions;
      })
      .then((expressions) => formatChartData(expressions))
      .then((expressions) => limitChartData(expressions, LEGEND_LIMIT))
      .then((expressions) => {
        console.log("Result expressions:", expressions);
        c3.generate({
          bindto: '#' + LICENSE_EXP_ID,
          data: {
            columns: expressions,
            type : 'pie',
            // onclick: function (d, i) { console.log("onclick", d, i); },
            // onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            // onmouseout: function (d, i) { console.log("onmouseout", d, i); }
          },
          color: {
            pattern: LEGEND_COLORS,
          }
        });
      });
    console.log(result.then(console.log));
  }, [workbenchDB]);

  return (
    <div className='text-center'>
      <br/><br/>
        License info dash here !!
      <br/><br/>
      <br/><br/>
      <div id={LICENSE_EXP_ID} />
      <br/><br/>
      <br/><br/>
    </div>
  )
}

export default LicenseInfoDash