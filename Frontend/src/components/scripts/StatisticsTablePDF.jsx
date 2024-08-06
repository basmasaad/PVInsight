import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './mycss.css'; 
import PropTypes from 'prop-types';
const StatisticsTablePDF = ({id}) => {
    const [selectedField, setSelectedField] = useState('');
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/statistics');
                //console.log(Object.keys(response.data));
                setStatistics(response.data);
            } catch (error) {
                console.error('Error fetching statistics:', error);
            }
        };

        fetchData();
    }, []);

    const handleFieldChange = (event) => {
        setSelectedField(event.target.value);
    };
    const offScreenStyles = {
        position: 'absolute',
        left: '-9999px',  // Move left outside the viewport
        top: '0',         // Keep at the top to prevent scrolling issues
        opacity: '0',     // Make invisible
        pointerEvents: 'none', // Disable pointer events
      };
    

    return (
        <div id={id}>
        <div className="border-1 "></div>
        <div className="overflow-auto">
            <table className="table-auto w-full min-w-max">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-2 py-1 text-xs font-small text-black-500 uppercase tracking-wider text-center">Statistic</th>
                        {statistics && Object.keys(statistics).map(field => (
                            <th key={field} className="px-6 py-3 text-xs font-small text-black-500 uppercase tracking-wider text-center">{field}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-black-200">
                    {statistics && Object.entries(statistics[Object.keys(statistics)[0]]).map(([statisticName, _]) => (
                        <tr key={statisticName}>
                            <td className="px-2 py-1 whitespace-nowrap text-center">{statisticName}</td>
                            {Object.keys(statistics).map(field => (
                                <td key={`${field}-${statisticName}`} className="px-6 py-1 whitespace-nowrap text-center">{statistics[field][statisticName].toFixed(2)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
    
 
};
StatisticsTablePDF.propTypes = {
    id: PropTypes.string.isRequired,
  };


export default StatisticsTablePDF;
