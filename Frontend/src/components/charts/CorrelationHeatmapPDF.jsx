import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';
const CorrelationHeatmapPDF = ({id}) => {
    const [correlationData, setCorrelationData] = useState({ z: [], x: [], y: [] });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/correlation');
            setCorrelationData(response.data);

            //const responseData = JSON.parse(response.data);
            //console.log(response.data);
        } catch (error) {
            console.error('Error fetching correlation data:', error);
        }
    };
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
     
        <div id={id}>
    <h2 className="text-xl font-bold mb-4 text-black-600">Features Correlation</h2>
    
    <div className="flex flex-col h-full">
        <div className="flex-grow "style={{ minHeight: '300px', height: '200%' }}>
            <Plot
                data={[
                    {
                        z: correlationData.z,
                        x: correlationData.x,
                        y: correlationData.y,
                        type: 'heatmap',
                        colorscale: 'Viridis'
                    }
                ]}
                layout={{
                    autosize: true,
                    margin: { t: 50, r: 50, b: 100, l: 120 },
                    xaxis: {
                        tickfont: {
                            size: 10 // Adjust font size for x-axis ticks
                        }
                    },
                    yaxis: {
                        tickfont: {
                            size: 10 // Adjust font size for y-axis ticks
                        }
                    }
                }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
        <h2 className="text-xl font-bold mb-4 text-black-600">Features Correlation With Target</h2>
        <div className="flex-grow">
            <Bar
                data={chartData}
                options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                font: {
                                    size: 15, // Set the font size here
                                    weight: 'bold' // Bold font for better visibility
                                }
                            },
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
                                    size: 15, // Adjust the font size
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
                                    size: 15, // Adjust the font size
                                },
                            },
                        },
                    },
                }}
                style={{ width: '1000px', height: '500px' }}
            />
        </div>
    </div>
</div>
    );
};
CorrelationHeatmapPDF.propTypes = {
    id: PropTypes.string.isRequired,
};
export default CorrelationHeatmapPDF;
