import React from 'react';
import DataEntriesByArrayPDF from './DataEntriesByArrayPDF';
import DataEntriesByTimePDF from './DataEntriesByTimePDF';
import PropTypes from 'prop-types';
const DataVisualizationPDF = ({ data ,id}) => {
    return (
        <div id={id}>
    <div className="flex-grow" style={{ minHeight: '300px', height: '200%', marginBottom: '0' }}>
        <DataEntriesByTimePDF data={data} id={id} />
    </div>
    <div className="flex-grow" style={{ marginTop: '0' }}>
        <DataEntriesByArrayPDF data={data} id={id} />
    </div>
</div>
        
    );
};
DataVisualizationPDF.propTypes = {
    data: PropTypes.array.isRequired,
    id: PropTypes.string.isRequired,
  };
export default DataVisualizationPDF;