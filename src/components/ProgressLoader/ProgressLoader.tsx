import React from 'react'
import { Oval } from  'react-loader-spinner'

import './progressLoader.css';

interface ProgressLoaderProps {
  progress: number,
}
const ProgressLoader = (props: ProgressLoaderProps) => {
  return (
    <div className='progress-loader'>
      <div className='spinner'>
        <Oval
          height={150}
          width={150}
          color="#3D7BFF"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
          ariaLabel='oval-loading'
          secondaryColor="#D2E2FD"
          strokeWidth={2}
          strokeWidthSecondary={2}
        />
      </div>
      <br/><br/>
      <h4>
        Progress: { props.progress } %
      </h4>
    </div>
  )
}

export default ProgressLoader