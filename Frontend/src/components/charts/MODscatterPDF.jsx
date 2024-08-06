import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import PropTypes from 'prop-types';
// const MultivariateOutliers = ({ id }) => {
//     const [traces, setTraces] = useState([]);
//     const [versions, setVersions] = useState([]);
//     const [trace1, setTrace1] = useState([]);
//     const [trace2, setTrace2] = useState([]);

//     useEffect(() => {
//         fetchVersions();
//     }, []);

//     const fetchVersions = async () => {
//         try {
//             const response = await axios.get('http://localhost:5000/multivariate/versions');
//             setVersions(response.data.versions);
//             fetchMODData(response.data.versions);
//             console.log('Existing versions are: ', response.data.versions);
//         } catch (error) {
//             console.error('Error fetching versions:', error);
//         }
//     };

//     const fetchMODData = async (versions) => {
//         try {
//             const promises = versions.map(version =>
//                 axios.get(`http://localhost:5000/multivariate/outliers?version=${version}`)
//             );

//             const responses = await Promise.all(promises);
//             const MODTraces = responses.map((response, index) => ({
//                 x: response.data.inliers_x,
//                 y: response.data.inliers_y,
//                 mode: 'markers',
//                 type: 'scatter',
//                 name: `Inliers PV Array ${versions[index]}`,
//                 marker: { size: 5 }
//             }));
//             const traceData1 = responses.map((response, index) => ({
//                 x: response.data.inliers_x,
//                 y: response.data.inliers_y,
//                 mode: 'markers',
//                 type: 'scatter',
//                 name: 'Outliers',
//                 marker: { size: 5 }
//             }));
    
//             const traceData2 = responses.map((response, index) => ({
//                 x: response.data.outliers_x,
//                 y: response.data.outliers_y,
//                 mode: 'markers',
//                 type: 'scatter',
//                 name: 'Inliers',
//                 marker: { size: 5 }
//             }));

//             setTraces(MODTraces);
//             console.log('MODTraces  ',MODTraces)
//             setTrace1(traceData1);
//             console.log('MODTraces  ',traceData1)
//             setTrace2(traceData2);
//             console.log('MODTraces  ',traceData2)
//         } catch (error) {
//             console.error('Error fetching MOD data:', error);
//         }
//     };

//     return (
//         <div id={id}>
//             <h2 className="text-xl font-bold mb-4 text-green-600">Multivariate Outliers</h2>
            
//                 <div style={{ width: '100%', height: '500px' }}>
//                     <Plot
//                         data={[...trace1,...trace2]}
//                         layout={{
//                             autosize: true,
//                             responsive: true,
//                             margin: { t: 50, r: 30, b: 100, l: 30 },
//                             xaxis: {
//                                 tickfont: {
//                                     size: 8.5 // Adjust font size for x-axis ticks
//                                 }
//                             },
//                             yaxis: {
//                                 tickfont: {
//                                     size: 8.5 // Adjust font size for y-axis ticks
//                                 }
//                             }
//                         }}
//                         useResizeHandler={true}
//                         style={{ width: '100%', height: '100%' }}
//                     />
//                 </div>
            
//         </div>
//     );
// };

// MultivariateOutliers.propTypes = {
//     id: PropTypes.string.isRequired,
// };

// export default MultivariateOutliers;
const MultivariateOutliers = ({ id }) => {
    const [dataByVersion, setDataByVersion] = useState([]);
    const [versions, setVersions] = useState([]);

    useEffect(() => {
        fetchVersions();
    }, []);

    const fetchVersions = async () => {
        try {
            const response = await axios.get('http://localhost:5000/multivariate/versions');
            const versionList = response.data.versions;
            setVersions(versionList);
            fetchMODData(versionList);
            console.log('Existing versions are: ', versionList);
        } catch (error) {
            console.error('Error fetching versions:', error);
        }
    };

    const fetchMODData = async (versions) => {
        try {
            const promises = versions.map(version =>
                axios.get(`http://localhost:5000/multivariate/outliers?version=${version}`)
            );

            const responses = await Promise.all(promises);
            const data = responses.map((response, index) => ({
                version: versions[index],
                inliers: {
                    x: response.data.inliers_x,
                    y: response.data.inliers_y,
                    mode: 'markers',
                    type: 'scatter',
                    name: `Inliers PV Array ${versions[index]}`,
                    marker: { size: 7 }
                },
                outliers: {
                    x: response.data.outliers_x,
                    y: response.data.outliers_y,
                    mode: 'markers',
                    type: 'scatter',
                    name: `Outliers PV Array ${versions[index]}`,
                    marker: { size: 7 }
                }
            }));
            
            setDataByVersion(data);
            console.log('Fetched MOD data by version:', data);
        } catch (error) {
            console.error('Error fetching MOD data:', error);
        }
    };

    return (
        <div id={id}>
            <h2 className="text-xl font-bold mb-4 text-black-600">Multivariate Outliers</h2>
            {dataByVersion.map(({ version, inliers, outliers }) => (
                <div key={version} style={{ width: '100%', height: '500px', marginBottom: '20px' }}>
                    <h3 className="text-lg font-bold mb-2 text-black-600">Version: {version}</h3>
                    <Plot
                        data={[inliers, outliers]}
                        layout={{
                            autosize: true,
                            responsive: true,
                            margin: { t: 50, r: 30, b: 100, l: 30 },
                            xaxis: {
                                title: 'Solar Irradiance',
                                tickfont: {
                                    size: 15 // Adjust font size for x-axis ticks
                                }
                            },
                            yaxis: {
                                title: 'Photovoltaique Power',
                                tickfont: {
                                    size: 12 // Adjust font size for y-axis ticks
                                }
                            }
                        }}
                        useResizeHandler={true}
                        style={{ width: '70%', height: '100%' }}
                    />
                </div>
            ))}
        </div>
    );
};

MultivariateOutliers.propTypes = {
    id: PropTypes.string.isRequired,
};

export default MultivariateOutliers;