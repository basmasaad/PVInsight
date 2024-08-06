import React from 'react';
import ChartWrapper from './UnivariateOutliersWrapper';
import MultivariateOutliers from './MODscatter';

const OutliersContainer = () => {
    return (
        // <div className="container mx-auto p-4">
        //     <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl mb-8">
        //         <ChartWrapper />
        //     </div>
        //     <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl">
        //         <MultivariateOutliers />
        //     </div>
        // </div>

        <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-green-600">Outliers detection</h2>
        <div className="border-1 border-dashed border-emerald-600 mb-4"></div>
        <div className="combined-chart-container">
        <div className="flex-grow "style={{ minHeight: '300px', height: '200%' }}>
            <ChartWrapper />
            </div>
            <div className="flex-grow">
            <MultivariateOutliers />
            </div>
        </div>
        </div>
    );
};

export default OutliersContainer;