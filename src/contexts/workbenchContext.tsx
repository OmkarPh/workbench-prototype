import React, { createContext, useContext, useState } from "react";
import { WorkbenchDB } from '../services/workbenchDB';

interface WorkbenchContextProperties {
  initialized: boolean,
  importedFile: string | null,
  db: WorkbenchDB | null,
  currentPath: string | null,
  loadingStatus: number | null,
  startImport: () => void,
  updateCurrentPath: (newPath: string) => void,
  updateWorkbenchDB: (db: WorkbenchDB, path: string) => void,
}

export const defaultWorkbenchContextValue: WorkbenchContextProperties = {
  db: null,
  initialized: false,
  importedFile: null,
  loadingStatus: null,
  currentPath: null,
  startImport: () => null,
  updateCurrentPath: () => null,
  updateWorkbenchDB: () => null,
};

const WorkbenchContext = createContext<WorkbenchContextProperties>(defaultWorkbenchContextValue);

interface BasicValueState {
  db: WorkbenchDB | null,
  initialized: boolean,
  importedFile: string | null,
  loadingStatus: number | null,
}
export const WorkbenchDBProvider = (props: React.PropsWithChildren<Record<string, unknown>>) => {
  const [value, setValue] = useState<BasicValueState>({
    db: null,
    initialized: false,
    importedFile: null,
    loadingStatus: null,
  });
  const [currentPath, updateCurrentPath] = useState<string | null>(null);

  const startImport = () => {
    setValue({
      db: null,
      initialized: false,
      importedFile: null,
      loadingStatus: 0,
    })
  }

  const updateWorkbenchDB = (db: WorkbenchDB, path: string) => {
    setValue({
      db,
      loadingStatus: 100,
      initialized: true,
      importedFile: path,
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