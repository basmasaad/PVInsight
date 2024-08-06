import HandleNaNValues from './../scripts/HandleNaNValues'
import React, { useState } from 'react';
import DataNormalization from '../scripts/DataNormalization'
import DataEncoding from '../scripts/DataEncoding'
import UnivariateOutliers from '../scripts/UnivariateOutliersHandler'
import DataReduction from '../scripts/DataReduction'
import DataFiltering from '../scripts/DataFiltering'
import DataSplitting from './DataSplitting';
import MultivariateOutlierHandler from '../charts/MultivariateOutliersHandler';
import NaNvalueHandlerTest from '../scripts/NaNvalueHandlerTest';
export default function Preprocessing({ mode, setMode }) {
  // const [mode, setMode] = useState('test');
    
  return (
    <div className="flex flex-col space-y-6">
       <div className="flex items-center justify-center mb-4">
        <label className="mr-4 cursor-pointer">
          <input
            type="radio"
            value="test"
            checked={mode === 'test'}
            onChange={() => setMode('test')}
            className="hidden"
          />
          <span className="hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border-1 border-blue-500 hover:border-transparent rounded {{ mode === 'test' ? 'bg-blue-500 text-white' : '' }}">
            Use Existing Models
          </span>
        </label>
        <label className="cursor-pointer">
          <input
            type="radio"
            value="training"
            checked={mode === 'training'}
            onChange={() => setMode('training')}
            className="hidden"
          />
          <span className="hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border-1 border-blue-500 hover:border-transparent rounded {{ mode === 'training' ? 'bg-blue-500 text-white' : '' }}">
            Training from Scratch
          </span>
        </label>
      </div>
      {mode === 'test' ? (
        <NaNvalueHandlerTest />
      ) : (
        <>
          <DataSplitting/>
          <HandleNaNValues />
          <DataEncoding />
          <DataReduction />
          
          
          <UnivariateOutliers />
          <MultivariateOutlierHandler/>
          <DataNormalization />
          
          
        </>
      
      )}
      
    </div>
  );
}
