import React, { useEffect } from 'react'
import { useWorkbenchDB } from '../contexts/workbenchContext';

const TableView = () => {

  const workbenchDB = useWorkbenchDB();
  
  useEffect(() => {
    const { db, initialized } = workbenchDB;
    console.log("DB updated");
    console.log(db, initialized);
    
  }, [workbenchDB]);

  return (
    <div className='text-center'>
      <br/><br/>
        Table here
      <br/><br/>
    </div>
  )
}

export default TableView