import { Op } from 'sequelize';
import React, { useEffect, useState } from 'react'
import { ColDef } from 'ag-grid-community';

import AgDataTable from './AgDataTable';
import { COLUMN_GROUPS } from './columnDefs';
import { useWorkbenchDB } from '../../contexts/workbenchContext';


import './TableView.css';
// import '@inovua/reactdatagrid-community/index.css'



const TableView = () => {

  const workbenchDB = useWorkbenchDB();

  const [tableData, setTableData] = useState<unknown[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>(COLUMN_GROUPS.DEFAULT);


  useEffect(() => {
    const { db, initialized, currentPath } = workbenchDB;
    
    if(!initialized || !db || !currentPath)
      return;

    console.log("Path to render data in tableview", currentPath);

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
      <div>
        <button onClick={() => setColumnDefs(COLUMN_GROUPS.COPYRIGHT)}>
          Copyright cols
        </button> {'   '}
        <button onClick={() => setColumnDefs(COLUMN_GROUPS.LICENSE)}>
          License cols
        </button> {'   '}
        <button onClick={() => setColumnDefs(COLUMN_GROUPS.FILE)}>
          File cols
        </button> {'   '}
        <button onClick={() => setColumnDefs(COLUMN_GROUPS.ORIGIN)}>
          Origin cols
        </button> {'   '}
        <button onClick={() => setColumnDefs(COLUMN_GROUPS.PACKAGE)}>
          Package cols
        </button> {'   '}
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