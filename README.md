# PV System

This project is a full-stack application with a frontend built using React and a backend built using Flask. The frontend and backend are organized into separate folders within this repository.

## Frontend

The frontend of this project is built using React, a popular JavaScript library for building user interfaces. It's located in the `frontend` folder.

### Running the Frontend

To run the frontend, make sure you have Node.js and npm installed on your machine. Then navigate to the `Frontend` folder and run the following command:

```bash
cd Frontend
npm install
npm run dev
```

This will install the necessary dependencies and start the development server. The frontend will be accessible at `http://localhost:5173`.

## Backend

The backend of this project is built using Flask, a lightweight web framework for Python. It's located in the `Backend` folder.

### Running the Backend

To run the backend, make sure you have Python installed on your machine. Then navigate to the `backend` folder and run the following command:

```bash
cd Backend
pip install -r requirements.txt
python -m flask run
```

This will start the Flask server, and the backend will be accessible at `http://localhost:5000`.

### Debugging the Backend

If you need to debug the backend, you can run the following command instead:

```bash
python -m flask run --debug
```

This will start the Flask server in debug mode, providing more detailed error messages and automatic code reloading.
## Using Pre-Trained Models

### Alice Springs (DKA Data)
If you want to use the model trained on Alice Springs data, you should provide a CSV file with the following column names:

- **Month**: Month of the year (1-12)
- **Day**: Day of the month (1-31)
- **Hour**: Hour of the day (0-23)
- **Minute**: Minute of the hour (0-59)
- **technology**: Type of PV technology used
- **version**: Version of the PV system
- **year**: Installation year of the PV system
- **rating**: Rated capacity of the system
- **npanels**: Number of panels
- **azimuth**: Orientation angle of the panels
- **tilt**: Tilt angle of the panels
- **orient**: Panel orientation type
- **support**: Type of structural support
- **track**: Whether the system uses tracking or not
- **maintenance_startm**: Start minute of maintenance
- **maintenance_starth**: Start hour of maintenance
- **maintenance_endm**: End minute of maintenance
- **maintenance_endh**: End hour of maintenance
- **Global_Horizontal_Radiation**: Solar radiation received on a horizontal surface
- **Weather_Relative_Humidity**: Relative humidity in percentage
- **Weather_Daily_Rainfall**: Amount of daily rainfall
- **Weather_Temperature_Celsius**: Temperature in degrees Celsius


The experimental setup for this model can be found in the following paper:
> **B. Saad, A. El Hannani, R. Errattahi, A. Aqqal, "Multivariate Outliers Detection for Assessing Data Quality and Enhancing Interpretability in Photovoltaic Power Predictions," 2024 IEEE 12th International Symposium on Signal, Image, Video and Communications (ISIVC), 2024.**

### Eugene and Cocoa Locations
If you want to use the models trained on Eugene and Cocoa locations, use the following column names:

- **month**: Month of the year (1-12)
- **day**: Day of the month (1-31)
- **hour**: Hour of the day (0-23)
- **minute**: Minute of the hour (0-59)
- **technology**: Type of PV technology used
- **version**: Version of the PV system
- **series**: Number of series-connected modules
- **parallel**: Number of parallel-connected modules
- **Isc**: Short-circuit current of the panel
- **Voc**: Open-circuit voltage of the panel
- **Imp**: Maximum power current
- **Vmp**: Maximum power voltage
- **maintenancestarth**: Start hour of maintenance
- **maintenancestartm**: Start minute of maintenance
- **maintenanceendh**: End hour of maintenance
- **maintenanceendm**: End minute of maintenance
- **PVtemperature**: Temperature of the PV module
- **POACMP22**: Plane of array irradiance
- **humidity**: Atmospheric humidity percentage
- **pressure**: Atmospheric pressure
- **Precipitation**: Recorded precipitation amount
- **Drytemperature**: Ambient temperature
- **Precipitationprior**: Precipitation recorded in prior time step

The experimental setup for these models is detailed in the following paper:
> **B. Saad, A. El Hannani, A. Aqqal, R. Errattahi, "Photovoltaic power prediction using deep learning models: recent advances and new insights," International Journal of Electrical and Computer Engineering (IJECE), vol. 14, no. 5, pp. 5926-5940, 2024.**

