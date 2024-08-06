import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { Bar } from 'react-chartjs-2';

const CorrelationHeatmap = () => {
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
        // <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl h-96 overflow-y-auto">
        //    <div style={{ height: 'calc(100% - 3.5rem)', width: '100%' }}>
        //    <h2 className="text-xl font-semibold mb-2 mt-2">Features Correlation</h2>
           
        //    <Plot
        //          data={[
        //             {
        //                 z: correlationData.z,
        //                 x: correlationData.x,
        //                 y: correlationData.y,
        //                 type: 'heatmap',
        //                 colorscale: 'Viridis'
        //             }
        //         ]}
        //         layout={{
        //             width: '100%',
        //             height: '100%',
                
        //             xaxis: {
        //                 tickfont: {
        //                     size: 6.5 // Adjust font size for x-axis ticks
        //                 }
        //             },
        //             yaxis: {
        //                 tickfont: {
        //                     size:6.5 // Adjust font size for y-axis ticks
        //                 }
        //             },
        //             margin: { t: 60, r: 50, b: 50, l: 50 }
        //         }}
        //         useResizeHandler={true}
        //         style={{ width: '100%', height: '100%' }}
                
        //     />
          
        //     <h2 className="text-xl font-semibold mb-4">Features Correlation</h2>
            
        //         <Bar data={chartData}
        //             options={{
        //                 maintainAspectRatio: false,
        //                 responsive: true,
        //                 plugins: {
        //                     legend: {
        //                         display: true,
        //                         position: 'top',
        //                     },
        //                 },
        //                 scales: {
        //                     x: {
        //                         grid: {
        //                             display: true,
        //                             lineWidth: 1,
        //                             color: 'rgba(0, 0, 0, 0.1)',
        //                         },
        //                         ticks: {
        //                             font: {
        //                                 size: 9, // Adjust the font size
        //                             },
        //                         },
        //                     },
        //                     y: {
        //                         grid: {
        //                             display: true,
        //                             lineWidth: 1,
        //                             color: 'rgba(0, 0, 0, 0.1)',
        //                         },
        //                         ticks: {
        //                             font: {
        //                                 size: 9, // Adjust the font size
        //                             },
        //                         },
        //                     },
        //                 },
        //             }} />
        //     </div>



        // </div>
        <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl h-96 overflow-y-auto">
    <h2 className="text-xl font-bold mb-4 text-green-600">Features Correlation</h2>
    <div className="border-1 border-dashed border-emerald-600 mb-4"></div>
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
                            size: 6.5 // Adjust font size for x-axis ticks
                        }
                    },
                    yaxis: {
                        tickfont: {
                            size: 6.5 // Adjust font size for y-axis ticks
                        }
                    }
                }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
        <h2 className="text-xl font-bold mb-4 text-green-600">Features Correlation With Target</h2>
        <div className="flex-grow">
            <Bar
                data={chartData}
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
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    </div>
</div>
    );
};

export default CorrelationHeatmap;
