import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
const MultivariateOutliers = () => {
    const [trace1, setTrace1] = useState({ x: [], y: [], mode: 'markers', type: 'scatter', name: 'Inliers', marker: { size: 5 } });
    const [trace2, setTrace2] = useState({ x: [], y: [], mode: 'markers', type: 'scatter', name: 'Outliers', marker: { size: 5 } });
    const [selectedVersion, setSelectedVersion] = useState('');
    const [versions, setVersions] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [showChart, setShowChart] = useState(false);
    const [showSelector, setShowSelector] = useState(false);

    useEffect(() => {
        fetchVersions();
    }, []);

    const fetchVersions = async () => {
        console.log('Fetching versions in data');
        try {
            const response = await axios.get('http://localhost:5000/multivariate/versions');
            setVersions(response.data.versions);
            if (versions.length === 1) {
                setSelectedVersion(versions[0]);
                setShowSelector(true);  // Optionally, show selector if hidden
            }
            console.log('Existing versions are: ', response.data.versions);
        } catch (error) {
            console.error('Error fetching versions:', error);
        }
    };

    const fetchData = async () => {
        try {
            const version=selectedVersion
            console.log('Fetching data in fetch data');
            // Replace with your dynamic version value or variable

            const response = await axios.get(`http://localhost:5000/multivariate/outliers?version=${version}`);

            const responseData = response.data;
            if (responseData && responseData.inliers_x) {
                console.log('Inliers X:', responseData.inliers_x); // Check specific property access
            } else {
                console.log('ResponseData or inliers_x is undefined');
            }
            console.log('Data is finded');
            
            //console.log('Fetched version data: ', responseData["version_data"]["24"]);
            setStatistics(responseData);
            

            // Ensure selectedVersion is set before updating plots
            // if (selectedVersion && responseData.version_data[selectedVersion]) {
            //     updatePlots(selectedVersion, responseData.version_data);
            // } else {
            //     console.log(`Version ${selectedVersion} is not available in fetched data`);
            // }
        } catch (error) {
            console.error('Error fetching outliers data:', error);
        }
    };

    const updatePlots = () => {
        console.log('Update plot');
        if (statistics) {
            const traceData1 = {
                x: statistics.inliers_x,
                y: statistics.inliers_y,
                mode: 'markers',
                type: 'scatter',
                name: 'Inliers',
                marker: { size: 5 }
            };
    
            const traceData2 = {
                x: statistics.outliers_x,
                y: statistics.outliers_y,
                mode: 'markers',
                type: 'scatter',
                name: 'Outliers',
                marker: { size: 5 }
            };
    
            setTrace1(traceData1);
            setTrace2(traceData2);
        } else {
            console.log('Statistics data is not yet available');
        }
    };

    const handleShowChart = async () =>  {
        console.log('Show chart');
        fetchData();
        
        //console.log('statistics :',statistics);
        console.log('The version :',selectedVersion);
        if (statistics) {
            updatePlots();
        } else {
            console.log('Statistics data is not yet available');
        }
        setShowChart(true);
    };

    const handleVersionChange = (event) => {
        const version = String(event.target.value);
        console.log('handleVersionChange choosed version is : ', version);
        setSelectedVersion(version);

        // Update plots after ensuring statistics are set
        
    };

    const handleShowSelector = () => {
        fetchVersions();
        setShowSelector(true);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-green-600">Multivariate Outliers</h2>
            <button 
                onClick={handleShowSelector} 
                className="mb-4 p-2 border border-gray-300 rounded-md"
            >
                Detect Multivariate Outliers
            </button>
            {showSelector && (
                <div className="p-1">
                    <label htmlFor="modselector" className="mr-2">Select Version:</label>
                    <select
                        id="version-select"
                        value={selectedVersion}
                        onChange={handleVersionChange}
                        className="border border-gray-300 rounded-md py-2 px-4"
                    >
                        {versions.map((version, index) => (
                            <option key={index} value={version}>PV Array {version}</option>
                        ))}
                    </select>
                    <button 
                        onClick={handleShowChart} 
                        className="mb-4 p-2 border border-gray-300 rounded-md"
                    >
                        Show Chart
                    </button>
                </div>
            )}

            {showChart && (
                <div style={{ width: '100%', height: '500px' }}>
                    <Plot
                        data={[trace1, trace2]}
                        layout={{
                            autosize: true,
                            responsive: true,
                            margin: { t: 50, r: 30, b: 100, l: 30 },
                            xaxis: {
                                tickfont: {
                                    size: 8.5 // Adjust font size for x-axis ticks
                                }
                            },
                            yaxis: {
                                tickfont: {
                                    size: 8.5 // Adjust font size for y-axis ticks
                                }
                            }
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            )}
        </div>
    );
};

export default MultivariateOutliers;