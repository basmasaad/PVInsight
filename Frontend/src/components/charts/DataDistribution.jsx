import React from 'react';
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import PropTypes from 'prop-types';
Chart.register(zoomPlugin);

const ChartComponent = ({ data,id }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });
    const [selectedField, setSelectedField] = useState('Active_Power');

    useEffect(() => {
        if (data.length === 0) return;
        console.log('hello from datadistrib component')
        // Extracting Active_Power values and rounding them to 2 decimal places
        const selectedFieldValues = data.map(entry => parseFloat(entry[selectedField]).toFixed(0));

        // Counting the frequency of each unique Active_Power value
        const frequencyMap = selectedFieldValues.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});

        // Extracting unique Active_Power values and their frequencies
        const labels = Object.keys(frequencyMap);
        const frequencies = Object.values(frequencyMap);

        // Sorting labels in ascending order
        labels.sort((a, b) => parseFloat(a) - parseFloat(b));

        setChartData({
            labels: labels,
            datasets: [{
                label: `Distribution of ${selectedField}`,
                data: frequencies,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                barPercentage: 1,
                categoryPercentage: 1,
            }],
        });
        {console.log('chart Data from component: ',{chartData})}
    }, [selectedField, data]);

    const handleFieldChange = (event) => {
        console.log('hello from handlefield');
        setSelectedField(event.target.value);
    };


    return (
        <div id={id}>
        <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl ">
            <h2 className="text-xl font-bold mb-4 text-green-600">Data Distribution</h2>
            <div className="border-1 border-dashed border-emerald-600 mb-4"></div>
            <div className="mb-4">
                <label htmlFor="field-select" className="mr-2">Select Field:</label>
                <select
                    id="field-select"
                    value={selectedField}
                    onChange={handleFieldChange}
                    className="border border-gray-300 rounded-md py-2 px-4"
                >
                    <option value="Active_Power">Active Power</option>
                    <option value="Weather_Temperature_Celsius">Weather Temperature (Celsius)</option>
                    <option value="Global_Horizontal_Radiation">Global Horizontal Radiation</option>
                    {/* Add more options for other fields as needed */}
                </select>
            </div>
            <div>
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: selectedField,
                                    color: '#333',
                                    font: {
                                        weight: 'bold',
                                    }
                                },
                                grid: {
                                    display: false,
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Frequency',
                                    color: '#333',
                                    font: {
                                        weight: 'bold',
                                    }
                                },
                                grid: {
                                    display: true,
                                }
                            },
                        },
                        
                        plugins: {
                            zoom: {
                                zoom: {
                                    wheel: {
                                        enabled: true,
                                    },
                                    pinch: {
                                        enabled: true
                                    },
                                    mode: 'xy',
                                },
                                pan: {
                                    enabled: true,
                                    mode: 'xy',
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
        </div>
    );
};
ChartComponent.propTypes = {
    data: PropTypes.array.isRequired,
    id: PropTypes.string.isRequired,
};

export default ChartComponent;
