import React, { createContext, useContext, useState } from "react";
import { WorkbenchDB } from '../services/workbenchDB';

interface WorkbenchContextProperties {
  initialized: boolean,
  db: WorkbenchDB | null,
  currentPath: string | null,
  loadingStatus: number | null,
  startImport: () => void,
  updateCurrentPath: (newPath: string) => void,
  updateWorkbenchDB: (db: WorkbenchDB) => void,
}

export const defaultWorkbenchContextValue: WorkbenchContextProperties = {
  db: null,
  initialized: false,
  loadingStatus: null,
  currentPath: null,
  startImport: () => null,
  updateCurrentPath: () => null,
  updateWorkbenchDB: () => null,
};

const WorkbenchContext = createContext<WorkbenchContextProperties>(defaultWorkbenchContextValue);

export const WorkbenchDBProvider = (props: React.PropsWithChildren<Record<string, unknown>>) => {
  const [value, setValue] = useState({
    db: null,
    initialized: false,
    loadingStatus: null,
  });
  const [currentPath, updateCurrentPath] = useState<string | null>(null);

  const startImport = () => {
    setValue({
      db: null,
      loadingStatus: 0,
      initialized: false,
    })
  }

  const updateWorkbenchDB = (db: WorkbenchDB) => {
    setValue({
      db,
      loadingStatus: 100,
      initialized: true,
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