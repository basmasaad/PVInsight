import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const MultivariateOutliers = () => {
    const [trace1, setTrace1] = useState({});
    const [trace2, setTrace2] = useState({});
    const [selectedField, setSelectedField] = useState('');
    const [statistics, setStatistics] = useState(null);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/multivariate/outliers');
            const responseData = response.data;
            setStatistics(response.data);

            // console.log(responseData.inliers_x)

            // Example data for demonstration
            const traceData1 = {
                x: responseData.inliers_x,
                y: responseData.inliers_y,
                mode: 'markers',
                type: 'scatter',
                name: 'Inliers',
                marker: { size: 5 }
            };

            const traceData2 = {
                x: responseData.outliers_x,
                y: responseData.outliers_y,
                mode: 'markers',
                type: 'scatter',
                name: 'Outliers',
                marker: { size: 5 }
            };

            setTrace1(traceData1);
            setTrace2(traceData2);

        } catch (error) {
            console.error('Error fetching correlation data:', error);
        }
    };
    const handleFieldChange = (event) => {
        setSelectedField(event.target.value);
    };

    return (
        <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 text-green-600">MOD</h2>
            <Plot
                data={[
                    trace1, trace2
                ]}
                layout={{
                    width: 900,
                    height: 600,
                    title: 'Multivariate Outliers Scatter Plot'
                }}
            />
        </div>
    );
};

export default MultivariateOutliers;
