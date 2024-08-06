import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChartComponent from './UnivariateOutliersPDF';
import PropTypes from 'prop-types';
const ChartWrapper = ({id}) => {
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
        <div id={id}>
        <h3 className="text-xl font-bold mb-4 text-black-600">Univariate Outliers</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {chartData && Object.entries(chartData).map(([label, data]) => {
                return <ChartComponent key={label} label={label} data={data} />;
            })}
        </div>
    </div>
    );
};
ChartWrapper.propTypes = {
    id: PropTypes.string.isRequired,
};

export default ChartWrapper;
