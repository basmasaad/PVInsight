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
                }
            });

            return () => {
                myChart.destroy(); // Cleanup
            };
        }
    }, [label, data]);

    return (
        <div style={{ width: '100%', height: '200px' }}>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default ChartComponent;