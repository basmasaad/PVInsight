import React, { useState } from 'react';
import ModelEvaluationTable from '../scripts/ModelEvaluationTable';
import TrainingComponent from '../scripts/ModelTraining';
import PredictionMatrics from '../scripts/PredictionMatrics';

export default function Prediction({ mode }) {
  // const [mode, setMode] = useState('test');

  return (
    // <div className="flex flex-col">
    //   <div className="flex items-center justify-center mb-4">
    //     <label className="mr-4 cursor-pointer">
    //       <input
    //         type="radio"
    //         value="test"
    //         checked={mode === 'test'}
    //         onChange={() => setMode('test')}
    //         className="hidden"
    //       />
    //       <span className="hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border-1 border-blue-500 hover:border-transparent rounded {{ mode === 'test' ? 'bg-blue-500 text-white' : '' }}">
    //         Use Existing Models
    //       </span>
    //     </label>
    //     <label className="cursor-pointer">
    //       <input
    //         type="radio"
    //         value="training"
    //         checked={mode === 'training'}
    //         onChange={() => setMode('training')}
    //         className="hidden"
    //       />
    //       <span className="hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border-1 border-blue-500 hover:border-transparent rounded {{ mode === 'training' ? 'bg-blue-500 text-white' : '' }}">
    //         Training from Scratch
    //       </span>
    //     </label>
    //   </div>

    <div className="flex flex-col">
      {mode === 'test' ? (
        <ModelEvaluationTable />
      ) : (
        <TrainingComponent />
      )}
    </div>
  );
}
