import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModelEvaluation = () => {
    const [data, setData] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');

    useEffect(() => {

    }, []);

    const fetchData = async () => {
        try {
            const dataToSend = {
                mode: 'test',
                model:selectedModel
               
                
            };
            const response = await axios.post('http://localhost:5000/model/predict',dataToSend);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching missing rows:', error);
        }
    };
    
    useEffect(() => {
        // Effectue la requête pour récupérer les modèles depuis l'API
        axios.get("http://localhost:5000/getAllModels")
          .then(response => {
            // Met à jour l'état avec les modèles récupérés depuis l'API
            setModels(response.data);
          })
          .catch(error => {
            console.error("Erreur lors de la récupération des modèles :", error);
          });
      }, []); // Exécuté uniquement une fois après le montage du composant
    
      const handleModelChange = (event) => {
        setSelectedModel(event.target.value);
      };

    const handlePredict = () => {
        fetchData();
        console.log("Prédiction pour le modèle :", selectedModel);

    };

    return (
        <div className="p-4 border-1 border-dashed border-emerald-600 rounded-2xl">
            <h2 className="text-lg font-bold text-green-600 mb-4">Choose the Trained Model</h2>
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
                    
                    
                    className="mr-4 border border-gray-300 rounded"
                >
                    <option value="">Select FH</option>
                    
                        <option key='5 minutes' value='5 minutes'>5 minutes</option>
                        <option key='5 minutes' value='5 minutes'>15 minutes</option>
                        <option key='5 minutes' value='5 minutes'>30 minutes</option>
                        <option key='5 minutes' value='5 minutes'>1 Hour</option>
                        <option key='5 minutes' value='5 minutes'>1 Day</option>
                    
                </select>
                <button onClick={handlePredict} className="hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border-1 border-blue-500 hover:border-transparent rounded">
                    Predict
                </button>
            </div>
            
        </div>
    );
};

export default ModelEvaluation;
