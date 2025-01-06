import { useState, useEffect } from "react";
import axios from 'axios';
import React from 'react';
import DataEntriesByArray from '../charts/DataEntriesByArray'
import DataEntiesByTime from '../charts/DataEntiesByTime'
import DataDistribution from '../charts/DataDistribution'
import DataVisualization from '../charts/DataVisualization'
import MissingRowsTable from '../scripts/MissingRowsTable'
import CorrelationScatterPlot from '../charts/CorrelationScatterPlot'
import StatisticsTable from '../scripts/StatisticsTable'
import ComponentWithCheckbox from "./ComponentWithCheckbox";
import FeatureSelection from '../scripts/FeatureSelection'
import NaNValues from '../charts/NaNValues'
import UnivariateOutliersWrapper from '../charts/UnivariateOutliersWrapper'
import CorrelationHeatmap from '../charts/CorrelationHeatmap'
import CorrelationBarChart from './../charts/CorrelationBarChart'
import FeatureTypeTable from './../scripts/FeatureTypeTable'
import MultivariateOutliers from './../charts/MODscatter'
import OutliersContainer from "../charts/Outlierscontainer";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactDOMServer from 'react-dom/server';
import 'jspdf-autotable';
import StatisticsTablePDF from "../scripts/StatisticsTablePDF";
import DataDistributionPDF from '../charts/DataDistributionPDF'
import DataVisualizationPDF from '../charts/DataVisualizationPDF'
import MissingRowsTablePDF from '../scripts/MissingRowsTablePDF'
import OutliersContainerPDF from "../charts/OutlierscontainerPDF";
import FeatureTypeTablePDF from './../scripts/FeatureTypeTablePDF'
import NaNValuesPDF from '../charts/NaNValuesPDF'
import CorrelationHeatmapPDF from '../charts/CorrelationHeatmapPDF'
import logo from '../../assets/logo1.png'
export default function VisualizeStatistics() {
  const [chartData, setChartData] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [selectedComponentspdf, setSelectedComponentspdf] = useState([]);
  const [renderOffScreen, setRenderOffScreen] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {

        const dataToSend = { username: localStorage.getItem('username') };
        const response = await axios.post('http://localhost:5000/files', dataToSend);
        setChartData(response.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  
  const handleCheckboxChange = (component) => {
    setSelectedComponents((prevSelectedComponents) => {
      if (prevSelectedComponents.includes(component)) {
        return prevSelectedComponents.filter((item) => item !== component);
      } else {
        return [...prevSelectedComponents, component];
      }
    });
  };

  // const generatePdf = async () => {
  //   if (selectedComponents.length === 0) {
  //     alert("Please select at least one component to export.");
  //     return;
  //   }

  //   const pdf = new jsPDF();
  //   for (const component of selectedComponents) {
  //     const input = document.getElementById(component);
  //     const canvas = await html2canvas(input);
  //     const imgData = canvas.toDataURL('image/png');
  //     pdf.addImage(imgData, 'PNG', 10, 10);
  //     pdf.addPage();
  //   }
  //   pdf.save(`report.pdf`);
  // };
  const generatePdf = async () => {
    if (selectedComponents.length === 0) {
        alert("Please select at least one component to export.");
        return;
    }
    setRenderOffScreen(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const pdf = new jsPDF();
    const logoImageData = logo; // Replace with actual base64 string if needed
    const logoWidth = 30; // Adjust width as needed
    const logoHeight = 20; // Adjust height as needed
    pdf.addImage(logoImageData, 'PNG', 10,10, logoWidth, logoHeight);

    // Set document properties and add title
    pdf.setProperties({ title: 'Exploratory Data Analysis Report' });
    pdf.setFont('helvetica', 'bold'); // You can use other fonts if needed

    // Set the text color to blue (RGB: 0, 0, 255)
    pdf.setTextColor(100, 149, 237);
    // Add title with larger font size and centered
    pdf.setFontSize(20);
    pdf.text('Exploratory Data Analysis Report', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica','normal');
    // Set smaller font size for descriptions
    pdf.setFontSize(12);

    // Add introduction text
    const introText = 'Exploratory Data Analysis (EDA) is an approach to analyzing data sets to summarize their main characteristics, often with visual methods. It helps in understanding the data\'s underlying structure, identifying patterns, detecting anomalies, and formulating hypotheses for further investigation.';
    pdf.text(introText, 12, 40, { align: 'justify', maxWidth: pdf.internal.pageSize.getWidth() - 30 });

    let startY = 60; // Initial startY position for components
    console.log('the begining: ',startY)
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    for (let component of selectedComponents) {
     
        console.log('component: ')
        // Get component description based on component ID
        let componentMarkup = '';
        let componentToRender = '';
        let description = '';
        let ttl='';
        switch (component) {
            case 'StatisticsTable':
                ttl='Statistics Table';
                description = 'This table displays statistical data including mean, median, mode, variance, etc., to describe the data\'s central tendency and dispersion.';
                componentToRender = <StatisticsTablePDF id="StatisticsTablePDF" />;
                console.log(componentToRender.props.id)
                break;
            case 'DataVisualization':
                ttl='Data Visualization';
                description = 'This charts visualizes grouped data by Panels characteristics or Time using charts and graphs (like histograms, scatter plots, box plots) to visually explore relationships and trends within the data.';
                componentMarkup = component;
                componentToRender= <DataVisualizationPDF id="DataVisualizationPDF" data={chartData}/>;
                console.log(component)
                break;
            case 'DataDistribution':
                ttl='Data Distribution';
                description = 'This feature visualizes the distribution of numerical variables, It helps in assessing the normality and Gaussian characteristics of data.';
                componentMarkup = component;
                componentToRender= <DataDistributionPDF id="DataDistributionPDF" data={chartData}/>;
                console.log(component)
                break;
            case 'MissingRowsTable':
                ttl='Missing Rows'
                description = 'This table displays time and corresponding PV arrays where data is missing, It helps visualize temporal and spatial patterns of missing data.';
                componentMarkup = component;
                componentToRender= <MissingRowsTablePDF id="MissingRowsTablePDF" />;
                console.log(component)
                break;
            case 'OutliersContainer':
                ttl='Outliers Detection'
                description = 'This feature detect two types of outliers. Univariate outliers that are abnormal data in each numerical column and Mutlivariate outliers that are outliers between solar irradiance and PV power output of each single PV Array.';
                componentMarkup = component;
                componentToRender= <OutliersContainerPDF id="OutliersContainerPDF"/>;
                console.log(component)
                break;
            case 'FeatureTypeTable':
              console.log('ftt component: ')
                ttl='Features Type'
                description = 'This table categorizes each column based on data type, distinguishing between floating-point numbers (float), integers (int), and categorical variables (object). This classification helps in understanding the nature of each dataset attribute.';
                componentMarkup = component;
                componentToRender= <FeatureTypeTablePDF id="FeatureTypeTablePDF" />;
                console.log(component)
                break;
            case 'NaNValues':
                ttl='NaN Values'
                description = 'This graph visually represents the percentage of NaN (Not a Number) values present in each column of the dataset. It provides insights into data completeness and quality, highlighting columns with significant missing data..';
                componentMarkup = component;
                componentToRender= <NaNValuesPDF id="NaNValuesPDF"/>;
                console.log(component)
                break;
            case 'CorrelationHeatmap':
                ttl='Data Correlation'
                description = 'This analysis includes a correlation heatmap of all features, revealing interdependencies among variables, and a correlation plot of features against the target, identifying predictors most influential in PV power forecasting.';
                componentMarkup = component;
                componentToRender= <CorrelationHeatmapPDF id="CorrelationHeatmapPDF"/>;
                console.log(component)
                break;
            // Add descriptions for other components as needed
            default:
                ttl='';
                description = '';
                componentMarkup='';
                componentToRender = '';
                break;
        }
        //const container = document.createElement('div');
        //container.style.position = 'absolute';
        //container.style.left = '-9999px';
        //container.style.top = '0';
        //document.body.appendChild(container);

        //container.appendChild(React.createElement(componentToRender.type, { ...componentToRender.props }));
      
        await new Promise(resolve => setTimeout(resolve, 1000)); // Ensure rendering completes

        
        console.log('hi: ')
        const input = document.getElementById(componentToRender.props.id);
        //const input = document.getElementById(component);
        //document.body.appendChild(componentMarkup); // Ensure it's added to the document
         
  // Wait for component to be fully rendered
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('component is rendered: ')
        const canvas = await new Promise(resolve => {
          setTimeout(() => {
              html2canvas(input, {
                  scale: 3,
                  logging: false,
              }).then(resolve);
          }, 1000);  // Add a timeout/delay before starting the rendering
      });
        console.log('canvas is made: ')
        pdf.setTextColor(100, 149, 237);
        console.log('ccolor is set: ')
        // Add title with larger font size and centered
        pdf.setFontSize(12);
        startY += 5
        pdf.text(ttl, 12,startY);
        startY += 8
        if (startY >= pageHeight - (margin+20)) { // Adjust the threshold based on page height
          pdf.addPage(); // Add a new page
          startY = margin; // Reset startY for the new page
          console.log('New page added ',startY)
      }
        pdf.setTextColor(0, 0, 0);
        
        // Set smaller font size for descriptions
        pdf.setFontSize(12);
        // Add component description as text
        pdf.text(description, 12, startY, { align: 'justify', maxWidth: pdf.internal.pageSize.getWidth() - 30 });
        startY += 5;
        if (startY >= pageHeight - margin) { // Adjust the threshold based on page height
          pdf.addPage(); // Add a new page
          startY = margin; // Reset startY for the new page
          console.log('New page added ',startY)
      }
        console.log('description added , startY: ',startY)
        // Add component screenshot as image
        console.log('making image: ')
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2;
        const maxHeight = pdf.internal.pageSize.getHeight() - margin * 2;
        let adjustedWidth = maxWidth;
        let adjustedHeight = maxWidth / ratio;
        console.log('image_made: ')
        if (adjustedHeight > maxHeight) {
            adjustedHeight = maxHeight;
            adjustedWidth = maxHeight * ratio;
        }
        if (startY+adjustedHeight >= pageHeight - margin) { // Adjust the threshold based on page height
          pdf.addPage(); // Add a new page
          startY = margin; // Reset startY for the new page
          console.log('New page added ',startY)
      }
      console.log('adding image: ')
        pdf.addImage(imgData, 'PNG', 15, startY + 10,adjustedWidth, adjustedHeight); // Adjust position and dimensions as needed
        console.log('image added , startY: ',startY)
        startY += adjustedHeight + 20; // Increase startY for the next component
        console.log('the component is displayed and y incremented , startY: ',startY)
        // Check if next component exceeds page height, then add a new page
       if (startY >= pageHeight - margin) { // Adjust the threshold based on page height
            pdf.addPage(); // Add a new page
            startY = margin; // Reset startY for the new page
            console.log('New page added ',startY)
        }
        console.log('the component , page height: ',pageHeight)
        console.log('the component is finished , startY: ',startY)

        
        
    }   
    // Save the PDF with a file name
    pdf.save(`report.pdf`);
};
// const VisualizeStatistics = () => {
//   const [chartData, setChartData] = useState([]);
//   const [selectedComponents, setSelectedComponents] = useState([]);
//   const [selectedComponentspdf, setSelectedComponentspdf] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const dataToSend = { username: localStorage.getItem('username') };
//         const response = await axios.post('http://localhost:5000/files', dataToSend);
//         setChartData(response.data);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleCheckboxChange = (component, isPdf = false) => {
//     if (isPdf) {
//       setSelectedComponentspdf(prevSelectedComponentspdf => {
//         if (prevSelectedComponentspdf.includes(component)) {
//           return prevSelectedComponentspdf.filter(item => item !== component);
//         } else {
//           return [...prevSelectedComponentspdf, component];
//         }
//       });
//     } else {
//       setSelectedComponents(prevSelectedComponents => {
//         if (prevSelectedComponents.includes(component)) {
//           return prevSelectedComponents.filter(item => item !== component);
//         } else {
//           return [...prevSelectedComponents, component];
//         }
//       });
//     }
//   };

//   const generatePdf = async () => {
//     if (selectedComponentspdf.length === 0) {
//       alert("Please select at least one component to export.");
//       return;
//     }

//     const pdf = new jsPDF();

//     // Add title for the PDF
//     pdf.setFontSize(20);
//     pdf.text('Exploratory Data Analysis Report', pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

//     let startY = 40; // Initial startY position for components

//     for (let component of selectedComponentspdf) {
//       let componentToRender = null;
//       switch (component) {
//         case 'StatisticsTable':
//           componentToRender = <StatisticsTablePDF id="StatisticsTablePDF" />;
//           description = '* Statistics Table: This table displays statistical data including mean, median, mode, variance, etc., to describe the data\'s central tendency and dispersion.';
//           break;
//         // Add cases for other components as needed
//         default:
//           break;
//       }

//       if (componentToRender) {
//         const input = document.getElementById(componentToRender.props.id);
//         const canvas = await html2canvas(input);
//         const imgData = canvas.toDataURL('image/png');

//         // Add component description and image to PDF
//         //${componentToRender.props.id},
//         pdf.text(description, 15, startY, { align: 'justify', maxWidth: pdf.internal.pageSize.getWidth() - 30 });
//         startY += 5;
//         pdf.addImage(imgData, 'PNG', 15, startY, 180, 100); // Adjust position and dimensions as needed

//         startY += 100; // Increase startY for the next component

//         // Check if next component exceeds page height, then add a new page
//         if (startY > pdf.internal.pageSize.getHeight() - 20) {
//           pdf.addPage(); // Add a new page
//           startY = 10; // Reset startY for the new page
//         }
//       }
//     }

//     // Save the PDF with a file name
//     pdf.save(report.pdf);
//   };
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ComponentWithCheckbox
        title="Add to the Report"
        onCheckboxChange={() => handleCheckboxChange('StatisticsTable')}
        checked={selectedComponents.includes('StatisticsTable')}
      >
        <div id="StatisticsTable" className="col-span-1">
          <StatisticsTable id="StatisticsTable" />
        </div>
      </ComponentWithCheckbox>
      
      <ComponentWithCheckbox
        title="Add to the Report"
        onCheckboxChange={() => handleCheckboxChange('FeatureTypeTable')}
        checked={selectedComponents.includes('FeatureTypeTable')}
      >
        <div id="FeatureTypeTable" className="col-span-1">
          <FeatureTypeTable id="FeatureTypeTable" />
        </div>
      </ComponentWithCheckbox>

      <ComponentWithCheckbox
        title="Add to the Report"
        onCheckboxChange={() => handleCheckboxChange('CorrelationHeatmap')}
        checked={selectedComponents.includes('CorrelationHeatmap')}
      >
        <div id="CorrelationHeatmap" className="col-span-1">
          <CorrelationHeatmap id="CorrelationHeatmap" />
        </div>
      </ComponentWithCheckbox>

      {/* <ComponentWithCheckbox
        title="Add to the Report"
        onCheckboxChange={() => handleCheckboxChange('MissingRowsTable')}
        checked={selectedComponents.includes('MissingRowsTable')}
      >
        <div id="MissingRowsTable" className="col-span-1">
          <MissingRowsTable id="MissingRowsTable" />
        </div>
      </ComponentWithCheckbox> */}
      <ComponentWithCheckbox
        title="Add to the Report"
        onCheckboxChange={() => handleCheckboxChange('NaNValues')}
        checked={selectedComponents.includes('NaNValues')}
      >
        <div id="NaNValues" className="col-span-1">
          <NaNValues id="NaNValues"/>
        </div>
      </ComponentWithCheckbox>

      <ComponentWithCheckbox
        title="Add to the Report"
        onCheckboxChange={() => handleCheckboxChange('DataVisualization')}
        checked={selectedComponents.includes('DataVisualization')}
      >
        <div id="DataVisualization" className="col-span-1">
          <DataVisualization data={chartData} />
        </div>
      </ComponentWithCheckbox>
      {console.log('chart Data 1__: ',{chartData})}
      <ComponentWithCheckbox
        title="Add to the Report"
        onCheckboxChange={() => handleCheckboxChange('DataDistribution')}
        checked={selectedComponents.includes('DataDistribution')}
      >
        <div id="DataDistribution" className="col-span-1">
          <DataDistribution data={chartData} id='DataDistribution' />
        </div>
      </ComponentWithCheckbox>
      <ComponentWithCheckbox
        title="Add to the Report"
        onCheckboxChange={() => handleCheckboxChange('OutliersContainer')}
        checked={selectedComponents.includes('OutliersContainer')}
      >
        <div id="OutliersContainer" className="col-span-1">
          <OutliersContainer />
        </div>
      </ComponentWithCheckbox>
      <div className="col-span-1 md:col-span-4">
        <button 
          onClick={generatePdf} 
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Export Report
        </button>
      </div>
    </div>

    <div style={{ position: 'absolute', left: '-9999px', top: '0', opacity: '0', pointerEvents: 'none' }}>
<div id="StatisticsTablePDF" className="col-span-1" >
 <StatisticsTablePDF id= "StatisticsTablePDF"/>
</div>
</div>




<div style={{ position: 'absolute', left: '-9999px', top: '0', opacity: '0', pointerEvents: 'none' }}>
<div id="FeatureTypeTablePDF" className="col-span-1" >
 <FeatureTypeTablePDF  id="FeatureTypeTablePDF" />
</div>
</div>

{/* <div style={{ position: 'absolute', left: '-9999px', top: '0', opacity: '0', pointerEvents: 'none' }}>
<div id="MissingRowsTablePDF" className="col-span-1" >
 <MissingRowsTablePDF id="MissingRowsTablePDF" />
</div>
</div> */}


<div style={{ position: 'absolute', left: '-9999px', top: '0', opacity: '0', pointerEvents: 'none' }}>
<div id="CorrelationHeatmapPDF" className="col-span-1" >
 <CorrelationHeatmapPDF data={chartData} id="CorrelationHeatmapPDF" />
</div>
</div>


<div style={{ position: 'absolute', left: '-9999px', top: '0', opacity: '0', pointerEvents: 'none' }}>
<div id="NaNValuesPDF" className="col-span-1" >
 <NaNValuesPDF id="NaNValuesPDF"/>
</div>
</div>
{console.log('chart Data 2: ',{chartData})}
<div style={{ position: 'absolute', left: '-9999px', top: '0', opacity: '0', pointerEvents: 'none'}}>
<div id="DataVisualizationPDF" className="col-span-1" >
 <DataVisualizationPDF data={chartData} id="DataVisualizationPDF" />
</div>
</div>


{console.log('chart Data datadistribPDF: ',chartData)}
<div style={{ position: 'absolute',left: '-9999px', top: '0', opacity: '0', pointerEvents: 'none' }}>
<div id="DataDistributionPDF" className="col-span-1" >
 <DataDistributionPDF data={chartData} id="DataDistributionPDF"/>
</div>
</div>

{/* <div style={{ position: 'absolute' ,left: '-9999px', top: '0', opacity: '0', pointerEvents: 'none'}}>
<div id="OutliersContainerPDF" className="col-span-1" >
 <OutliersContainerPDF id="OutliersContainerPDF"/>
</div>
</div> */}

</div>
  );
}



//export default VisualizeStatistics;