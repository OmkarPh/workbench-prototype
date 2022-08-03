import { Op, Sequelize } from 'sequelize';
import React, { useEffect, useState } from 'react'
import { ColDef } from 'ag-grid-community';

import AgDataTable from './AgDataTable';
import { ALL_COLUMNS, COLUMN_GROUPS } from './columnDefs';
import { useWorkbenchDB } from '../../contexts/workbenchContext';


import './TableView.css';
import CoreButton from '../../components/CoreButton/CoreButton';
// import '@inovua/reactdatagrid-community/index.css'



const TableView = () => {

  const workbenchDB = useWorkbenchDB();

  const [tableData, setTableData] = useState<unknown[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>(COLUMN_GROUPS.DEFAULT);

  function changeColumnGroup(newGroup: ColDef[]){
    setColumnDefs([
      ALL_COLUMNS.path,
      ...newGroup,
    ])
  }


  useEffect(() => {
    const { db, initialized, currentPath } = workbenchDB;
    
    if(!initialized || !db || !currentPath)
      return;

    console.log("Path to render data in tableview", currentPath);

    
    db.sync
    .then(db => {
        
      // Aggregator
      db.FlatFile.aggregate('extension', 'DISTINCT', { plain: false })
        .then((uniqueValues: { DISTINCT: string }[]) => {
          console.log("Unique values aggregated for single column:", uniqueValues);
          console.log("Unique values aggregated for single column:", uniqueValues.map((val) => val.DISTINCT));
        });

      db.FlatFile.findAll({
        where: {
          path: {
            [Op.or]: [
              { [Op.like]: `${currentPath}`},      // Matches a file / directory.
              { [Op.like]: `${currentPath}/%`}  // Matches all its children (if any).
            ]
          }
        },
        attributes: [
          // Only one column at a time
          // specify an array where the first element is the SQL function and the second is the alias
          [Sequelize.fn('DISTINCT', Sequelize.col('extension')), 'extension'],
        ]
      })
        .then(uniqueValues => {
          console.log("Unique values for single column:", uniqueValues.map(val => val.getDataValue('extension')));
        });
    });



    db.sync
      .then(db => db.FlatFile.findAll({
        where: {
          path: {
            [Op.or]: [
              { [Op.like]: `${currentPath}`},      // Matches a file / directory.
              { [Op.like]: `${currentPath}/%`}  // Matches all its children (if any).
            ]
          }
        },
        // attributes: ['id'],
        raw: true,
      }))
      .then((files) =>{
        console.log("Files", files);
        setTableData(files);
        // setFilteredTableData(files);
      });
  }, [workbenchDB]);
  

  return (
    <div style={{ height: "100%", minHeight: "90vh" }}>
      <div className='filterButtons'>
        <section>
          <CoreButton small onClick={() => setColumnDefs(COLUMN_GROUPS.DEFAULT)}>
            Default columns
          </CoreButton>
          <CoreButton small onClick={() => changeColumnGroup(COLUMN_GROUPS.ALL)}>
            Show all
          </CoreButton>
          <CoreButton small onClick={() => changeColumnGroup(COLUMN_GROUPS.NONE)}>
            Hide all
          </CoreButton>
        </section>
        <section>
        |
        </section>
        <section>
          <CoreButton small onClick={() => changeColumnGroup(COLUMN_GROUPS.COPYRIGHT)}>
            Copyright cols
          </CoreButton>
          <CoreButton small onClick={() => changeColumnGroup(COLUMN_GROUPS.LICENSE)}>
            License cols
          </CoreButton>
          <CoreButton small onClick={() => changeColumnGroup(COLUMN_GROUPS.FILE)}>
            File cols
          </CoreButton>
          <CoreButton small onClick={() => changeColumnGroup(COLUMN_GROUPS.ORIGIN)}>
            Origin cols
          </CoreButton>
          <CoreButton small onClick={() => changeColumnGroup(COLUMN_GROUPS.PACKAGE)}>
            Package cols
          </CoreButton>
        </section>
        |
        <section>
          <CoreButton small>
            Reset Filters
          </CoreButton>
        </section>
      </div>
      <div style={{ height: 'calc(90vh - 25px)' }} className="ag-theme-alpine">
        <AgDataTable
          columnDefs={columnDefs}
          tableData={tableData}
        />
      </div>
    </div>
  )
}

export default TableView