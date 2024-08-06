import React from 'react';
import DataEntiesByTime from './DataEntiesByTime';
import DataEntriesByArray from './DataEntriesByArray';

const DataVisualization = ({ data }) => {
    return (
        <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl h-96 overflow-y-auto">
        
        <div className="combined-chart-container">
        <div className="flex-grow "style={{ minHeight: '300px', height: '200%' }}>
            <DataEntiesByTime data={data} />
            </div>
            <div className="flex-grow">
            <DataEntriesByArray data={data} />
            </div>
        </div>
        </div>
    );
};

export default DataVisualization;