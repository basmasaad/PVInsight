from app.preprocessing import bp
from flask import request, jsonify
from pymongo import MongoClient
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, OrdinalEncoder
from ENSAJ_MultiOutliersDetection import  detect_outliers

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['pfa']
files_collection = db['files']
processed_files_collection = db['processed_data']
val_processed_files_collection = db['val_data']
test_processed_files_collection = db['test_data']
train_processed_files_collection = db['train_data']  

@bp.route('/outliers', methods=['GET'])
def get_outliers():
    # Retrieve data from MongoDB
    cursor = files_collection.find({}, {
        '_id': 0,
        'Weather_Temperature_Celsius': 1,
        'Weather_Relative_Humidity': 1,
        'Global_Horizontal_Radiation': 1,
        'Weather_Daily_Rainfall': 1
        })

    # Convert cursor to a list of dictionaries
    files_data = list(cursor) 
    
    # Initialize dictionary to hold statistical values and outliers
    statistics = {
        "Weather_Temperature_Celsius": {"min": None, "q1": None, "median": None, "q3": None, "max": None, "outliers": []},
        "Weather_Relative_Humidity": {"min": None, "q1": None, "median": None, "q3": None, "max": None, "outliers": []},
        "Global_Horizontal_Radiation": {"min": None, "q1": None, "median": None, "q3": None, "max": None, "outliers": []},
        "Weather_Daily_Rainfall": {"min": None, "q1": None, "median": None, "q3": None, "max": None, "outliers": []}
    }

    fields_to_retrieve = [
        'Weather_Temperature_Celsius',
        'Weather_Relative_Humidity',
        'Global_Horizontal_Radiation',
        'Weather_Daily_Rainfall'
    ]

    # Extract values for each field and calculate statistics
    for field in fields_to_retrieve:
        values = [file_data[field] for file_data in files_data if field in file_data]
        statistics[field] = calculate_statistics(values)

         # Identify outliers based on quartiles
        q1 = statistics[field]["q1"]
        q3 = statistics[field]["q3"]
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        #print(lower_bound)
        #print(upper_bound)
        outliers = [value for value in values if value < lower_bound or value > upper_bound]
        #print(outliers)
        statistics[field]["outliers"] = outliers
        

    
    # Return the statistical values in JSON format
    return jsonify(statistics)

def calculate_statistics(data):
    # Sort the data
    sorted_data = sorted(data)

    # Calculate quartiles
    q1 = np.percentile(sorted_data, 25)
    q3 = np.percentile(sorted_data, 75)
    median = np.median(sorted_data)

    # Calculate min and max
    minimum = min(sorted_data)
    maximum = max(sorted_data)

    return {
        "min": minimum,
        "max": maximum,
        "q1": q1,
        "q3": q3,
        "median": median,
    }

@bp.route('/NaNvalue')
def delete_NaN():
    # Retrieve all documents in the collection
    cursor = files_collection.find({}, {'_id': 0, 'username': 0})

    # Convert cursor to a list of dictionaries
    files_data = list(cursor)

    # Convert the list of dictionaries to a DataFrame
    df = pd.DataFrame(files_data)

    # Select numerical columns
    df = df.select_dtypes(include=['number'])

    # Calculate percentage of NaN values in each column
    nan_percentages = df.isna().mean() * 100
    
    # Convert NaN percentages to dictionary
    nan_percentages_dict = nan_percentages.to_dict()

    # Return the data in JSON format
    return jsonify(nan_percentages_dict)
@bp.route('/process/nanvaluestest', methods=['POST'])
def process_NaNvalues_test(): 
    try:
        nan_values = request.json
        cursor = files_collection.find({}, {'_id': 0, 'username': 0})
            # Convert cursor to a list of dictionaries
        files_data = list(cursor)
       
            # Convert the list of dictionaries to a DataFrame
        df = pd.DataFrame(files_data)
        
            # Handle NaN values based on user input fill methods
        for column, method in nan_values.items():
            if method == 'mean':
                df[column].fillna(df[column].mean(), inplace=True)
            elif method == 'median':
                df[column].fillna(df[column].median(), inplace=True)
               
            elif method == 'mode':
                df[column].fillna(df[column].mode()[0], inplace=True)
               
            elif method == 'forwardFill':
                df[column].fillna(method='ffill', inplace=True)
               
            elif method == 'backwardFill':
                df[column].fillna(method='bfill', inplace=True)
                
            elif method == 'deleteRow':
                df.dropna(subset=[column], inplace=True)
                processed_files_collection.delete_many({column: {"$exists": True, "$ne": None}})
                
            elif method == 'deleteColumn':
                df.drop(columns=[column], inplace=True)
                processed_files_collection.update_many({}, {'$unset': {column: ''}})
               
            else:  # For numerical constant values
                value = float(method)
                df[column]=df[column].fillna(value, inplace=True)
               
            # Update MongoDB collection with the modified DataFrame
            #for index, row in df.iterrows():
                #files_collection.update_one({'_id': row['_id']}, {'$set': row.to_dict()}, upsert=False)
        print('train shape in nan app: ',df.shape)
        df=process_model(df)
        processed_data = df.to_dict(orient='records')
        
            # Clear the collection
        processed_files_collection.delete_many({})
        
            # Insert the updated data
        processed_files_collection.insert_many(processed_data)
       
        return jsonify({'message': 'Nan Values processed successfully.'}), 200

    except Exception as e:
        error_traceback = traceback.format_exc()
        print(error_message)
        print(error_traceback)
        return jsonify({'error': error_message, 'traceback': error_traceback}), 500 
def process_model(DATA):
    my_dict_tech={'PSI':5,'MSI':0,'CDTE':2,'HIT':4,'CPV':7,'ASI':1,'CIGS':3}
    my_dict_support={'F':0,'T':1}
    my_dict_track={'S':1,'D':2,0:0}
    DATA['technology']=[my_dict_tech[c] for c in DATA['technology']]
    DATA['support']=[my_dict_support[c] for c in DATA['support']]
    DATA['track']=[my_dict_track[c] for c in DATA['track']]
    return DATA

@bp.route('/process/nanvalues', methods=['POST'])
def process_NaNvalues():
    try:

        nan_values = request.json
        cursor_val = val_processed_files_collection.find({}, {'username': 0})
        cursor_train = train_processed_files_collection.find({}, {'username': 0})
        cursor_test = test_processed_files_collection.find({}, {'username': 0})    
            # Convert cursor to a list of dictionaries
        files_data_val = list(cursor_val)
        files_data_train = list(cursor_train)
        files_data_test = list(cursor_test)
            # Convert the list of dictionaries to a DataFrame
        df_train = pd.DataFrame(files_data_train)
        df_val = pd.DataFrame(files_data_val)
        df_test = pd.DataFrame(files_data_test)
        print('train shape in nan app: ',df_train.shape)
        print('val shape in nan app: ',df_train.shape)
        print('test shape in nan app: ',df_test.shape)
            # Handle NaN values based on user input fill methods
        for column, method in nan_values.items():
            if method == 'mean':
                df_train[column].fillna(df_train[column].mean(), inplace=True)
                df_val[column].fillna(df_train[column].mean(), inplace=True)
                df_test[column].fillna(df_train[column].mean(), inplace=True)
            elif method == 'median':
                df_train[column].fillna(df_train[column].median(), inplace=True)
                df_val[column].fillna(df_train[column].median(), inplace=True)
                df_test[column].fillna(df_train[column].median(), inplace=True)
            elif method == 'mode':
                df_train[column].fillna(df_train[column].mode()[0], inplace=True)
                d_val[column].fillna(df_train[column].mode()[0], inplace=True)
                d_test[column].fillna(df_train[column].mode()[0], inplace=True)
            elif method == 'forwardFill':
                df_train[column].fillna(method='ffill', inplace=True)
                df_val[column].fillna(method='ffill', inplace=True)
                df_test[column].fillna(method='ffill', inplace=True)
            elif method == 'backwardFill':
                df_train[column].fillna(method='bfill', inplace=True)
                df_val[column].fillna(method='bfill', inplace=True)
                df_test[column].fillna(method='bfill', inplace=True)
            elif method == 'deleteRow':
                df_train.dropna(subset=[column], inplace=True)
                train_processed_files_collection.delete_many({column: {"$exists": True, "$ne": None}})
                df_val.dropna(subset=[column], inplace=True)
                val_processed_files_collection.delete_many({column: {"$exists": True, "$ne": None}})
                df_test.dropna(subset=[column], inplace=True)
                test_processed_files_collection.delete_many({column: {"$exists": True, "$ne": None}})
            elif method == 'deleteColumn':
                df_train.drop(columns=[column], inplace=True)
                train_processed_files_collection.update_many({}, {'$unset': {column: ''}})
                df_val.drop(columns=[column], inplace=True)
                val_processed_files_collection.update_many({}, {'$unset': {column: ''}})
                df_test.drop(columns=[column], inplace=True)
                test_processed_files_collection.update_many({}, {'$unset': {column: ''}})
            else:  # For numerical constant values
                value = float(method)
                df_train[column]=df_train[column].fillna(value, inplace=True)
                df_val[column]=df_val[column].fillna(value, inplace=True)
                df_test[column]=df_test[column].fillna(value, inplace=True)

            # Update MongoDB collection with the modified DataFrame
            #for index, row in df.iterrows():
                #files_collection.update_one({'_id': row['_id']}, {'$set': row.to_dict()}, upsert=False)
        print('train shape in nan app: ',df_train.shape)
        print('val shape in nan app: ',df_train.shape)
        print('test shape in nan app: ',df_test.shape)
        processed_data_train = df_train.to_dict(orient='records')
        processed_data_val = df_val.to_dict(orient='records')
        processed_data_test = df_test.to_dict(orient='records')
            # Clear the collection
        train_processed_files_collection.delete_many({})
        val_processed_files_collection.delete_many({})
        test_processed_files_collection.delete_many({})
            # Insert the updated data
        train_processed_files_collection.insert_many(processed_data_train)
        val_processed_files_collection.insert_many(processed_data_val)
        test_processed_files_collection.insert_many(processed_data_test)
        return jsonify({'message': 'Nan Values processed successfully.'}), 200

    except Exception as e:
        error_traceback = traceback.format_exc()
        print(error_message)
        print(error_traceback)
        return jsonify({'error': error_message, 'traceback': error_traceback}), 500
    
@bp.route('/statistics', methods=['GET'])
def get_statistics():
    # Retrieve data from MongoDB
    cursor = files_collection.find({}, {
        '_id': 0,
        'username': 0,
        'manuf': 0,
        'technology': 0,
        'Timestamp': 0,
        'support': 0,
        'track': 0,
        })

    # Convert cursor to a list of dictionaries
    files_data = list(cursor)
    
    # Initialize dictionary to hold statistical values and outliers
    statistics = {}

    fields_to_retrieve = [
        'Weather_Temperature_Celsius',
        'Weather_Relative_Humidity',
        'Global_Horizontal_Radiation',
        'Weather_Daily_Rainfall',
        'Active_Power',
        'Diffuse_Horizontal_Radiation',
    ]

    # Extract all numeric fields
    numeric_fields = []
    for file_data in files_data:
        for key, value in file_data.items():
            if isinstance(value, (int, float)) and key not in numeric_fields:
                numeric_fields.append(key)

    #print(numeric_fields)
    
    # Extract values for each field and calculate statistics
    for field in fields_to_retrieve:
        values = [file_data[field] for file_data in files_data if field in file_data]
        statistics[field] = calculate_statistics_v2(values)
        
    print (statistics)
    # Return the statistical values in JSON format
    return jsonify(statistics)

def calculate_statistics_v2(data):
    # Sort the data
    sorted_data = sorted(data)

    # Calculate quartiles
    q1 = np.percentile(sorted_data, 25)
    q3 = np.percentile(sorted_data, 75)

    # Calculate mean and median
    mean = np.mean(sorted_data)
    median = np.median(sorted_data)

    # Calculate min and max
    minimum = min(sorted_data)
    maximum = max(sorted_data)

    # Calculate standard deviation and variance
    std_deviation = np.std(sorted_data)
    variance = np.var(sorted_data)

    # Calculate interquartile range (IQR)
    iqr = q3 - q1

    # Calculate count of non-null values
    count = len([value for value in data])

    return {
        "Count": count,
        "Min": minimum,
        "Q1": q1,
        "Q3": q3,
        "IQR": iqr,
        "Max": maximum,
        "Median": median,
        "Mean": mean,
        "STD": std_deviation,
        "Variance": variance,
    }
# @bp.route('/statistics', methods=['GET'])
# def get_statistics():
#     # Retrieve data from MongoDB
#     cursor = files_collection.find({}, {
#         '_id': 0,
#         'username': 0,
#         'manuf': 0,
#         'technology': 0,
#         'Timestamp': 0,
#         'support': 0,
#         'track': 0,
#     })

#     # Convert cursor to a list of dictionaries
#     files_data = list(cursor)
    
#     # Initialize dictionary to hold statistical values
#     statistics = {}

#     # Extract all numeric fields
#     numeric_fields = []
#     for file_data in files_data:
#         for key, value in file_data.items():
#             if isinstance(value, (int, float)) and key not in numeric_fields:
#                 numeric_fields.append(key)

#     # Calculate statistics for all numeric fields
#     for field in numeric_fields:
#         values = [file_data[field] for file_data in files_data if field in file_data]
#         statistics[field] = calculate_statistics_v2(values)
        
#     # Return the statistical values in JSON format
#     return jsonify(statistics)


# def calculate_statistics_v2(data):
#     # Sort the data
#     sorted_data = sorted(data)

#     # Calculate quartiles
#     q1 = np.percentile(sorted_data, 25)
#     q3 = np.percentile(sorted_data, 75)

#     # Calculate mean and median
#     mean = np.mean(sorted_data)
#     median = np.median(sorted_data)

#     # Calculate min and max
#     minimum = min(sorted_data)
#     maximum = max(sorted_data)

#     # Calculate standard deviation and variance
#     std_deviation = np.std(sorted_data)
#     variance = np.var(sorted_data)

#     # Calculate interquartile range (IQR)
#     iqr = q3 - q1

#     # Calculate count of non-null values
#     count = len([value for value in data])

#     return {
#         "Count": count,
#         "Min": minimum,
#         "Q1": q1,
#         "Q3": q3,
#         "IQR": iqr,
#         "Max": maximum,
#         "Median": median,
#         "Mean": mean,
#         "Standard deviation": std_deviation,
#         "Variance": variance,
#     }

    
@bp.route('/delete/columns', methods=['POST'])
def delete_columns():
    # Expect column names to be sent in the request body as a JSON array
    columns_to_delete = request.json.get('columns', [])

    if not columns_to_delete:
        return jsonify({'error': 'No columns specified for deletion'}), 400

    try:
        # Construct $unset operator object to delete specified columns
        unset_columns = {column: "" for column in columns_to_delete}
        
        # Update all documents in the train_processed_files_collection
        result_train = train_processed_files_collection.update_many({}, {'$unset': unset_columns}, upsert=False)
        
        # Update all documents in the val_processed_files_collection
        result_val = val_processed_files_collection.update_many({}, {'$unset': unset_columns}, upsert=False)
        
        # Update all documents in the test_processed_files_collection
        result_test = test_processed_files_collection.update_many({}, {'$unset': unset_columns}, upsert=False)
        
        # Sum the modified counts from all collections
        total_deleted_columns_count = result_train.modified_count + result_val.modified_count + result_test.modified_count

        return jsonify({'message': f'Columns deleted successfully from {total_deleted_columns_count} documents'}), 200
    
    except Exception as e:
        error_message = f"An error occurred: {e}"
        error_traceback = traceback.format_exc()
        print(error_message)
        print(error_traceback)
        return jsonify({'error': error_message, 'traceback': error_traceback}), 500


@bp.route('/detect_missing_rows', methods=['GET'])
def detect_missing_rows():
    # Retrieve data from MongoDB
    cursor = files_collection.find({}, {'_id': 0, 'username': 0})

    # Convert cursor to a DataFrame
    df = pd.DataFrame(list(cursor))
    
    # Perform missing rows detection
    missing_rows = detect_missing_rows(df)

    # Convert DataFrame to JSON and return
    return missing_rows.to_json(orient='records')


def create_datetime_index(df):
    # Combine Year, Month, Day, Hour, and Minute columns into a single datetime column
    df['Timestamp'] = pd.to_datetime(df['Timestamp'], format='%Y-%m-%d %H:%M:%S')
    # Set the new datetime column as the index
    df.set_index('Timestamp', inplace=True)
    return df

def detect_missing_rows(df):
    df = create_datetime_index(df)
    all_missing_rows = pd.DataFrame(columns=['Year', 'Month', 'Day', 'Hour', 'Minute', 'version'])
    for vr in (df['version'].unique()):
        df_ver = df[df['version'] == vr]
        start_date = df_ver.index.min()
        end_date = df_ver.index.max()
        full_date_range = pd.date_range(start=start_date, end=end_date, freq='5T')
        full_df = pd.DataFrame(index=full_date_range)
        merged_df = full_df.merge(df_ver, left_index=True, right_index=True, how='left', indicator=True)
        missing_rows = merged_df[merged_df['_merge'] == 'left_only']
        missing_rows['Year'] = missing_rows.index.year
        missing_rows['Month'] = missing_rows.index.month
        missing_rows['Day'] = missing_rows.index.day
        missing_rows['Hour'] = missing_rows.index.hour
        missing_rows['Minute'] = missing_rows.index.minute
        missing_rows['version'] = vr
        missing_rows = missing_rows[['Year', 'Month', 'Day', 'Hour', 'Minute', 'version']]
        all_missing_rows = pd.concat([all_missing_rows, missing_rows])
    return all_missing_rows

@bp.route('/correlation', methods=['GET'])
def correlation():
    # Retrieve data from MongoDB
    cursor = files_collection.find({}, {'_id': 0, 'username': 0})

    # Convert cursor to a DataFrame
    df = pd.DataFrame(list(cursor))

    # Select numerical columns
    numerical_columns = df.select_dtypes(include=['number']).columns

    # Subset DataFrame to numerical columns
    df_num = df[numerical_columns]

    # Calculate correlation matrix
    correlation_matrix = df_num.corr()

    # Get feature names
    feature_names = correlation_matrix.index.tolist()

    # Initialize lists for z, x, and y
    z = []
    x = feature_names
    y = feature_names

    # Populate z list with correlation values
    for feature1 in feature_names:
        row = []
        for feature2 in feature_names:
            correlation_value = correlation_matrix.loc[feature1, feature2]
            if np.isnan(correlation_value):  # Check if value is NaN
                row.append(None)  # Replace NaN with null
            else:
                row.append(correlation_value)
        z.append(row)

    # Prepare the data for heatmap
    heatmap_data = {'z': z, 'x': x, 'y': y}

    return jsonify(heatmap_data)


@bp.route('/correlation/bar')
def correlation_data():

    # Retrieve data from MongoDB
    cursor = files_collection.find({}, {'_id': 0, 'username': 0})

    # Convert cursor to a DataFrame
    df = pd.DataFrame(list(cursor))
    
    # Select numerical columns
    df = df.select_dtypes(include=['number'])
    
    # Calculate correlation with Active_Power
    corr_with_Power = df.corr()["Active_Power"].sort_values(ascending=False)
    
    # Drop Active_Power from correlations
    corr_with_Power = corr_with_Power.drop("Active_Power")

    # Replace NaN values with 0
    corr_with_Power = corr_with_Power.fillna(0)
    
    # Prepare data for Chart.js
    labels = corr_with_Power.index.tolist()
    values = corr_with_Power.values.tolist()
    
    chart_data = {
        'labels': labels,
        'values': values
    }
    
    return jsonify(chart_data)

@bp.route('/data/type')
def get_data_type():
    try:
        # Retrieve data from MongoDB
        cursor = files_collection.find({}, {'_id': 0, 'username': 0})

        # Convert cursor to a DataFrame
        df = pd.DataFrame(list(cursor))

        # Get data types of columns and convert to a dictionary
        data_types = {column: str(dtype) for column, dtype in df.dtypes.items()}

        return jsonify(data_types), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@bp.route('/process/missing-rows', methods=['POST'])
def process_missing_rows():
    try:
        data = request.json 
        
        # Filter out rows with empty action
        data = [item for item in data if item['action']]
        
        # Retrieve data from MongoDB
        cursor = files_collection.find({}, {'_id': 0, 'username': 0})

        # Convert cursor to a DataFrame
        df = pd.DataFrame(list(cursor))
        
        # Convert 'Timestamp' column to datetime
        df['Timestamp'] = pd.to_datetime(df['Timestamp'])
        
        # Write initial DataFrame to CSV for debugging
        # df.to_csv('initial_data.csv', sep=',', header=True, index=False)
        
        for item in data:
            timestamp = pd.to_datetime(item['timestamp'])  # Convert timestamp to datetime
            version = item['version']
            action = item['action']
            
            # Create temporary Series for efficient timestamp addition
            new_row = pd.DataFrame({'Timestamp': [timestamp], 'version': [version]})

            # Concatenate the Series with the DataFrame (consider inplace=True for efficiency)
            df = pd.concat([new_row, df], ignore_index=True)
            
            #print(new_row)
            
            # Sort DataFrame by 'Timestamp' column
            df.sort_values(by='Timestamp', inplace=True)
            
            # Perform action based on the action value
            if action == 'forwardFill':
                # Forward fill action
                df.fillna(method='ffill', inplace=True)
                #print(f"Forward fill action performed for timestamp: {timestamp}")
            elif action == 'backwardFill':
                # Backward fill action
                df.fillna(method='bfill', inplace=True)
                #print(f"Backward fill action performed for timestamp: {timestamp}")
            else:
                print(f"Unknown action: {action}")
        
        # Iterate through DataFrame to insert new documents into MongoDB
        for index, row in df.iterrows():            
            for item in data:
                if row['Timestamp'] == pd.to_datetime(item['timestamp']):
                    # Convert timestamp to string format
                    row['Timestamp'] = str(row['Timestamp'])
                    files_collection.insert_one(row.to_dict())
                    #print(row.to_dict())
        
        # Write final DataFrame to CSV for debugging
        # df.to_csv('final_data.csv', sep=',', header=True, index=False)

        return jsonify({'message': 'Data processed successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@bp.route('/process/normalization', methods=['POST'])
def process_column_normalization():
    try:
        print('Normalize data')
        data = request.json 

        # Retrieve data from MongoDB
        cursor_val = val_processed_files_collection.find({}, {'username': 0})
        cursor_train = train_processed_files_collection.find({}, {'username': 0})
        cursor_test = test_processed_files_collection.find({}, {'username': 0})    
        # Convert cursor to a list of dictionaries
        files_data_val = list(cursor_val)
        files_data_train = list(cursor_train)
        files_data_test = list(cursor_test)

        # Convert the list of dictionaries to a DataFrame
        df_train = pd.DataFrame(files_data_train)
        df_val = pd.DataFrame(files_data_val)
        df_test = pd.DataFrame(files_data_test)
    
        print('train shape in normalization app: ',df_train.shape)
        print('val shape in norm app: ',df_val.shape)
        print('test shape in norm app: ',df_test.shape)
        # Check if data and normalization strategy are provided
        if 'selectedColumn' not in data or 'normalizationStrategy' not in data:
            return jsonify({'error': 'selectedColumn and normalizationStrategy are required.'}), 400

        # Check if selected column exists in the DataFrame
        selected_column = data['selectedColumn']
        if selected_column not in df_train.columns:
            return jsonify({'error': f'Column "{selected_column}" does not exist in the dataset.'}), 400

        # Apply normalization based on the selected strategy
        normalization_strategy = data['normalizationStrategy']

        scaler = None  # Default value
        if normalization_strategy == 'manualNormalization':
            # Check if manual normalization expression is provided
            if 'manualExpression' not in data:
                return jsonify({'error': 'manualExpression is required for manual normalization.'}), 400
            
            # Get the manual normalization expression
            manual_expression = data['manualExpression']
            
            # Extract the operator and constant from the expression (assuming simple format)
            operator, constant_str = manual_expression.split(' ')
            constant = float(constant_str)

            # Apply the operation based on the extracted operator
            if operator == '*':
                df_train[selected_column] = df_train[selected_column] * constant
                df_val[selected_column] = df_val[selected_column] * constant
                df_test[selected_column] = df_test[selected_column] * constant
            elif operator == '/':
                df_train[selected_column] = df_train[selected_column] / constant
                df_val[selected_column] = df_val[selected_column] / constant
                df_test[selected_column] = df_test[selected_column] / constant
            else:
                return jsonify({'error': 'Invalid operator in manualExpression. Only "*" and "/" are allowed.'}), 400

        elif normalization_strategy == 'standardScaler':
            scaler = StandardScaler()
        elif normalization_strategy == 'minMaxScaler':
            scaler = MinMaxScaler()
        
        if scaler is not None:
            scaler.fit(df_train[selected_column].values.reshape(-1, 1))
            df_train[selected_column] = scaler.transform(df_train[selected_column].values.reshape(-1, 1)).flatten()
            df_val[selected_column] = scaler.transform(df_val[selected_column].values.reshape(-1, 1)).flatten()
            df_test[selected_column] = scaler.transform(df_test[selected_column].values.reshape(-1, 1)).flatten()

        print('data normalized')
        # Loop through each row of the DataFrame
        print('train shape in nan app: ',df_train.shape)
        print('val shape in nan app: ',df_train.shape)
        print('test shape in nan app: ',df_test.shape)
        processed_data_train = df_train.to_dict(orient='records')
        processed_data_val = df_val.to_dict(orient='records')
        processed_data_test = df_test.to_dict(orient='records')
            # Clear the collection
        train_processed_files_collection.delete_many({})
        val_processed_files_collection.delete_many({})
        test_processed_files_collection.delete_many({})
            # Insert the updated data
        train_processed_files_collection.insert_many(processed_data_train)
        val_processed_files_collection.insert_many(processed_data_val)
        return jsonify({'message': 'Data processed successfully'}), 200

    except Exception as e:
        error_traceback = traceback.format_exc()
        print(error_message)
        print(error_traceback)
        return jsonify({'error': error_message, 'traceback': error_traceback}), 500
        
    
    
@bp.route('/process/encode', methods=['POST'])
def process_column_ecoding():
    try:
        data = request.json 

        # Retrieve data from MongoDB
        # cursor = processed_files_collection.find({}, {'_id': 0, 'username': 0})
        # df = pd.DataFrame(list(cursor))

        cursor_val = val_processed_files_collection.find({}, {'username': 0})
        cursor_train = train_processed_files_collection.find({}, {'username': 0})
        cursor_test = test_processed_files_collection.find({}, {'username': 0})    
            # Convert cursor to a list of dictionaries
        files_data_val = list(cursor_val)
        files_data_train = list(cursor_train)
        files_data_test = list(cursor_test)
            # Convert the list of dictionaries to a DataFrame
        df_train = pd.DataFrame(files_data_train)
        df_val = pd.DataFrame(files_data_val)
        df_test = pd.DataFrame(files_data_test)
        
        # Write initial DataFrame to CSV for debugging
        #df.to_csv('initial_data.csv', sep=',', header=True, index=False)
        
        # Check if data and encoding strategy are provided
        if 'selectedColumn' not in data or 'encodingStrategy' not in data:
            return jsonify({'error': 'selectedColumn and encodingStrategy are required.'}), 400

        # Check if selected column exists in the DataFrame
        selected_column = data['selectedColumn']
        print('the selected column in encoding startegy is: ',selected_column)
        print('the values of selected column is; ',df_train[selected_column].unique() )
        # if selected_column not in df.columns:
        #     return jsonify({'error': f'Column "{selected_column}" does not exist in the dataset.'}), 400

        # Apply encoding based on the selected strategy
        encoding_strategy = data['encodingStrategy']

        if encoding_strategy == 'labelEncoding':
            label_encoder = LabelEncoder()
            column_to_encode = df_train[selected_column]
            column_to_encode_val = df_val[selected_column]
            column_to_encode_test = df_test[selected_column]
            column_encoded = label_encoder.fit_transform(column_to_encode)
            column_encoded_val = label_encoder.transform(column_to_encode_val)
            column_encoded_test = label_encoder.transform(column_to_encode_test)
            # Add a new column with the encoded values
            # encoded_column_name = f'{selected_column}_encoded'
            df_train[selected_column] = column_encoded
            df_val[selected_column] = column_encoded_val
            df_test[selected_column] = column_encoded_test
        elif encoding_strategy == 'oneHotEncoding':
            encoder = OneHotEncoder()
            encoded_data = encoder.fit_transform(df_train[[selected_column]]).toarray()
            encoded_data_val = encoder.transform(df_val[[selected_column]]).toarray()
            encoded_data_test = encoder.transform(df_test[[selected_column]]).toarray()
            encoded_columns = encoder.get_feature_names_out([selected_column])
            df_train = pd.concat([df_train, pd.DataFrame(encoded_data, columns=encoded_columns)], axis=1)
            df_val = pd.concat([df_val, pd.DataFrame(encoded_data_val, columns=encoded_columns)], axis=1)
            df_test = pd.concat([df_test, pd.DataFrame(encoded_data_test, columns=encoded_columns)], axis=1)
        else:
            return jsonify({'error': 'Invalid encoding strategy.'}), 400
        print('the values of selected column after encoding is; ',df_train[selected_column].unique() )
        processed_data_train = df_train.to_dict(orient='records')
        processed_data_val = df_val.to_dict(orient='records')
        processed_data_test = df_test.to_dict(orient='records')
            # Clear the collection
        train_processed_files_collection.delete_many({})
        val_processed_files_collection.delete_many({})
        test_processed_files_collection.delete_many({})
            # Insert the updated data
        train_processed_files_collection.insert_many(processed_data_train)
        val_processed_files_collection.insert_many(processed_data_val)
        test_processed_files_collection.insert_many(processed_data_test)

        return jsonify({'message': 'Data processed successfully'}), 200

    except Exception as e:
        error_traceback = traceback.format_exc()
        print(error_message)
        print(error_traceback)
        return jsonify({'error': error_message, 'traceback': error_traceback}), 500
        
    
    
@bp.route('/process/drop_outliers', methods=['POST'])
def drop_outliers():
    # Get request data
    try:
        print('outliers handling')
        data = request.get_json()
        column = data.get('selectedColumn')
        min_value = float(data.get('min'))
        max_value = float(data.get('max'))
        method = data.get('strategy')
        
        # Check if all required parameters are provided
        if not column:
            return jsonify({'error': 'Column name is required!'}), 400
        cursor_val = val_processed_files_collection.find({}, {'username': 0})
        cursor_train = train_processed_files_collection.find({}, {'username': 0})
        cursor_test = test_processed_files_collection.find({}, {'username': 0})    
            # Convert cursor to a list of dictionaries
        files_data_val = list(cursor_val)
        files_data_train = list(cursor_train)
        files_data_test = list(cursor_test)

            # Convert the list of dictionaries to a DataFrame
        df_train = pd.DataFrame(files_data_train)
        df_val = pd.DataFrame(files_data_val)
        df_test = pd.DataFrame(files_data_test)
        print('train shape in nan app: ',df_train.shape)
        print('val shape in nan app: ',df_train.shape)
        print('test shape in nan app: ',df_test.shape)
        if min_value is not None:
            df_val.loc[df_val[column] < min_value, column] = None
            df_train.loc[df_train[column] < min_value, column] = None
        if max_value is not None:
            df_val.loc[df_val[column] > max_value, column] = None
            df_train.loc[df_train[column] > max_value, column] = None


            # Handle NaN values based on user input fill methods
        
        if method == 'mean':
            df_train[column].fillna(df_train[column].mean(), inplace=True)
            df_val[column].fillna(df_train[column].mean(), inplace=True)
        elif method == 'median':
            df_train[column].fillna(df_train[column].median(), inplace=True)
            df_val[column].fillna(df_train[column].median(), inplace=True)
        elif method == 'mode':
            df_train[column].fillna(df_train[column].mode()[0], inplace=True)
            d_val[column].fillna(df_train[column].mode()[0], inplace=True)
        elif method == 'forwardFill':
            df_train[column].fillna(method='ffill', inplace=True)
            df_val[column].fillna(method='ffill', inplace=True)
        elif method == 'backwardFill':
            df_train[column].fillna(method='bfill', inplace=True)
            df_val[column].fillna(method='bfill', inplace=True)
        elif method == 'deleteRow':
            df_train.dropna(subset=[column], inplace=True)
            train_processed_files_collection.delete_many({column: {"$exists": True, "$ne": None}})
            df_val.dropna(subset=[column], inplace=True)
            val_processed_files_collection.delete_many({column: {"$exists": True, "$ne": None}})
        elif method == 'deleteColumn':
            df_train.drop(columns=[column], inplace=True)
            train_processed_files_collection.update_many({}, {'$unset': {column: ''}})
            df_val.drop(columns=[column], inplace=True)
            val_processed_files_collection.update_many({}, {'$unset': {column: ''}})
        else:  # For numerical constant values
            value = float(method)
            df_train[column].fillna(value, inplace=True)
            df_val[column].fillna(value, inplace=True)

            # Update MongoDB collection with the modified DataFrame
            #for index, row in df.iterrows():
                #files_collection.update_one({'_id': row['_id']}, {'$set': row.to_dict()}, upsert=False)
        processed_data_train = df_train.to_dict(orient='records')
        processed_data_val = df_val.to_dict(orient='records')
            # Clear the collection
        train_processed_files_collection.delete_many({})
        val_processed_files_collection.delete_many({})
            # Insert the updated data
        train_processed_files_collection.insert_many(processed_data_train)
        val_processed_files_collection.insert_many(processed_data_val)
        print('train shape in nan app: ',df_train.shape)
        print('val shape in nan app: ',df_train.shape)
        print('test shape in nan app: ',df_test.shape)
        return jsonify({'message': 'Outliers processed successfully.'}), 200
    except Exception as e:
        error_traceback = traceback.format_exc()
        print(error_message)
        print(error_traceback)
        return jsonify({'error': error_message, 'traceback': error_traceback}), 500
        
    


    
import traceback
def check_inliers_outliers(df_borders,row,pv_power):
    inl=-1
    ghi=row['Global_Horizontal_Radiation']
    arr=row['version']
    df_c=df_borders[(df_borders['version']==arr)]
    df_c=df_c.reset_index(drop=True)
    max_ghi=df_c['GHI_end'].max()
    ghi_interval = np.arange(0, max_ghi + 100, 100)
    for i in range(len(ghi_interval) - 1,0,-1):
        max_v_ghi, min_v_ghi = ghi_interval[i], ghi_interval[i - 1]
        if (min_v_ghi<=ghi<max_v_ghi):
            a1=df_c[df_c['GHI_end']==min_v_ghi]['a1'].item()
            b1=df_c[df_c['GHI_end']==min_v_ghi]['b1'].item()
            a2=df_c[df_c['GHI_end']==min_v_ghi]['a2'].item()
            b2=df_c[df_c['GHI_end']==min_v_ghi]['b2'].item()
            d1=(ghi*a1)+b1
            d2=(ghi*a2)+b2
            if d1 <= pv_power <= d2:
                inl = 0
    if (ghi>=1000):
        a1=df_c[df_c['GHI_end']==1000]['a1'].item()
        b1=df_c[df_c['GHI_end']==1000]['b1'].item()
        a2=df_c[df_c['GHI_end']==1000]['a2'].item()
        b2=df_c[df_c['GHI_end']==1000]['b2'].item()
        d1=(ghi*a1)+b1
        d2=(ghi*a2)+b2
        if d1 <= pv_power <= d2:
            inl = 0

        
        
        
    return inl

@bp.route('/multivariate/handleoutliers', methods=['GET'])
def handle_multioutliers_data():
    try:
        cursor_val = val_processed_files_collection.find({}, {'username': 0})
        cursor_train = train_processed_files_collection.find({}, {'username': 0})
   
        # Convert cursor to a list of dictionaries
        files_data_val = list(cursor_val)
        files_data_train = list(cursor_train)
    
        # Convert the list of dictionaries to a DataFrame
        df_train = pd.DataFrame(files_data_train)
        df_val = pd.DataFrame(files_data_val)
        
        # Retrieve data from MongoDB
        
        df_borders, inliers_all = detect_outliers(df_train, 'version', 'Global_Horizontal_Radiation', 'Active_Power', 'rating', [0.05], [4])
        data_pr_train = df_train.loc[inliers_all]
        data_pr_train=data_pr_train.reset_index(drop=True)
        df_val['label']=0

        for i in list(df_val.index):
            df_val['label'].loc[i]=check_inliers_outliers(df_borders,df_val.loc[i],df_val['Active_Power'].loc[i])
        data_pr_val=df_val[df_val['label']==0].reset_index(drop=True)
        # Prepare the data for the response
        processed_data_train = data_pr_train.to_dict(orient='records')
        processed_data_val = data_pr_val.to_dict(orient='records')
        # Clear the collection
        train_processed_files_collection.delete_many({})
        val_processed_files_collection.delete_many({})
        # Insert the updated data
        train_processed_files_collection.insert_many(processed_data)
        val_processed_files_collection.insert_many(processed_data)
        return jsonify(response_data), 200
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
#########################################   

@bp.route('/multivariate/outliers', methods=['GET'])
def get_multioutliers_data():
    try:
        version = int(request.args.get('version'))
        print('The version : ',version)
        # Retrieve data from MongoDB
        cursor = files_collection.find({}, {'_id': 0, 'username': 0})
        df = pd.DataFrame(list(cursor))
        print('df.shape : ',df.shape)
        print('unique_v',df['version'].unique())
        # Perform your data manipulation
        df['Active_Power'] = df['Active_Power'] * 1000 / df['area']
        df['rating'] = df['rating'] * 1000 / df['area']
        dfv=df[df['version']==version].reset_index(drop=True)
        print('dfv.shape : ',dfv.shape)
        # Detect outliers
        df_borders, inliers_all = detect_outliers(dfv, 'version', 'Global_Horizontal_Radiation', 'Active_Power', 'rating', [0.05], [4])
        data_fil = dfv.loc[inliers_all]

        # Prepare the data for the response
        response_data = {
            'inliers_x': [],
            'inliers_y': [],
            'outliers_x': [],
            'outliers_y': []
        }

        # Update the response data with inliers and outliers
        print('data_fil : ',data_fil.shape)
        print('data_fil : ',data_fil.columns)
        print('data_fil : ',data_fil['version'].unique())
        for version in data_fil['version'].unique():
           
            dt = data_fil[data_fil['version'] == version]
            df_vr = dfv[dfv['version'] == version]

            # List of tuples (ghi, power) for inliers
            inliers_list = list(zip(dt['Global_Horizontal_Radiation'], dt['Active_Power']))
            # List of tuples (ghi, power) for all points
            all_points_list = list(zip(df_vr['Global_Horizontal_Radiation'], df_vr['Active_Power']))
            
            # Extract inliers and outliers
            inliers = [point for point in inliers_list]
            outliers = [point for point in all_points_list if point not in inliers_list]
            print('hello')
            # Append the points to the respective lists
            response_data['inliers_x'].extend([float(ghi) for ghi, _ in inliers])
            response_data['inliers_y'].extend([float(power) for _, power in inliers])
            response_data['outliers_x'].extend([float(ghi) for ghi, _ in outliers])
            response_data['outliers_y'].extend([float(power) for _, power in outliers])
       
        return jsonify(response_data), 200
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
    
@bp.route('/multivariate/versions', methods=['GET'])
def get_versions():
    try:
        cursor = files_collection.find({}, {'_id': 0, 'username': 0})
        df = pd.DataFrame(list(cursor))
        versions = df['version'].unique().tolist()
        versions = [str(version) for version in versions]
        return jsonify({'versions': versions}), 200
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500    

@bp.route('/process/column/merging', methods=['POST'])
def process_column_merging():
    try:
        # Get request data
        data = request.get_json()
        selected_column = data.get('selectedColumn')
        first_column = data.get('firstColumn')
        second_column = data.get('secondColumn')
        operator = data.get('operator')
        
        # Retrieve data from MongoDB
        # cursor = processed_files_collection.find({}, {first_column: 1, second_column: 1, selected_column: 1, '_id': 0, 'Timestamp' : 1})
        # df = pd.DataFrame(list(cursor))

        cursor_val = val_processed_files_collection.find({}, {'username': 0})
        cursor_train = train_processed_files_collection.find({}, {'username': 0})
        cursor_test = test_processed_files_collection.find({}, {'username': 0})    
            # Convert cursor to a list of dictionaries
        files_data_val = list(cursor_val)
        files_data_train = list(cursor_train)
        files_data_test = list(cursor_test)
            # Convert the list of dictionaries to a DataFrame
        df_train = pd.DataFrame(files_data_train)
        df_val = pd.DataFrame(files_data_val)
        df_test = pd.DataFrame(files_data_test)

        # Perform your data manipulation
        if operator == '/':
            df_train[selected_column] = df_train[first_column] / df_train[second_column]
            df_val[selected_column] = df_val[first_column] / df_val[second_column]
            df_test[selected_column] = df_test[first_column] / df_test[second_column]
        elif operator == '*':
            df_train[selected_column] = df_train[first_column] * df_train[second_column]
            df_val[selected_column] = df_val[first_column] * df_val[second_column]
            df_test[selected_column] = df_test[first_column] * df_test[second_column]
        else:
            return jsonify({'error': 'Invalid operator specified'}), 400
        
        # Update MongoDB collection with the modified DataFrame
        processed_data_train = df_train.to_dict(orient='records')
        processed_data_val = df_val.to_dict(orient='records')
        processed_data_test = df_test.to_dict(orient='records')
            # Clear the collection
        train_processed_files_collection.delete_many({})
        val_processed_files_collection.delete_many({})
        test_processed_files_collection.delete_many({})
            # Insert the updated data
        train_processed_files_collection.insert_many(processed_data_train)
        val_processed_files_collection.insert_many(processed_data_val)
        test_processed_files_collection.insert_many(processed_data_test)


        # for index, row in df.iterrows():
        #     train_processed_files_collection.update_one({'Timestamp': row['Timestamp']}, {'$set': {selected_column: row[selected_column]}}, upsert=False)
        
        # Write final DataFrame to CSV for debugging
        # df.to_csv('final_data.csv', sep=',', header=True, index=False)
        
        return jsonify({'message': 'Data processed successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/process/filtering', methods=['POST'])
def data_filtering():
    # Get request data
    data = request.get_json()
    column_name = data.get('selectedColumn')
    deletion_criteria = data.get('deletionCriteria')

    # Check if required data is present
    if not column_name or not deletion_criteria:
        return jsonify({'error': 'Missing data in request payload'}), 400
        
    try:
        column_type = train_processed_files_collection.find_one().get(column_name).__class__
        
        if column_type == int:
            deletion_criteria = int(deletion_criteria)
        elif column_type == float:
            deletion_criteria = float(deletion_criteria)
            
        # Remove documents matching the deletion criteria
        result = train_processed_files_collection.delete_many({column_name: deletion_criteria})
        
        # Get the number of documents deleted
        deleted_count = result.deleted_count
        result = val_processed_files_collection.delete_many({column_name: deletion_criteria})
        
        # Get the number of documents deleted
        deleted_count = result.deleted_count
        result = test_processed_files_collection.delete_many({column_name: deletion_criteria})
        
        # Get the number of documents deleted
        deleted_count = result.deleted_count
        
        return jsonify({'message': f'{deleted_count} rows removed successfully!'}), 200
    except Exception as e:
        error_traceback = traceback.format_exc()
        print(error_message)
        print(error_traceback)
        return jsonify({'error': error_message, 'traceback': error_traceback}), 500
        


@bp.route('/process/datasplit', methods=['POST'])
def process_data_split():
    print('hello from data split')
    try:
        # Get request data
        data = request.get_json()
        strategy = data.get('splittingStrategy')
        train_per = int(data.get('trainPercentage'))
        test_per = int(data.get('testPercentage'))
        val_per = int(data.get('valPercentage'))
        
        # Retrieve data from MongoDB
        cursor = files_collection.find({}, {'_id': 0, 'username': 0})
        df = pd.DataFrame(list(cursor))
        df['Timestamp'] = pd.to_datetime(df['Timestamp'], format='%Y-%m-%d %H:%M:%S')

# Create new columns based on the Timestamp
        df['Year'] = df['Timestamp'].dt.year
        df['Month'] = df['Timestamp'].dt.month
        df['Day'] = df['Timestamp'].dt.day

# Check if the Timestamp column has hour and minute information
        if df['Timestamp'].dt.hour.nunique() > 1 :
            df['Hour'] = df['Timestamp'].dt.hour
            
        if df['Timestamp'].dt.minute.nunique() > 1:
            df['Minute'] = df['Timestamp'].dt.minute
        # Perform your data manipulation
        unique_years=df['Year'].unique()

        if strategy == 'years':
            unique_years = sorted(df['Year'].unique())
            num_years = len(unique_years)
            train_years = unique_years[:int(num_years * (train_per / 100))]
            remaining_years = unique_years[int(num_years * (train_per / 100)):]

            if len(remaining_years) == 1:
                last_year = remaining_years[0]
                last_year_data = df[df['Year'] == last_year]
                days = sorted(last_year_data['Day'].unique())
                num_days = len(days)
                val_days = days[:int(num_days * (val_per / (val_per + test_per)))]
                test_days = days[int(num_days * (val_per / (val_per + test_per))):]

                train_df = df[df['Year'].isin(train_years)]
                val_df = last_year_data[last_year_data['Day'].isin(val_days)]
                test_df = last_year_data[last_year_data['Day'].isin(test_days)]
            else:
                val_years = remaining_years[:int(len(remaining_years) * (val_per / (val_per + test_per)))]
                test_years = remaining_years[int(len(remaining_years) * (val_per / (val_per + test_per))):]

                train_df = df[df['Year'].isin(train_years)]
                val_df = df[df['Year'].isin(val_years)]
                test_df = df[df['Year'].isin(test_years)]


        elif strategy == 'days':
            train_df = pd.DataFrame()
            val_df = pd.DataFrame()
            test_df = pd.DataFrame()

            for month in df['Month'].unique():
                month_data = df[df['Month'] == month]
                days = sorted(month_data['Day'].unique())
                num_days = len(days)
                train_days = days[:int(num_days * (train_per / 100))]
                val_days = days[int(num_days * (train_per / 100)):int(num_days * ((train_per + val_per) / 100))]
                test_days = days[int(num_days * ((train_per + val_per) / 100)):]

                train_df = pd.concat([train_df, month_data[month_data['Day'].isin(train_days)]])
                val_df = pd.concat([val_df, month_data[month_data['Day'].isin(val_days)]])
                test_df = pd.concat([test_df, month_data[month_data['Day'].isin(test_days)]])


        elif strategy == 'random':
            print('random_split')
            print('data shape is: ',df.shape)
            shuffled_df = df.sample(frac=1).reset_index(drop=True)
            train_size = int(train_per / 100 * len(shuffled_df))
            val_size = int(val_per / 100 * len(shuffled_df))
            test_size = len(shuffled_df) - train_size - val_size
            print('Train size: ',train_size)
            print('Val size: ',val_size)
            print('Test size: ',test_size)

            train_df = shuffled_df[:train_size]
            val_df = shuffled_df[train_size:train_size + val_size]
            test_df = shuffled_df[train_size + val_size:]

            print('Train size: ',train_df.shape)
            print('Val size: ',val_df.shape)
            print('Test size: ',test_df.shape)
            print('data is splitted using random strategy')

        else:
            return jsonify({'error': 'Invalid operator specified'}), 400
        train_processed_files_collection.delete_many({})
        val_processed_files_collection.delete_many({})
        test_processed_files_collection.delete_many({})
        # Update MongoDB collection with the modified DataFrame
        def save_to_mongo(df, collection_name):
            try:
                collection = db[collection_name]
                data_dict = df.to_dict("records")
                collection.insert_many(data_dict)
            except Exception as e:
                error_message = f"An error occurred: {e}"
                error_traceback = traceback.format_exc()
                print(error_message)
                print(error_traceback)
                return jsonify({'error': error_message, 'traceback': error_traceback}), 500
                

        save_to_mongo(train_df, 'train_data')
        save_to_mongo(val_df, 'val_data')
        save_to_mongo(test_df, 'test_data')
        print('data is saved to mongo')
        # Write final DataFrame to CSV for debugging
        # df.to_csv('final_data.csv', sep=',', header=True, index=False)
        
        return jsonify({'message': 'Data processed successfully'}), 200
    except Exception as e:
        error_message = f"An error occurred: {e}"
        error_traceback = traceback.format_exc()
        print(error_message)
        print(error_traceback)
        return jsonify({'error': error_message, 'traceback': error_traceback}), 500
        