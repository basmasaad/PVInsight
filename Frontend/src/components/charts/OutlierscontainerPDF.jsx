import React from 'react';
import ChartWrapper from './UnivariateOutliersWrapperPDF';
import MultivariateOutliersPDF from './MODscatterPDF';
import PropTypes from 'prop-types';
const OutliersContainerPDF = ({id}) => {
    return (
        // <div className="container mx-auto p-4">
        //     <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl mb-8">
        //         <ChartWrapper />
        //     </div>
        //     <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl">
        //         <MultivariateOutliers />
        //     </div>
        // </div>

        
        
        
        <div id={id}>
        <div className="flex-grow "style={{ minHeight: '300px', height: '200%' }}>
            <ChartWrapper id={id} />
            </div>
            <div className="flex-grow">
            <MultivariateOutliersPDF id={id} />
            </div>
        </div>
        
    );
};
OutliersContainerPDF.propTypes = {
    id: PropTypes.string.isRequired,
};
export default OutliersContainerPDF;