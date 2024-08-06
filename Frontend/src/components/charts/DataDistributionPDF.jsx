import React from 'react';
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import PropTypes from 'prop-types';
Chart.register(zoomPlugin);

// const ChartComponent = ({data,id }) => {
    
//     const fields = ['Active_Power', 'Weather_Temperature_Celsius', 'Global_Horizontal_Radiation'];
//     const [chartData, setChartData] = useState({});
//     console.log('hello from datadistrib _____')
//     useEffect(() => {
//         if (data.length === 0) return;
//         console.log('hello from datadistrib PDF')
//         console.log('hello from datadistrib PDF',data)
//         const createChartData = (field) => {
//             console.log('hello from datadistrib PDF')
//             const fieldValues = data.map(entry => parseFloat(entry[field]).toFixed(0));
//             const frequencyMap = fieldValues.reduce((acc, val) => {
//                 acc[val] = (acc[val] || 0) + 1;
//                 return acc;
//             }, {});

//             const labels = Object.keys(frequencyMap).sort((a, b) => parseFloat(a) - parseFloat(b));
//             const frequencies = Object.values(frequencyMap);
//             // const frequencies = labels.map(label => frequencyMap[label]);
            
//             return ({
//                 labels: labels,
//                 datasets: [{
//                     label: `Distribution of ${selectedField}`,
//                     data: frequencies,
//                     backgroundColor: 'rgba(255, 99, 132, 0.6)',
//                     barPercentage: 1,
//                     categoryPercentage: 1,
//                 }],
//             })
//         };

//         const newChartData = {};
//         fields.forEach(field => {
//             newChartData[field] = createChartData(field);
//             console.log('newChartData[field]  :',newChartData[field])
//         });

//         setChartData(newChartData);
//     }, [data]);

//     return (
//         <div id={id}>
//             <div className="flex flex-wrap justify-between">
                
//                 {fields.map(field => (
//                     <div key={field} className="w-full md:w-1/2 p-2">
                        
//                         <h2 className="text-lg font-bold mb-4 text-black-600">{`Distribution of ${field.replace(/_/g, ' ')}`}</h2>
//                         <Bar
//                             data={chartData[field]}
//                             options={{
//                                 responsive: true,
//                                 scales: {
//                                     x: {
//                                         title: {
//                                             display: true,
//                                             text: field.replace(/_/g, ' '),
//                                             color: '#333',
//                                             font: {
//                                                 weight: 'bold',
//                                             },
//                                         },
//                                         grid: {
//                                             display: false,
//                                         },
//                                     },
//                                     y: {
//                                         title: {
//                                             display: true,
//                                             text: 'Frequency',
//                                             color: '#333',
//                                             font: {
//                                                 weight: 'bold',
//                                             },
//                                         },
//                                         grid: {
//                                             display: true,
//                                         },
//                                     },
//                                 },
//                                 plugins: {
//                                     zoom: {
//                                         zoom: {
//                                             wheel: {
//                                                 enabled: true,
//                                             },
//                                             pinch: {
//                                                 enabled: true,
//                                             },
//                                             mode: 'xy',
//                                         },
//                                         pan: {
//                                             enabled: true,
//                                             mode: 'xy',
//                                         },
//                                     },
//                                 },
//                             }}
//                         />
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// ChartComponent.propTypes = {
//     data: PropTypes.array.isRequired,
//     id: PropTypes.string.isRequired,
// };

// export default ChartComponent;




// const ChartComponent = ({ data,id }) => {
//     const [chartData, setChartData] = useState({
//         labels: [],
//         datasets: [],
//     });
//     const [selectedField, setSelectedField] = useState('Active_Power');
//     const [allChartData, setAllChartData] = useState({});
//     const fields = ['Active_Power', 'Weather_Temperature_Celsius', 'Global_Horizontal_Radiation'];
//     useEffect(() => {
//         if (data.length === 0) return;
//         console.log('hello from datadistrib component')
//         // Extracting Active_Power values and rounding them to 2 decimal places
//         const selectedFieldValues = data.map(entry => parseFloat(entry[selectedField]).toFixed(0));

//         // Counting the frequency of each unique Active_Power value
//         const frequencyMap = selectedFieldValues.reduce((acc, val) => {
//             acc[val] = (acc[val] || 0) + 1;
//             return acc;
//         }, {});

//         // Extracting unique Active_Power values and their frequencies
//         const labels = Object.keys(frequencyMap);
//         const frequencies = Object.values(frequencyMap);

//         // Sorting labels in ascending order
//         labels.sort((a, b) => parseFloat(a) - parseFloat(b));

//         setChartData({
//             labels: labels,
//             datasets: [{
//                 label: `Distribution of ${selectedField}`,
//                 data: frequencies,
//                 backgroundColor: 'rgba(255, 99, 132, 0.6)',
//                 barPercentage: 1,
//                 categoryPercentage: 1,
//             }],
//         });
//         {console.log('chart Data from component: ',{chartData})}
//     }, [selectedField, data]);

//     const handleFieldChange = (event) => {
//         console.log('hello from handlefield');
//         setSelectedField(event.target.value);
//     };


//     return (
//         <div id={id}>
//         <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl ">
//             <h2 className="text-xl font-bold mb-4 text-green-600">Data Distribution</h2>
//             <div className="border-1 border-dashed border-emerald-600 mb-4"></div>
//             <div className="mb-4">
//                 <label htmlFor="field-select" className="mr-2">Select Field:</label>
//                 <select
//                     id="field-select"
//                     value={selectedField}
//                     onChange={handleFieldChange}
//                     className="border border-gray-300 rounded-md py-2 px-4"
//                 >
//                     <option value="Active_Power">Active Power</option>
//                     <option value="Weather_Temperature_Celsius">Weather Temperature (Celsius)</option>
//                     <option value="Global_Horizontal_Radiation">Global Horizontal Radiation</option>
//                     {/* Add more options for other fields as needed */}
//                 </select>
//             </div>
//             <div>
//                 <Bar
//                     data={chartData}
//                     options={{
//                         responsive: true,
//                         scales: {
//                             x: {
//                                 title: {
//                                     display: true,
//                                     text: selectedField,
//                                     color: '#333',
//                                     font: {
//                                         weight: 'bold',
//                                     }
//                                 },
//                                 grid: {
//                                     display: false,
//                                 }
//                             },
//                             y: {
//                                 title: {
//                                     display: true,
//                                     text: 'Frequency',
//                                     color: '#333',
//                                     font: {
//                                         weight: 'bold',
//                                     }
//                                 },
//                                 grid: {
//                                     display: true,
//                                 }
//                             },
//                         },
                        
//                         plugins: {
//                             zoom: {
//                                 zoom: {
//                                     wheel: {
//                                         enabled: true,
//                                     },
//                                     pinch: {
//                                         enabled: true
//                                     },
//                                     mode: 'xy',
//                                 },
//                                 pan: {
//                                     enabled: true,
//                                     mode: 'xy',
//                                 }
//                             }
//                         }
//                     }}
//                 />
//             </div>
//         </div>
//         </div>
//     );
// };
// ChartComponent.propTypes = {
//     data: PropTypes.array.isRequired,
//     id: PropTypes.string.isRequired,
// };

// export default ChartComponent;


Chart.register(zoomPlugin);

const ChartComponent = ({ data, id }) => {
    const fields = [ 'Active_Power','Weather_Temperature_Celsius', 'Global_Horizontal_Radiation'];
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });
    const [selectedField, setSelectedField] = useState('Active_Power');

    useEffect(() => {
        if (data.length === 0) return;

        const createChartData = (field) => {
            const fieldValues = data.map(entry => parseFloat(entry[field]).toFixed(0));
            const frequencyMap = fieldValues.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {});

            const labels = Object.keys(frequencyMap).sort((a, b) => parseFloat(a) - parseFloat(b));
            const frequencies = Object.values(frequencyMap);

            return {
                labels: labels,
                datasets: [{
                    label: ` ${field}`,
                    data: frequencies,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    barPercentage: 1,
                    categoryPercentage: 1,
                }],
            };
        };

        const newChartData = {};
        fields.forEach(field => {
            newChartData[field] = createChartData(field);
            //<h2 className="text-xl font-bold mb-4 text-black-600" style={{ fontSize: '100px' }}>{`Distribution of ${field.replace(/_/g, ' ')}`}</h2>
        });

        setChartData(newChartData);
    }, [data]);

    return (
        <div id={id}>
                <div  className="flex flex-wrap">
                    {fields.map(field => (
                        <div  key={field} className="w-full md:w-1/2 p-2">

                            <Bar
                                data={chartData[field] || { labels: [], datasets: [] }}
                                options={{
                                    responsive: true,
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: field.replace(/_/g, ' '),
                                                color: '#333',
                                                font: {
                                                    weight: 'bold',
                                                    size: 100
                                                },
                                            },
                                            grid: {
                                                display: false,
                                            },
                                            ticks: {
                                                font: {
                                                    size: 80, // Adjust the font size
                                                },
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Frequency',
                                                color: '#333',
                                                font: {
                                                    weight: 'bold',
                                                    size: 100
                                                },
                                            },
                                            grid: {
                                                display: true,
                                            },
                                            ticks: {
                                                font: {
                                                    size: 80, // Adjust the font size
                                                },
                                            },
                                        },
                                    },
                                    plugins: {
                                        legend: {
                                            labels: {
                                                font: {
                                                    size: 100, // Set the font size here
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
                                                    enabled: true,
                                                },
                                                mode: 'xy',
                                            },
                                            pan: {
                                                enabled: true,
                                                mode: 'xy',
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    ))}
                </div>
       
                </div>
    );
};

ChartComponent.propTypes = {
    data: PropTypes.array.isRequired,
    id: PropTypes.string.isRequired,
};

export default ChartComponent;
