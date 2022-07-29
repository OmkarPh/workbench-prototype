import React, { createContext, useContext, useState } from "react";
import { WorkbenchDB } from '../services/workbenchDB';

interface BasicValueState {
  db: WorkbenchDB | null,
  initialized: boolean,
  importedSqliteFilePath: string | null,
  loadingStatus: number | null,
}
interface WorkbenchContextProperties extends BasicValueState {
  currentPath: string | null,
  startImport: () => void,
  updateCurrentPath: (newPath: string) => void,
  updateWorkbenchDB: (db: WorkbenchDB, sqliteFilePath: string) => void,
}

export const defaultWorkbenchContextValue: WorkbenchContextProperties = {
  db: null,
  initialized: false,
  importedSqliteFilePath: null,
  loadingStatus: null,
  currentPath: null,
  startImport: () => null,
  updateCurrentPath: () => null,
  updateWorkbenchDB: () => null,
};

const WorkbenchContext = createContext<WorkbenchContextProperties>(defaultWorkbenchContextValue);


export const WorkbenchDBProvider = (props: React.PropsWithChildren<Record<string, unknown>>) => {
  const [value, setValue] = useState<BasicValueState>({
    db: null,
    initialized: false,
    importedSqliteFilePath: null,
    loadingStatus: null,
  });
  const [currentPath, updateCurrentPath] = useState<string | null>(null);

  const startImport = () => {
    setValue({
      db: null,
      initialized: false,
      importedSqliteFilePath: null,
      loadingStatus: 0,
    })
  }

  const updateWorkbenchDB = (db: WorkbenchDB, sqliteFilePath: string) => {
    setValue({
      db,
      loadingStatus: 100,
      initialized: true,
      importedSqliteFilePath: sqliteFilePath,
    });
  }

  return (
     <WorkbenchContext.Provider
      value={{
        ...value,
        currentPath,
        startImport,
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