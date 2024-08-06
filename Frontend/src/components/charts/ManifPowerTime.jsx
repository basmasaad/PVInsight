import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

const ChartComponent = ({ data }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [grouping, setGrouping] = useState('day');

  useEffect(() => {

    // Group data by panel manuf and calculate average power production
        const averagePowerByManuf = {};

        data.forEach((item) => {
          const manuf = item.manuf;
          const power = item.Active_Power;
          const timestamp = item.Timestamp;

          const date = new Date(timestamp);
          let key = '';

          if (grouping === 'day') {
            key = `${date.toISOString().split('T')[0]}`;
          } else if (grouping === 'month') {
            key = `${date.toISOString().split('-').slice(0, 2).join('-')}`;
          } else if (grouping === 'year') {
            key = `${date.toISOString().split('-')[0]}`;
          }

          if (!averagePowerByManuf[key]) {
            averagePowerByManuf[key] = {};
          }

          if (!averagePowerByManuf[key][manuf]) {
            averagePowerByManuf[key][manuf] = { totalPower: 0, count: 0 };
          }
          averagePowerByManuf[key][manuf].totalPower += power;
          averagePowerByManuf[key][manuf].count += 1;
        });

        const techLabels = Object.keys(averagePowerByManuf);
        const datasets = Object.keys(data.reduce((acc, cur) => {
          acc[cur.manuf] = true;
          return acc;
        }, {})).map((manuf, index) => {
          const techData = techLabels.map(date => {
            return averagePowerByManuf[date][manuf] ? averagePowerByManuf[date][manuf].totalPower / averagePowerByManuf[date][manuf].count : 0;
          });

          return {
            label: manuf,
            data: techData,
            backgroundColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`,
          };
        });

        setChartData({
          labels: techLabels,
          datasets: datasets,
        });

  }, [grouping, data]);

  const handleGroupingChange = (event) => {
    setGrouping(event.target.value);
  };

  return (
    <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl">
      <h2 className="text-xl font-bold text-green-600  mb-4">Power Production by Panel Manuf</h2>
      <div>
        <select
          id="grouping"
          value={grouping}
          onChange={handleGroupingChange}
          className="border border-gray-300 rounded-md py-2 px-4 mr-2"
        >
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>
      <div>
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default ChartComponent;
