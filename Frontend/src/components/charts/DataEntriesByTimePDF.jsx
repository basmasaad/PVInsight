import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';
const ChartComponent = ({ data, id }) => {
    const [yearlyChartData, setYearlyChartData] = useState({
        labels: [],
        datasets: [],
    });
    const [monthlyChartData, setMonthlyChartData] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        if (data.length === 0) return;

        const groupData = (data, groupBy) => {
            const groupedData = {};
            data.forEach(entry => {
                let date;
                if (groupBy === 'day') {
                    date = entry.Timestamp.split(' ')[0]; // Group by day
                } else if (groupBy === 'month') {
                    date = entry.Timestamp.split('-').slice(0, 2).join('-'); // Group by month
                } else if (groupBy === 'year') {
                    date = entry.Timestamp.split('-')[0]; // Group by year
                }

                if (!groupedData[date]) {
                    groupedData[date] = {};
                }

                const version = entry.version;
                if (!groupedData[date][version]) {
                    groupedData[date][version] = 0;
                }
                groupedData[date][version]++;
            });

            const labels = Object.keys(groupedData);
            const datasets = Object.keys(data.reduce((acc, cur) => ({ ...acc, [cur.version]: 1 }), {})).map(version => {
                const counts = labels.map(date => groupedData[date][version] || 0);
                return {
                    label: `Version ${version}`,
                    data: counts,
                    fill: false,
                    backgroundColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`,
                };
            });

            return {
                labels: labels,
                datasets: datasets,
            };
        };

        setYearlyChartData(groupData(data, 'year'));
        setMonthlyChartData(groupData(data, 'month'));
    }, [data]);

    return (
        // <div id={id}>
        //     <h2 className="text-xl font-bold mb-4 text-black-600">Data Quantity by Year</h2>
        //     <div>
        //         <Bar data={yearlyChartData} />
        //     </div>
        //     <h2 className="text-xl font-bold mb-4 text-black-600">Data Quantity by Month</h2>
        //     <div>
        //         <Bar data={monthlyChartData} />
        //     </div>
        // </div>
        <div id={id} className="flex flex-wrap">
            <div className="w-full md:w-1/2 p-2">
                <h2 className="text-xl font-bold mb-4 text-black-600">Data Quantity by Year</h2>
                <Bar data={yearlyChartData} />
            </div>
            <div className="w-full md:w-1/2 p-2">
                <h2 className="text-xl font-bold mb-4 text-black-600">Data Quantity by Month</h2>
                <Bar data={monthlyChartData} />
            </div>
        </div>
    );
};

ChartComponent.propTypes = {
    data: PropTypes.array.isRequired,
    id: PropTypes.string.isRequired,
};

export default ChartComponent;