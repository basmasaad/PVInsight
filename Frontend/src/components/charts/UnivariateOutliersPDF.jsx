import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { LinearScale, CategoryScale } from 'chart.js';
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(BoxPlotController, BoxAndWiskers, LinearScale, CategoryScale, zoomPlugin);

const ChartComponent = ({ label, data }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            let myChart = null;

            if (myChart) {
                myChart.destroy(); // Ensure previous instance is destroyed
            }

            myChart = new Chart(ctx, {
                type: 'boxplot',
                data: {
                    labels: [label],
                    datasets: [{
                        label: label,
                        data: [data],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        itemRadius: 1,
                    }]
                },
                options: {
                    responsive: true,
                     scales: {
                        x: {
                            title: {
                                display: true,
                              
                                color: '#333',
                                font: {
                                    weight: 'bold',
                                    size: 15
                                },
                            },
                            grid: {
                                display: false,
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                
                                color: '#333',
                                font: {
                                    weight: 'bold',
                                    size: 15
                                },
                            },}},
                    plugins: {
                        legend: {
                            labels: {
                                font: {
                                    size: 15, // Set the font size here
                                    weight: 'bold' // Bold font for better visibility
                                }
                            }
                        },
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
                }
            });

            return () => {
                myChart.destroy(); // Cleanup
            };
        }
    }, [label, data]);

    return (
        <div className="flex-grow "style={{ width: '150%', height: '200px', marginBottom: '20px' }}>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default ChartComponent;