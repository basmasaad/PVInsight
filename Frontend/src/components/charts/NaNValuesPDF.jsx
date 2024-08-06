import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';
const ChartComponentPDF = ({id}) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {

                const response = await axios.get('http://localhost:5000/NaNvalue');
                const data = response.data;

                setChartData({
                    labels: Object.keys(data),
                    datasets: [
                        {
                            label: '%NaN Values',
                            data: Object.values(data),
                            fill: false,
                            backgroundColor: 'rgba(234, 174, 199, 0.8)',
                        }
                    ]
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);


    return (
        <div id={id}>
            <div className="border-1"></div>
            <div style={{ height: '500px', width: '1000px' }}>
                <Bar data={chartData}
                    options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                            legend: {
                                labels: {
                                    font: {
                                        size: 15, // Set the font size here
                                        weight: 'bold' // Bold font for better visibility
                                    }
                                },
                                display: true,
                                position: 'top',
                            },
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: true,
                                    lineWidth: 1,
                                    color: 'rgba(0, 0, 0, 0.1)',
                                },
                                ticks: {
                                    font: {
                                        size: 15, // Adjust the font size
                                    },
                                },
                            },
                            y: {
                                grid: {
                                    display: true,
                                    lineWidth: 1,
                                    color: 'rgba(0, 0, 0, 0.1)',
                                },
                                ticks: {
                                    font: {
                                        size: 15, // Adjust the font size
                                    },
                                },
                            },
                        },
                    }}
                
                    />
            </div>
        </div>
       
    );


};
ChartComponentPDF.propTypes = {
    id: PropTypes.string.isRequired,
  };

export default ChartComponentPDF;
