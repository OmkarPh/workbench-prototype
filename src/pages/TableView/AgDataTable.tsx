import React, { useEffect, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';


import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { frameworkComponents } from './columnDefs';

interface AgDataTableProps {
  tableData: unknown[],
  columnDefs: ColDef[],
}

const defaultColDef: ColDef = {
  sortable: true,
  resizable: true,
  filter: true,
  wrapText: true,
  autoHeight: true,
};
const paginationOptions = [25, 50, 100, 200];
const defaultPaginationOption = paginationOptions[0];

const AgDataTable = (props: AgDataTableProps) => {
  const {
    tableData, columnDefs,
  } = props;

  // const [filteredTableData, setFilteredTableData] = useState<unknown[]>([]);

  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const onGridReady = (params: GridReadyEvent) => setGridApi(params.api);

  const changePaginationSize = (newValue: string | number) => {
    if(gridApi){
      gridApi.paginationSetPageSize(Number(newValue));
    }
  }
  useEffect(
    () => changePaginationSize(defaultPaginationOption),
    [tableData, gridApi]
  );


  return (
    <div
      style={{
        height: '100%',
        width: '100%',
      }}
    >
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
      <AgGridReact
        rowData={tableData}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        components={frameworkComponents}

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
          onChange={e => changePaginationSize(e.target.value)}
        >
          {
            paginationOptions.map(optionValue => (
              <option value={optionValue} key={optionValue}>
                { optionValue }
              </option>
            ))
          }
        </select>
      </div>
    </div>
  )
}

export default AgDataTable