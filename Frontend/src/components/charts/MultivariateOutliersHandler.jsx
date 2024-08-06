import React, { useState } from 'react';
import axios from 'axios';

const MultivariateOutlierHandler = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleOutliers = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.get('http://localhost:5000/multivariate/handleoutliers');
      if (response.status === 200) {
        setMessage('Outliers processed successfully.');
      } else {
        setMessage('Failed to process outliers.');
      }
    } catch (error) {
      setMessage('Error: ' + error.response.data.error);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl">
      <h2 className="text-xl font-bold mb-4 text-green-600">Multivariate Outliers Handler</h2>
      <button
        onClick={handleOutliers}
        className="hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border-1 border-blue-500 hover:border-transparent rounded"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Delete Multivariate Outliers'}
      </button>

      {message && (
        <div className={`mt-4 ${message.includes('successfully') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} px-4 py-3 rounded`}>
          <strong className="font-bold">{message.includes('successfully') ? 'Success!' : 'Error!'}</strong>
          <span className="block sm:inline"> {message}</span>
        </div>
      )}
    </div>
  );
};

export default MultivariateOutlierHandler;

