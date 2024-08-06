import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const ChartComponent = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {

                const response = await axios.get('http://localhost:5000/correlation/bar');
                const data = response.data;

                setChartData({
                    labels: data.labels,
                    datasets: [
                        {
                            label: 'Features Correlation',
                            data: data.values,
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
        <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-green-600">Features Correlation</h2>
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
                    }} />
            </div>
        </div>
    );


};

export default ChartComponent;
