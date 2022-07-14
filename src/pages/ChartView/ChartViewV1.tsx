import { FindOptions, Op, Sequelize, WhereOptions } from 'sequelize';
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
import { FileAttributes } from '../../services/models/file';
import BarChartLegacy from '../../components/BarChartLegacy/BarChartLegacy';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BAR_HEIGHT = 30;

const ChartViewV1 = () => {
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

    const where: WhereOptions = {
      path: {
        [Op.or]: [
          { [Op.like]: `${currentPath}`},      // Matches a file / directory.
          { [Op.like]: `${currentPath}/%`}  // Matches all its children (if any).
        ]
      }
    };

    if(directoryAttributes.includes(selectedAttribute)){
      where.path.type = {
        [Op.ne]: 'directory'
      }
    }

    const query: FindOptions<FileAttributes> = {
      attributes: [Sequelize.fn('TRIM', Sequelize.col(selectedAttribute)), selectedAttribute],
      where: where
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
  }, [importedFile, selectedAttribute]);
  
  
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
          height: BAR_HEIGHT * formattedBarchartData.counts.length
        }}
      >        
        <Bar
          style={{ overflow: 'scroll' }}
          // width={900}
          // height={20 * formattedBarchartData.counts.length}
          options={{
            maintainAspectRatio: false,
            indexAxis: 'y' as const,
            scales: {
              x: {
                grid: {
                    display:false
                }
              },
              y: {
                  grid: {
                      display:false
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
      {/* <BarChartLegacy chartData={formattedBarchartData} /> */}
      {/* <ApexChart
        options={{
          tooltip: {
            y: {
              title: {
                formatter: () => '',
              },
              formatter: (value) => String(value),
            },
          },
          chart: {
            type: 'bar',
            height: 350
          },
          grid: {
            show: false
          },
          legend: {
            show: false,
          },
          plotOptions: {
            bar: {
              borderRadius: 4,
              horizontal: true,
            }
          },
          dataLabels: {
            enabled: true
          },
          xaxis: {
            tooltip: {
              formatter: (value, opts) => value + "%%%",
            },
            axisTicks: {
              show: false,
            },
            axisBorder: {
              show: false,
            },
            categories: formattedBarchartData.labels
          },
          yaxis: {
            title: {

              // formatter: (seriesName) => seriesName,
            },
            tooltip: {
              // formatter: (value, opts) => value + "%%%",
            },
            axisBorder: {
              show: true,
            }
          }
        }}
        series={[{
          data: formattedBarchartData.counts
        }]}
        type="bar"
        height={1050}
      /> */}
  </div>
  )
}

export default ChartViewV1;