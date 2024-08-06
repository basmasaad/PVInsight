import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';
const ChartComponent = ({id}) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {

                const response = await axios.get('http://localhost:5000/NaNvalue');
                const data = response.data;

                setChartData({
                    labels: Object.keys(data),
                    datasets: [
                        {
                            label: '%NaN Values',
                            data: Object.values(data),
                            fill: false,
                            backgroundColor: 'rgba(234, 174, 199, 0.8)',
                        }
                    ]
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);


    return (
        <div id={id}>
        <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-green-600">NaN values</h2>
            <div className="border-1 border-dashed border-emerald-600 mb-4"></div>
            <div style={{ height: '100%', width: '100%' }}>
                <Bar data={chartData}
                    options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                            },
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: true,
                                    lineWidth: 1,
                                    color: 'rgba(0, 0, 0, 0.1)',
                                },
                                ticks: {
                                    font: {
                                        size: 9, // Adjust the font size
                                    },
                                },
                            },
                            y: {
                                grid: {
                                    display: true,
                                    lineWidth: 1,
                                    color: 'rgba(0, 0, 0, 0.1)',
                                },
                                ticks: {
                                    font: {
                                        size: 9, // Adjust the font size
                                    },
                                },
                            },
                        },
                    }}
                
                    />
            </div>
        </div>
        </div>
    );


};
ChartComponent.propTypes = {
    id: PropTypes.string.isRequired,
  };

export default ChartComponent;
