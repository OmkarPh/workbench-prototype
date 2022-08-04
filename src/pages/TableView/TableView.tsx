import { Op } from 'sequelize';
import React, { useEffect, useState } from 'react'
import { ColDef } from 'ag-grid-community';

import AgDataTable from './AgDataTable';
import { ALL_COLUMNS, COLUMN_GROUPS, DEFAULT_EMPTY_VALUES, SET_FILTERED_COLUMNS } from './columnDefs';
import { useWorkbenchDB } from '../../contexts/workbenchContext';


import './TableView.css';
import CoreButton from '../../components/CoreButton/CoreButton';
import { FlatFileAttributes } from '../../services/models/flatFile';
import CustomFilterComponent from './CustomFilterComponent';
// import '@inovua/reactdatagrid-community/index.css'



const TableView = () => {

  const workbenchDB = useWorkbenchDB();

  const [tableData, setTableData] = useState<unknown[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);

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

      Object.values(ALL_COLUMNS).forEach(columnDef => {
        const columnKey = columnDef.field || "";

        // Prepare filters only for eligible columns
        if(!SET_FILTERED_COLUMNS.has(columnKey))
          return;

        // Aggregator
        db.FlatFile.aggregate(
          columnKey as (keyof FlatFileAttributes),
          'DISTINCT',
          { plain: false },
        )
          .then((uniqueValues: { DISTINCT: string }[]) => {
            const parsedUniqueValues = uniqueValues.map((val) => val.DISTINCT);
            if(!parsedUniqueValues[0])
              parsedUniqueValues[0] = '';
            
            if(!DEFAULT_EMPTY_VALUES.includes(parsedUniqueValues[0]))
              parsedUniqueValues.unshift('');
            
            console.log(
              `Unique values aggregated for col [${columnKey}]:`,
              // uniqueValues,
              parsedUniqueValues,
              // parsedUniqueValues.length,
            );

            columnDef.floatingFilter = true;
            columnDef.filterParams = { options: parsedUniqueValues };
            columnDef.floatingFilterComponent = CustomFilterComponent;
          });
      });

      // TODO - Do promise.all instead
      setTimeout(() => setColumnDefs([...COLUMN_GROUPS.DEFAULT]), 2000);
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
        raw: true,
      }))
      .then((files) =>{
        console.log("Files", files);
        setTableData(files);
        setColumnDefs([...COLUMN_GROUPS.DEFAULT])
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