import React from 'react'
import { BAR_CHART_COLUMNS } from '../../constants/columns'

const Barchart = () => {
  
  return (
    <div id="barchart-container">
      <div id="barchart-options">
          <h5>Total Files Scanned: <span className="total-files"></span></h5>
          <select
            // onMouseDown="if(this.options.length>5){this.size=5;}"
            onMouseDown={function tmp(){
              if(this.options.length>5){
                this.size=5;
              }
            }}
            onChange={function tmp(){ this.size = 0 }}
            // onblur="this.size=0;"
            className="form-control select-chart-attribute"
          >
            {
              Object.values(BAR_CHART_COLUMNS).map(colGroup => (
                <optgroup label={colGroup.label} key={colGroup.key}>
                  {
                    colGroup.cols.map(column => (
                      <option className={column.bar_chart_class} value={column.key}>
                        { column.title }
                      </option>
                    ))
                  }
                </optgroup>
              ))
            }
          </select>
      </div>
      <div id="barchart-view">
          <div className="svg-container">
              <svg className="barchart"></svg>
          </div>
      </div>
  </div>
  )
}

export default Barchart