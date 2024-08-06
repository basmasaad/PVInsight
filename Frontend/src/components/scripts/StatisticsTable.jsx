import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './mycss.css'; 
import PropTypes from 'prop-types';

const StatisticsTable = ({ id }) => {
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

    return (
        <div id={id}>
        <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl h-96 overflow-y-auto">
             <h2 className="text-xl font-bold mb-4 text-green-600">Statistics Table</h2>
             <div className="border-1 border-dashed border-emerald-600 mb-4"></div>
            <div className="flex items-center mb-4">
                <label htmlFor="field-select" className="mr-2">Select Field</label>
                <select
                    id="field-select"
                    value={selectedField}
                    onChange={handleFieldChange}
                    className="border border-gray-300 rounded-md py-2 px-4"
                >
                    <option value="">Select Field</option>
                    {statistics && Object.keys(statistics).map(fieldName => (
                        <option key={fieldName} value={fieldName}>{fieldName}</option>
                    ))}
                </select>
            </div>
            {selectedField && statistics && (
                <table className="table-auto w-full">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">Statistic</th>
                            <th className="px-4 py-2">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(statistics[selectedField]).map(statisticName => (
                            <tr key={statisticName}>
                                <td className="border px-4 py-2">{statisticName}</td>
                                <td className="border px-4 py-2">{statistics[selectedField][statisticName].toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
        </div>
    );
};
StatisticsTable.propTypes = {
    id: PropTypes.string.isRequired,
  };
export default StatisticsTable;
// const StatisticsTable = () => {
//     const [selectedField, setSelectedField] = useState('');
//     const [statistics, setStatistics] = useState(null);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await axios.get('http://localhost:5000/statistics');
//                 //console.log(Object.keys(response.data));
//                 setStatistics(response.data);
//             } catch (error) {
//                 console.error('Error fetching statistics:', error);
//             }
//         };

//         fetchData();
//     }, []);

//     const handleFieldChange = (event) => {
//         setSelectedField(event.target.value);
//     };

//     return (
    
//         <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl h-96 overflow-y-auto">
//             <h2 className="text-xl font-bold mb-4 text-green-600">Statistics Table</h2>
//             <div className="border-1 border-dashed border-emerald-600 mb-4"></div>
            
//                <div className="overflow-auto">
//                   <table className="table-auto w-full min-w-max">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Statistic</th>
//                             {statistics && Object.keys(statistics).map(field => (
//                                 <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{field}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                         {statistics && Object.entries(statistics[Object.keys(statistics)[0]]).map(([statisticName, _]) => (
//                             <tr key={statisticName}>
//                                 <td className="px-2 py-1 whitespace-nowrap">{statisticName}</td>
//                                 {Object.keys(statistics).map(field => (
//                                     <td key={`${field}-${statisticName}`} className="px-2 py-1 whitespace-nowrap">{statistics[field][statisticName].toFixed(2)}</td>
//                                 ))}
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
 
// };



// export default StatisticsTable;
