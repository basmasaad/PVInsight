import React, { useState, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const ChartComponent = ({ data }) => {

  const [chartData, setChartData] = useState({
    datasets: [],
  });
  const [filterMin, setFilterMin] = useState(0);
  const [filterMax, setFilterMax] = useState(2000);

  useEffect(() => {

    const scatterData = data.map(entry => ({
      x: entry.Global_Horizontal_Radiation,
      y: entry.Active_Power,
    }));

    setChartData({
      datasets: [
        {
          label: 'Active Power vs Global Horizontal Radiation',
          data: scatterData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    });
  }, [data]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'min') {
      setFilterMin(parseInt(value));
    } else if (name === 'max') {
      setFilterMax(parseInt(value));
    }
  };

  const filteredData = chartData.datasets.length > 0 ? chartData.datasets[0].data.filter(point =>
    point.x >= filterMin && point.x <= filterMax
  ) : [];

  return (
    <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">Scatter Plot: Active Power vs Global Horizontal Radiation</h2>
      <div className="flex items-center mb-4">
        <label htmlFor="start-date" className="mr-2">Min Irradiance</label>
        <input
          type="number"
          name="min"
          value={filterMin}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md py-2 px-4"
        />

        <label htmlFor="start-date" className="ml-4 mr-2">Max Irradiance</label>
        <input
          type="number"
          name="max"
          value={filterMax}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md py-2 px-4"
        />
      </div>
      <div className="h-96">
        <Scatter
          data={{
            datasets: [{
              ...chartData.datasets[0],
              data: filteredData
            }]
          }}
          options={{
            maintainAspectRatio: false,
            scales: {
              x: {
                type: 'linear',
                position: 'bottom',
                title: {
                  display: true,
                  text: 'Global Horizontal Radiation',
                },
              },
              y: {
                type: 'linear',
                position: 'left',
                title: {
                  display: true,
                  text: 'Active Power',
                },
              },
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                mode: 'nearest',
                intersect: false
              },
            }
          }}
        />
      </div>

    </div>
  );

};

export default ChartComponent;
