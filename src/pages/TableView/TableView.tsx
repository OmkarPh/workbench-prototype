import { Op } from 'sequelize';
import React, { useCallback, useEffect, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';

import { DEFAULT_COLUMN_GROUP } from './columnDefs';
import { useWorkbenchDB } from '../../contexts/workbenchContext';


import './TableView.css';
// import '@inovua/reactdatagrid-community/index.css'
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import CustomFilterComponent from './CustomFilterComponent';




const defaultColDef: ColDef = {
  sortable: true,
  resizable: true,
  filter: true,
  floatingFilterComponent: () => (
    <CustomFilterComponent

    />
  ),
  floatingFilter: true,
  wrapText: true,
  autoHeight: true,
};
const paginationOptions = [25, 50, 100, 200];
const defaultPaginationOption = paginationOptions[1];

const TableViewAG = () => {

  const workbenchDB = useWorkbenchDB();
  // const [filteredTableData, setFilteredTableData] = useState<unknown[]>([]);
  // const [tableData, setTableData] = useState<unknown[]>([]);

  // Optional - for accessing Grid's API
  // const gridRef = useRef<AgGridReact<unknown> | null>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [tableData, setTableData] = useState<unknown[]>([]);

  const [columnDefs] = useState<ColDef[]>(DEFAULT_COLUMN_GROUP);

  useEffect(() => {
    const { db, initialized, currentPath } = workbenchDB;
    
    if(!initialized || !db || !currentPath)
      return;

    console.log("Path to render data in tableview", currentPath);

    db.sync
      .then(db => db.File.findAll({
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

  useEffect(() => {
    if (gridApi) {
      gridApi.paginationSetPageSize(defaultPaginationOption);
      // gridApi!.sizeColumnsToFit();
    }
  }, [tableData, gridApi]);
  
  const onGridReady = (params: GridReadyEvent) => setGridApi(params.api);


  const onPageSizeChanged = useCallback((newValue: string) => {
    console.log(gridApi, newValue, Number(newValue));
    
    if(gridApi){
      console.log("Changing pagination");
      
      gridApi.paginationSetPageSize(Number(newValue));
    }
  }, [gridApi]);
  

  // function onSearchChange(e: ChangeEvent<HTMLInputElement>){
  //   const lowerText = e.target.value.toLowerCase();
  //   const newFilteredData = tableData.filter((p: any) => {
  //     return TABLE_COLUMNS.reduce((acc, col) => {
  //       const v = (p[col.id] + '').toLowerCase(); // get string value
  //       return acc || v.indexOf(lowerText) != -1; // make the search case insensitive
  //     }, false);
  //   });
  //   setFilteredTableData(newFilteredData);
  // }

  return (
    <div style={{ height: "100%", minHeight: "90vh" }}>
      {/* <div>
        <label>
          Search text:{' '}
          <input
            type="text"
            style={{ padding: 5 }}
            // onChange={onSearchChange}
          />{' '}
        </label>
      </div> */}
      <div style={{ height: 'calc(95vh - 25px)' }} className="ag-theme-alpine">
        <div
          style={{
            height: '100%',
            width: '100%',
          }}
        >
          <AgGridReact
            rowData={tableData}
            columnDefs={columnDefs}
            onGridReady={onGridReady}

            pagination={true}
            defaultColDef={defaultColDef}

            // Performance options
            rowBuffer={200}
            animateRows={false}
            suppressColumnMoveAnimation
            suppressRowVirtualisation
            suppressColumnVirtualisation
          />

          <div className="pagination-controls">
            Page Size:
            <select
              defaultValue={defaultPaginationOption}
              onChange={e => onPageSizeChanged(e.target.value)}
            >
              {
                paginationOptions.map(optionValue => (
                  <option value={optionValue} selected={true}>
                    { optionValue }
                  </option>
                ))
              }
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TableViewAG