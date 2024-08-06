import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';


const ChartComponent = ({ data }) => {
    const [chartData, setChartData] = useState(null);
    const [selectedTechnology, setSelectedTechnology] = useState('');
    const [selectedVersion, setSelectedVersion] = useState('');
    const [selectedYearsInstallation, setSelectedYearsInstallation] = useState('');

    useEffect(() => {
        if (data.length === 0) return;

        let filteredData = data;
        if (selectedTechnology) {
            filteredData = data.filter(entry => entry.technology === selectedTechnology);
        }

        if (selectedVersion) {
            filteredData = data.filter(entry => entry.version === selectedVersion);
        }

        // Ensure selectedYearsInstallation is numeric
        // const numericYearsInstallation = parseInt(selectedYearsInstallation);
        // if (!isNaN(numericYearsInstallation)) {
        //     filteredData = filteredData.filter(entry => entry.year_of_installation === numericYearsInstallation);
        // }

        // Count the number of entries for each version in the filtered data
        const versionCounts = {};
        filteredData.forEach(entry => {
            const version = entry.version;
            if (!versionCounts[version]) {
                versionCounts[version] = 0;
            }
            versionCounts[version]++;
        });

        // Extract version labels and counts
        const labels = Object.keys(versionCounts);
        const counts = Object.values(versionCounts);

        // Set the chart data
        setChartData({
            labels: labels,
            datasets: [{
                label: 'Data Entries',
                data: counts,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderWidth: 1,
            }]
        });
    }, [selectedTechnology, selectedVersion, data]);

    const handleTechnologyChange = event => {
        setSelectedTechnology(event.target.value);
        console.log('technology selected: ',selectedTechnology);
    };

    const handleVersionChange = event => {
        setSelectedVersion(event.target.value);
        console.log('version selected: ',selectedVersion);
    };
    return (
        
        <div className="p-4 ">
      
            <h2 className="text-xl font-bold mb-4 text-green-600">Data Quantity by PV Array</h2>
            <div className="border-1 border-dashed border-emerald-600 mb-4"></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <select
                    id="version"
                    value={selectedTechnology}
                    onChange={handleTechnologyChange}
                    className="border border-gray-300 rounded-md"
                >
                    <option value="">Technologies</option>
                    {data && data.length > 0 && [...new Set(data.map(entry => entry.technology))].map(technology => (
                        <option key={technology} value={technology}>{technology}</option>
                    ))}
                </select>

                <select
                    id="version"
                    value={selectedVersion}
                    onChange={handleVersionChange}
                    className="border border-gray-300 rounded-md"
                >
                    <option value="">Version</option>
                    {data && data.length > 0 && [...new Set(data.map(entry => entry.version))].map(version => (
                        <option key={version} value={version}>{version}</option>
                    ))}
                </select>

                

            </div>

            <div>
                {chartData && (
                    <Bar
                        data={chartData}
                        options={{
                            indexAxis: 'y', // Horizontal bar chart
                            responsive: true,
                            scales: {
                                x: {
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                )}
            </div>
            <div></div>
           
        </div>
    );
};

export default ChartComponent;
