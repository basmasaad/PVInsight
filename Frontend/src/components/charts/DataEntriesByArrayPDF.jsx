import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';

const ChartComponent = ({ data,id}) => {
    const [technologyChartData, setTechnologyChartData] = useState(null);
    const [versionChartData, setVersionChartData] = useState(null);
    
    useEffect(() => {
        if (data.length === 0) return;

        const technologyCounts = {};
        const versionCounts = {};

        data.forEach(entry => {
            // Count by technology
            const technology = entry.technology;
            if (!technologyCounts[technology]) {
                technologyCounts[technology] = 0;
            }
            technologyCounts[technology]++;

            // Count by version
            const version = entry.version;
            if (!versionCounts[version]) {
                versionCounts[version] = 0;
            }
            versionCounts[version]++;
        });

        // Extract technology labels and counts
        const technologyLabels = Object.keys(technologyCounts);
        const technologyCountsData = Object.values(technologyCounts);

        // Set the technology chart data
        setTechnologyChartData({
            labels: technologyLabels,
            datasets: [{
                label: 'Data Entries by Technology',
                data: technologyCountsData,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderWidth: 1,
            }]
        });

        // Extract version labels and counts
        const versionLabels = Object.keys(versionCounts);
        const versionCountsData = Object.values(versionCounts);

        // Set the version chart data
        setVersionChartData({
            labels: versionLabels,
            datasets: [{
                label: 'Data Entries by Version',
                data: versionCountsData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderWidth: 1,
            }]
        });

    }, [data]);

    return (
       
        
            <div id={id} className="flex flex-wrap">
                <div className="w-full md:w-1/2 p-2">
                    {technologyChartData && (
                        <>
                            <h3 className="text-lg font-bold mb-4 text-black-600">Data Quantity by Technology</h3>
                            <Bar
                                data={technologyChartData}
                                options={{
                                    responsive: true,
                                    scales: {
                                        x: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </>
                    )}
                </div>
                <div className="w-full md:w-1/2 p-2">
                    {versionChartData && (
                        <>
                            <h3 className="text-lg font-bold mb-4 text-black-600">Data Quantity by Version</h3>
                            <Bar
                                data={versionChartData}
                                options={{
                                    responsive: true,
                                    scales: {
                                        x: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </>
                    )}
                </div>
            </div>
        
    );
};
ChartComponent.propTypes = {
    data: PropTypes.array.isRequired,
    id: PropTypes.string.isRequired,
};

export default ChartComponent;