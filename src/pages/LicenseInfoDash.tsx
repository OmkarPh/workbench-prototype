import React, { useEffect } from 'react'
import { Op } from 'sequelize';

import { formatChartData, limitChartData } from '../helpers/utils';
import { useWorkbenchDB } from '../contexts/workbenchContext';

const LEGEND_LIMIT = 8;

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

    const result = db.sync
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
      .then((exp) => {
        console.log("Result expressions:", exp);
      })
    console.log(result.then(console.log));

  }, [workbenchDB]);

  return (
    <div className='text-center'>
      <br/><br/>
        License info dash here !!
      <br/><br/>
    </div>
  )
}

export default LicenseInfoDash