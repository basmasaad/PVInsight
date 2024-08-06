import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModelTraining = () => {
    const [columns, setColumns] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedHorizon, setSelectedHorizon] = useState('');
    const [selectedResolution, setSelectedResolution] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [selectedColumns, setSelectedColumns] = useState([]);

    useEffect(() => {
        fetchColumns();
    }, []);

    const fetchColumns = async () => {
        try {
            const response = await fetch('http://localhost:5000/columns');
            const data = await response.json();
            setColumns(data.columns);
        } catch (error) {
            console.error('Error fetching columns:', error);
        }
    };

    // Function to handle column selection
    const handleColumnSelect = (e) => {
        const { value } = e.target;
        //setselectedColumn(...selectedColumn, value);
    };

    useEffect(() => {
        // Effectue la requête pour récupérer les modèles depuis l'API
        
                // Met à jour l'état avec les modèles récupérés depuis l'API
        setModels([{'modelName':'LSTM'},{'modelName':'CNN'},{'modelName':'MLP'},{'modelName':'SVM'}]);
            
    }, []); // Exécuté uniquement une fois après le montage du composant

    const handleModelChange = (event) => {
        setSelectedModel(event.target.value);
    };
    const handleHorizonChange = (event) => {
        setSelectedHorizon(event.target.value);
    };
    const handleResolutionChange = (event) => {
        setSelectedResolution(event.target.value);
    };

    const handleTraining = async() => {
        setLoading(true); // Set loading state to true when training starts
        console.log("Training model:", selectedModel);
        try {
            const dataToSend = {
                modelname: selectedModel,
                horizon: selectedHorizon,
                resolution: selectedResolution
            };

            // Send request to the backend to start training the model
            const response = await axios.post('http://localhost:5000/learningModels', dataToSend);

            // Assume the response indicates that training is complete
            setSuccessMessage(response.data.message);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error processing:', error);
            setError('Error processing');

            // Clear error message after 3 seconds
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false); // Set loading state to false when training completes
            console.log("Training completed!");
        }
    };

    return (
        <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl">
            <h2 className="text-lg font-bold text-green-600 mb-4">Model Training</h2>
            <div className="mb-4 mr-4">
                <select
                    value={selectedModel}
                    onChange={handleModelChange}
                    className="mr-4 border border-gray-300 rounded"
                >
                    <option value="">Select Model</option>
                    {models.map(model => (
                        <option key={model.modelName} value={model.modelName}>{model.modelName}</option>
                    ))}
                </select>
                <select
                    value={selectedHorizon}
                    onChange={handleHorizonChange}
                    className="mr-4 border border-gray-300 rounded"
                >
                    <option value="">Select FH</option>
                    <option key='5m'value='5m'>5 minutes</option>
                                                <option key='15m'value='15m'>15 minutes</option>
                                                <option key='1h'value='1h'>1 Hour</option>
                                                <option key='1d'value='1d'>1 Day</option>
                                                <option key='1m'value='1m'>1 Month</option>
                                                <option key='1y'value='1y'>1 Year</option>
                                            
                </select> 
                <select
                    value={selectedResolution}
                    onChange={handleResolutionChange}
                    className="mr-4 border border-gray-300 rounded"
                >
                    <option value="">Select DR</option>
                    <option key='5m'value='5m'>5 minutes</option>
                                                <option key='15m'value='15m'>15 minutes</option>
                                                <option key='1h'value='1h'>1 Hour</option>
                                                <option key='1d'value='1d'>1 Day</option>
                                                <option key='1m'value='1m'>1 Month</option>
                                                <option key='1y'value='1y'>1 Year</option>
                                                            
                </select>

                <button onClick={handleTraining} disabled={!selectedModel || loading} className={`hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border-1 border-blue-500 hover:border-transparent rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {loading ? (
                        <div className="flex items-center">
                            <div className="w-5 h-5 mr-2 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                            <span>Training...</span>
                        </div>
                    ) : (
                        <span>Train</span>
                    )}
                </button>
            </div>

            {successMessage && (
                <div className="mt-4 px-4 py-3 mb-3 bg-green-100 border border-green-400 text-green-700 rounded relative" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> {successMessage}</span>
                </div>
            )}



        </div>
    );
};

export default ModelTraining;
