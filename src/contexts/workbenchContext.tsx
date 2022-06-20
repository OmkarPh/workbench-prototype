import React, { createContext, useContext, useState } from "react";
import { WorkbenchDB } from '../services/workbenchDB';

interface WorkbenchContextProperties {
  db: WorkbenchDB | null,
  initialized: boolean,
  updateWorkbenchDB: (db: WorkbenchDB) => void,
}

export const defaultWorkbenchContextValue: WorkbenchContextProperties = {
  db: null,
  initialized: false,
  updateWorkbenchDB: () => null,
};

const WorkbenchContext = createContext<WorkbenchContextProperties>(defaultWorkbenchContextValue);

export const WorkbenchDBProvider = (props: React.PropsWithChildren<Record<string, unknown>>) => {
  const [value, setValue] = useState({
    db: null,
    initialized: false,
  })
  const updateWorkbenchDB = (db: WorkbenchDB) => {
    setValue({
      db,
      initialized: true,
    })
  }

  return (
     <WorkbenchContext.Provider value={{ ...value, updateWorkbenchDB }}>
        { props.children }
     </WorkbenchContext.Provider>
  )
}

export const useWorkbenchDB = () => useContext(WorkbenchContext);