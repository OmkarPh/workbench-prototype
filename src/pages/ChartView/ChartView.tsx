import { FindOptions, literal, fn, Op, Sequelize, WhereOptions } from 'sequelize';
import React, { useEffect, useState } from 'react'
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { useWorkbenchDB } from '../../contexts/workbenchContext';

import { BAR_CHART_COLUMNS } from '../../constants/columns'
import { formatBarchartData, getAttributeValues } from '../../utils/bar';
import { FlatFileAttributes } from '../../services/models/flatFile';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BAR_HEIGHT = 30;

const ChartView = () => {
  const { importedFile, db, initialized, currentPath} = useWorkbenchDB();
  const [selectedAttribute, setSelectedAttribute] = useState<string>(BAR_CHART_COLUMNS.Copyright.cols[0].key);
  const [formattedBarchartData, setFormattedBarchartData] = useState({
    counts: [40, 1, 2, 20, 540, 580, 690, 1100, 1200, 1380],
    labels: [
      'South Korea', 'Canada', 'United Kingdom', 'Netherlands', 'Italy', 'France', 'Japan',
      'United States', 'China', 'Germany'
    ],
  });

  useEffect(() => {
    if(!initialized || !db || !currentPath)
      return;
    
    console.log(`Updated db for path - ${currentPath}: `, db, initialized);

    console.log("Root dir path in tableview", currentPath);
    console.log("Path query", {where: {path: {[Op.like]: `%${currentPath}%`}}});

    const directoryAttributes = ['packages_type', 'packages_name', 'packages_primary_language'];

    const where: WhereOptions<FlatFileAttributes> = {
      path: {
        [Op.or]: [
          { [Op.like]: `${currentPath}`},      // Matches a file / directory.
          { [Op.like]: `${currentPath}/%`}  // Matches all its children (if any).
        ]
      }
    };

    if(directoryAttributes.includes(selectedAttribute)){
      where.type = {
        [Op.ne]: 'directory'
      }
    }
    // const attr: [typeof literal | typeof fn, ...string[]] = [Sequelize.fn('TRIM', Sequelize.col(selectedAttribute)), selectedAttribute];
    const query: FindOptions<FlatFileAttributes> = {
      // attributes: attr,
      where: where,
      attributes: [Sequelize.fn('TRIM', Sequelize.col(selectedAttribute)), selectedAttribute] as any,
      // attributes: [Sequelize.fn('TRIM', Sequelize.col(selectedAttribute)), selectedAttribute],
    };
    console.log("Query", query);
    
    db.sync
      .then((db) => db.FlatFile.findAll(query))
      .then((values) => {
        console.log('flat file values', values);
        return values;
      })
      .then((values) => getAttributeValues(values, selectedAttribute))
      .then((values) => {
        console.log('util attr values', values);
        const parsedData = formatBarchartData(values);
        console.log('Parsed bar chart values', parsedData);
        setFormattedBarchartData({
          labels: parsedData.map(entry => entry.label),
          counts: parsedData.map(entry => entry.value),
        });
        return values;
      })
  }, [importedFile, currentPath, selectedAttribute]);
  
  
  return (
    <div id="barchart-container">
      <div id="barchart-options">
          <h5>Total Files Scanned: <span className="total-files"></span></h5>
          <select
            value={selectedAttribute}
            onChange={e => setSelectedAttribute(e.target.value)}
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
      <div
        style={{
          minHeight: BAR_HEIGHT + 70,
          height: BAR_HEIGHT * formattedBarchartData.counts.length + 70
        }}
      >        
        <Bar
          style={{ overflow: 'scroll' }}
          options={{
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
              x: {
                grid: {
                  drawBorder: false,
                  drawTicks: false,
                  display:false
                }
              },
              y: {
                grid: {
                  drawBorder: true,
                  drawTicks: true,
                  display: false
                }
              }
            },
            elements: {
              bar: {
                borderWidth: 2,
              },
            },
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: selectedAttribute,
              },
            },
          }}
          data={{
            labels: formattedBarchartData.labels,
            datasets: [
              {
                backgroundColor: '#3498db',
                borderColor: '#bbe7fc',
                borderWidth: 1,
                hoverBackgroundColor: '#0a81d1',
                hoverBorderColor: '#80c8e9',
                data: formattedBarchartData.counts
              },
            ]
          }}
        />
      </div>
  </div>
  )
}

export default ChartView