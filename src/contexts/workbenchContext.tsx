import { ColDef } from "ag-grid-community";
import React, { createContext, useContext, useState } from "react";
import { WorkbenchDB } from '../services/workbenchDB';

interface BasicValueState {
  db: WorkbenchDB | null,
  initialized: boolean,
  importedSqliteFilePath: string | null,
}
interface WorkbenchContextProperties extends BasicValueState {
  currentPath: string | null,
  startImport: () => void,
  abortImport: () => void,
  loadingStatus: null | number,
  columnDefs: ColDef[],
  updateLoadingStatus: React.Dispatch<React.SetStateAction<number | null>>,
  setColumnDefs: React.Dispatch<React.SetStateAction<ColDef[]>>,
  updateCurrentPath: (newPath: string) => void,
  updateWorkbenchDB: (db: WorkbenchDB, sqliteFilePath: string) => void,
}

export const defaultWorkbenchContextValue: WorkbenchContextProperties = {
  db: null,
  initialized: false,
  columnDefs: [],
  importedSqliteFilePath: null,
  loadingStatus: null,
  currentPath: null,
  updateLoadingStatus: () => null,
  setColumnDefs: () => null,
  startImport: () => null,
  abortImport: () => null,
  updateCurrentPath: () => null,
  updateWorkbenchDB: () => null,
};

const WorkbenchContext = createContext<WorkbenchContextProperties>(defaultWorkbenchContextValue);


export const WorkbenchDBProvider = (props: React.PropsWithChildren<Record<string, unknown>>) => {
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
  const [loadingStatus, updateLoadingStatus] = useState<number | null>(null);
  const [value, setValue] = useState<BasicValueState>({
    db: null,
    initialized: false,
    importedSqliteFilePath: null,
  });
  const [currentPath, updateCurrentPath] = useState<string | null>(null);

  const startImport = () => {
    updateLoadingStatus(0);
    setValue({
      db: null,
      initialized: false,
      importedSqliteFilePath: null,
    })
  }

  const abortImport = () => updateLoadingStatus(null);

  const updateWorkbenchDB = (db: WorkbenchDB, sqliteFilePath: string) => {
    updateLoadingStatus(100);
    setValue({
      db,
      initialized: true,
      importedSqliteFilePath: sqliteFilePath,
    });
  }

  return (
     <WorkbenchContext.Provider
      value={{
        ...value,
        columnDefs,
        loadingStatus,
        updateLoadingStatus,
        setColumnDefs,
        currentPath,
        startImport,
        abortImport,
        updateCurrentPath,
        // updateCurrentPath: (path: string) => setCurrentPath(path),
        updateWorkbenchDB
      }}
    >
        { props.children }
     </WorkbenchContext.Provider>
  )
}

export const useWorkbenchDB = () => useContext(WorkbenchContext);