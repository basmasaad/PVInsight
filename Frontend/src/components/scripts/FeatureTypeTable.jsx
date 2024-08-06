import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const DataTypeTable = ({ id }) => {
    const [data, setData] = useState([]);
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/data/type');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching missing rows:', error);
        }
    };

    return (
        <div id={id}>
        
        <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-green-600">Data Description</h2>
            <div className="border-1 border-dashed border-emerald-600 mb-4"></div>
            <div className="overflow-auto">
            <table className="table-auto min-w-max">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column Name</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(data).map(([columnName, type], index) => (
                        <tr key={index}>
                            <td className="px-2 py-1 whitespace-nowrap">{columnName}</td>
                            <td className="px-2 py-1 whitespace-nowrap">{type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div> 
        </div>
    );
};
DataTypeTable.propTypes = {
    id: PropTypes.string.isRequired,
  };

export default DataTypeTable;
