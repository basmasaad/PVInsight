import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const MetricsByPannel = () => {
    const [grouping, setGrouping] = useState('D');
    const [stackMAE, setStackMAE] = useState({});
    const [stackNMAE, setStackNMAE] = useState({});
    const [stackRMSE, setStackRMSE] = useState({});
    const [stackNRMSE, setStackNRMSE] = useState({});
    const [stackMAPE, setStackMAPE] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/metrics/panel');
            const data = response.data;

            setStackMAE(data[0]);
            setStackNMAE(data[1]);
            setStackRMSE(data[2]);
            setStackNRMSE(data[3]);
            setStackMAPE(data[4]);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleGroupingChange = (event) => {
        setGrouping(event.target.value);
    };

    return (
        <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-green-600  mb-4">Metrics by Panel</h2>
            <div>
                <select
                    id="grouping"
                    value={grouping}
                    onChange={handleGroupingChange}
                    className="border border-gray-300 rounded-md py-2 px-4 mr-2"
                >
                    <option value="D">Day</option>
                    <option value="M">Month</option>
                    <option value="Y">Year</option>
                </select>
            </div>
            <div style={{ height: '100%', width: '100%' }}>
                <Plot
                    data={[
                        stackMAE,
                        stackNMAE,
                        stackRMSE,
                        stackNRMSE,
                        stackMAPE,
                    ]}
                    layout={{
                        autosize: true,
                        responsive: true,
                        margin: { t: 50, r: 30, b: 100, l: 30 },
                        xaxis: {
                            tickfont: {
                                size: 8.5 // Adjust font size for x-axis ticks
                            }
                        },
                        yaxis: {
                            tickfont: {
                                size: 8.5 // Adjust font size for y-axis ticks
                            }
                        }
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
};

export default MetricsByPannel;
