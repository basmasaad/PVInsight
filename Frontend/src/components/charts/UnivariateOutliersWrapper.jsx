import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChartComponent from './UnivariateOutliers';

const ChartWrapper = () => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/outliers');
                const data = response.data;
                //console.log(Object.values(data)[0]);
                setChartData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className=" h-96 overflow-y-auto">
            
            
            <h3 className="text-xl font-bold mb-4 text-green-600">Univariate Outliers</h3> 
            <div style={{ height: '100%', width: '100%' }}>
            {chartData && Object.entries(chartData).map(([label, data]) => {
                // console.log("Label--1:", label);
                // console.log("Data--1:", data);
                return <ChartComponent key={label} label={label} data={data} />;
            })}
            </div>
        </div>
    );
};

export default ChartWrapper;
