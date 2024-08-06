from app.upload import bp
from flask import request, jsonify, send_file, make_response
from pymongo import MongoClient
import pandas as pd
import io
import shutil
from sklearn.metrics import mean_squared_error, mean_absolute_error, mean_absolute_percentage_error

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['pfa']
files_collection = db['files']
val_processed_files_collection = db['val_data']
test_processed_files_collection = db['test_data']
train_processed_files_collection = db['train_data'] 
processed_files_collection = db['processed_data']
test_predicted_files_collection = db['test_predicted_data']


@bp.route('/files', methods=['POST'])
def get_files():
    # Get the username from the request data
    data = request.get_json()
    username = data.get('username')
    
    # Retrieve data from MongoDB
    cursor = files_collection.find({'username': username}, {'_id' : 0, 'username' : 0 })
    files_data = list(cursor)  # Convert cursor to a list of dictionaries

    # Convert list of dictionaries to DataFrame
    df = pd.DataFrame(files_data)
    
    # Replace NaN values with 0
    df.fillna(0, inplace=True)
    
    # Convert DataFrame back to list of dictionaries
    files_data = df.to_dict(orient='records')

    # Return the data in JSON format
    return jsonify(files_data)

@bp.route('/files_pred', methods=['POST'])
def get_files_pred():
    print('hello from files')
    # Get the username from the request data
    data = request.get_json()
    username = data.get('username')
    
    # Retrieve data from MongoDB
    cursor = test_predicted_files_collection.find({}, {'_id': 0})
    files_data = list(cursor)  # Convert cursor to a list of dictionaries

    # Convert list of dictionaries to DataFrame
    df = pd.DataFrame(files_data)
    # Convert DataFrame back to list of dictionaries
    files_data = df.to_dict(orient='records')

    # Return the data in JSON format
    return jsonify(files_data)



@bp.route('/delete', methods=['GET'])
def delete_files():
    files_collection.delete_many({})
    return jsonify({'message': 'Data deleted in MongoDB'})



@bp.route('/upload', methods=['POST'])
def upload_test():
    # Get the uploaded file
    uploaded_file = request.files['file']
    
    # Get the username from the request data
    username = request.form['username']
    
    # Read the uploaded CSV file into a pandas DataFrame
    df = pd.read_csv(uploaded_file)

    # Drop the first column (Unnamed column)
    # df = df.iloc[:, 1:]

    # Add the username column to the DataFrame
    df['username'] = username

    # Convert DataFrame to list of dictionaries
    data = df.to_dict(orient='records')

    # Insert data into MongoDB
    files_collection.insert_many(data)

    return jsonify({'message': 'Data stored in MongoDB'})


@bp.route('/columns', methods=['GET'])
def get_columns():
    # Retrieve a document from the collection
    document = files_collection.find_one({}, {'_id' : 0, 'username' : 0})

    if document:
        # Extract the keys (column names) from the document
        columns = list(document.keys())
        return jsonify({'columns': columns}), 200
    else:
        return jsonify({'error': 'No documents found in the collection'}), 404
    
@bp.route('/numeric/columns', methods=['GET'])
def get_numerical_columns():
    # Retrieve a document from the collection
    document = files_collection.find_one({}, {'_id': 0, 'username': 0})

    if document:
        # Filter numerical columns using list comprehension
        numerical_columns = [col for col, value in document.items() 
                              if isinstance(value, (int, float))]
        return jsonify({'columns': numerical_columns}), 200
    else:
        return jsonify({'error': 'No documents found in the collection'}), 404
    
@bp.route('/categorical/columns', methods=['GET'])
def get_categorical_columns():
    # Retrieve a document from the collection
    document = files_collection.find_one({}, {'_id': 0, 'username': 0})

    if document:
        # Filter categorical columns using list comprehension
        categorical_columns = [col for col, value in document.items() 
                              if not isinstance(value, (int, float))]
        print('categorical columns are: ',categorical_columns)
        return jsonify({'columns': categorical_columns}), 200
    else:
        return jsonify({'error': 'No documents found in the collection'}), 404
    

@bp.route('/download/csv', methods=['GET'])
def download_csv():
    try:
        # Retrieve data from MongoDB
        train_cursor = train_processed_files_collection.find({}, {'_id': 0})
        val_cursor = val_processed_files_collection.find({}, {'_id': 0})
        test_cursor = test_processed_files_collection.find({}, {'_id': 0})

        train_data = list(train_cursor)
        val_data = list(val_cursor)
        test_data = list(test_cursor)

        if train_data or val_data or test_data:
            response_data = {}
            if train_data:
                df_train = pd.DataFrame(train_data)
                print('Train in download is: ',df_train.shape)
                train_csv = df_train.to_csv(index=False)
                response_data['train.csv'] = train_csv
            
            if val_data:
                df_val = pd.DataFrame(val_data)
                print('Val is: ',df_val.shape)
                val_csv = df_val.to_csv(index=False)
                response_data['val.csv'] = val_csv
            
            if test_data:
                df_test = pd.DataFrame(test_data)
                print('Test is: ',df_test.shape)
                test_csv = df_test.to_csv(index=False)
                response_data['test.csv'] = test_csv

            # Return all CSV data in one response
            return jsonify(response_data), 200
        else:
            # If no Train, Validation, and Test data, get data from files_collection
            cursor = files_collection.find({}, {'_id': 0})
            df = pd.DataFrame(list(cursor))
            csv_data = df.to_csv(index=False)
            response_data = {'data.csv': csv_data}

            return jsonify(response_data), 200

    except Exception as e:
        error_message = f"An error occurred: {e}"
        error_traceback = traceback.format_exc()
        print(error_message)
        print(error_traceback)
        return jsonify({'error': error_message, 'traceback': error_traceback}), 500
        
    
    
@bp.route("/getUniqueValues/<column>")
def get_unique_values(column):
    unique_values = files_collection.distinct(column)
    return jsonify({"uniqueValues": unique_values})


###########"" Training model from scratch#############
import os
import numpy as np
from flask import Flask, request, jsonify
from tensorflow import keras
from datetime import datetime
import os
import pandas as pd

#Models Learning
from tensorflow.keras.layers import TFSMLayer
from tensorflow.keras import Model

from tensorflow.keras.callbacks import ModelCheckpoint,EarlyStopping
from tensorflow.keras.models import load_model
from tensorflow.keras.optimizers import Adam

from tensorflow.keras.callbacks import ModelCheckpoint,EarlyStopping
#from keras.models import load_model
from tensorflow.keras.optimizers import Adam
direct_path = '../SeqDB'

# Create the directory if it doesn't exist
if os.path.exists(direct_path):
    # Delete the directory and all its contents
    shutil.rmtree(direct_path)
# Recreate the directory
os.makedirs(direct_path)


horiz='5m'
reso='5m'
model_name='LSTM'
X_train = X_val = X_test = y_train = y_val = y_test = []
train_cursor = train_processed_files_collection.find({}, {'_id': 0})
val_cursor = val_processed_files_collection.find({}, {'_id': 0})
test_cursor = test_processed_files_collection.find({}, {'_id': 0})
train_data = pd.DataFrame(list(train_cursor))
val_data = pd.DataFrame(list(val_cursor))
test_data = pd.DataFrame(list(test_cursor))


@bp.route('/learningModels', methods=['POST'])
def learn_model():
    print('model is selected')
    print('hello from model training')
    print('shape is : ',train_data.shape)
    print('columns are: ',train_data.columns)
    try:
        data = request.json
        modelnm = data.get('modelname')
        global model_name
        model_name = modelnm
        horizon = data.get('horizon')
        resolution = data.get('resolution')
        global horiz
        horiz=horizon
        global reso
        reso=resolution
        print('selectedmodel',model_name)
        print('selectedhorizon',horizon)
        print('selectedresolution',resolution)

        Train_model(model_name,horizon,resolution)
        return jsonify({'message': 'Model trained'}), 200
    except Exception as e:
        error_traceback = traceback.format_exc()
        print(error_message)
        print(error_traceback)
        return jsonify({'error': error_message, 'traceback': error_traceback}), 500
        


import joblib
def Train_model(modelname,horizon,resolution):
    print('Train model')
    try:
        model_selected=gridserach(4,modelname,horizon,resolution)
        if modelname=='SVM':
            joblib.dump(svr, 'Trained_svr_model.pkl')
        else:
            model_selected.save("../ModelDB/Trained_"+str(modelname)+".h5")
        return jsonify({'message': 'Model trained'}), 200
    except Exception as e:
        error_traceback = traceback.format_exc()
        print(error_message)
        print(error_traceback)
        return jsonify({'error': error_message, 'traceback': error_traceback}), 500

def gridserach(epochs,model_name,horizon,resolution):
    print('gridsearch')
    if model_name!='SVM':
        X_train,X_val,X_test,y_train,y_val,y_test=generate_seq(model_name,train_data,val_data,test_data,horizon,resolution)
        # neurones=[[4,2,1],[8,4,2],[32,16,8],[64,16,8],[64,32,16],[8,4,2,1],[16,8,4,2],[64,32,16,8],[64,64,16,8],[128,64,32,16]]
        # lrs=[0.001,0.01,0.0001,0.1]
        # epsilons=[1e-08,1e-07,1e-06,1e-04,1e-02]
        # bs=[64,32,16]
        #For test: 
        neurones=[[4,2,1]]
        lrs=[0.001]
        epsilons=[1e-08]
        bs=[64]
        t=100000
        lr=0
        eps=0
        N=[]
        bsi=0
        model_selected=[]
        MAE_test=0
        predictions=[]
        hist=[]
        
        for b in range(len(bs)):
            for j in range(len(neurones)):
                for k in range(len(lrs)):
                    for l in range(len(epsilons)):
                        MAE_val,model,history=build_lstm_model(model_name,X_train,X_val,y_train,y_val,neurones[j],lrs[k],epsilons[l],bs[b],epochs)
                        print('Params :',neurones[j],lrs[k],epsilons[l],bs[b],sep="---")
                        print('Val_MAE :',MAE_val)
                        
                        print('---------------------------')
                        if (MAE_val<t):
                            t=MAE_val
                            model_selected=model
                            lr=lrs[k]
                            eps=epsilons[l]
                            N=neurones[j]
                            bsi=bs[b]
                            
                            
                            hist=history
    else:
        model_selected=build_svm(train_data,val_data)
    return model_selected
import os
os.environ["CUDA_VISIBLE_DEVICES"]="-1"   #0 for GPU  
import tensorflow as tf
import numpy as np 
import random

from sklearn.metrics import mean_absolute_error
def reset_random_seeds():
    os.environ['PYTHONHASHSEED']=str(1)
    tf.random.set_seed(1)
    np.random.seed(1)
    random.seed(1)
def build_lstm_model(model_name,X_train,X_val,y_train,y_val,neurones,lr,epsilon,bs,epochs):
    print('build dl model')
    earlystopping=EarlyStopping(monitor='val_loss', min_delta=0.001, patience=35, verbose=0,mode='auto', baseline=None,
                                    restore_best_weights=True)
    callbacks_list = [earlystopping]
    my_init = tf.keras.initializers.Constant(value=0.2)
    reset_random_seeds()
    NUM_EPOCHS =epochs
    if model_name!= 'SVM':
        #Model Architecture
        model=tf.keras.Sequential()
        if model_name=='LSTM':
            model.add(tf.keras.layers.Input(shape=(X_train.shape[1],X_train.shape[2])))
            if (len(neurones)==3):
                model.add(tf.keras.layers.LSTM(neurones[0],activation='relu',kernel_initializer=my_init))
                model.add(tf.keras.layers.Dense(neurones[1],activation='relu', kernel_initializer=my_init))
                model.add(tf.keras.layers.Dense(neurones[2],activation='relu', kernel_initializer=my_init))
            if (len(neurones)==4):
                model.add(tf.keras.layers.LSTM(neurones[0],activation='relu',kernel_initializer=my_init,return_sequences=True))
                model.add(tf.keras.layers.LSTM(neurones[1],activation='relu',kernel_initializer=my_init))
                model.add(tf.keras.layers.Dense(neurones[2],activation='relu', kernel_initializer=my_init))
                model.add(tf.keras.layers.Dense(neurones[3],activation='relu', kernel_initializer=my_init))
        if model_name=='CNN':
            model.add(tf.keras.layers.Input(shape=(1,X_train.shape[2])))
            if (len(neurones)==3):
                model.add(tf.keras.layers.Conv1D(neurones[0], 3,strides=1, activation='relu',padding='same'))
                model.add(tf.keras.layers.MaxPooling1D(2,strides=2,padding='same'))
                model.add(tf.keras.layers.Flatten())
                model.add(tf.keras.layers.Dense(neurones[1],activation='relu', kernel_initializer=my_init))
                model.add(tf.keras.layers.Dense(neurones[2],activation='relu', kernel_initializer=my_init))
            if (len(neurones)==4):
                model.add(tf.keras.layers.Conv1D(neurones[0], 3,strides=1, activation='relu',padding='same'))
                model.add(tf.keras.layers.MaxPooling1D(2, strides=2,padding='same'))
                model.add(tf.keras.layers.Conv1D(neurones[1], 3,strides=1, activation='relu',padding='same'))
                model.add(tf.keras.layers.MaxPooling1D(2,strides=2,padding='same'))
                model.add(tf.keras.layers.Flatten())
                model.add(tf.keras.layers.Dense(neurones[2],activation='relu', kernel_initializer=my_init))
                model.add(tf.keras.layers.Dense(neurones[3],activation='relu', kernel_initializer=my_init))
        if model_name=='MLP':
            model.add(tf.keras.layers.Input(shape=(X_train.shape[1])))
            if (len(neurones)==3):
                model.add(tf.keras.layers.Dense(neurones[0],activation='relu',kernel_initializer=my_init))
                model.add(tf.keras.layers.Dense(neurones[1],activation='relu', kernel_initializer=my_init))
                model.add(tf.keras.layers.Dense(neurones[2],activation='relu', kernel_initializer=my_init))
            if (len(neurones)==4):
                model.add(tf.keras.layers.Dense(neurones[0],activation='relu',kernel_initializer=my_init,return_sequences=True))
                model.add(tf.keras.layers.Dense(neurones[1],activation='relu',kernel_initializer=my_init))
                model.add(tf.keras.layers.Dense(neurones[2],activation='relu', kernel_initializer=my_init))
                model.add(tf.keras.layers.Dense(neurones[3],activation='relu', kernel_initializer=my_init))
        
        model.add(tf.keras.layers.Dense(1, kernel_initializer=my_init))
        model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=lr,epsilon=epsilon), loss='mean_absolute_error')
        history=model.fit(X_train, y_train,batch_size=bs,epochs=NUM_EPOCHS, validation_data=(X_val,y_val),verbose=0,callbacks=callbacks_list)
        results = model.evaluate(X_val, y_val, batch_size=bs,verbose=0)

    return results,model,history
def build_svm(Train_f,Val_f):
    print('build svm model')
    from sklearn.svm import SVR
    from sklearn.model_selection import GridSearchCV
    from sklearn.model_selection import PredefinedSplit
    reset_random_seeds()
    Train_val= pd.concat([Train_f,Val_f])
    Train_val=Train_val.reset_index(drop=True)
    Train_indexes=range(Train_f.shape[0])
    split_index = [-1 if x in Train_indexes else 0 for x in Train_val.index]
    print(len(split_index))
    pds = PredefinedSplit(test_fold = split_index)
    X=Train_val.drop(['Active_Power'],axis=1)
    y=Train_val['Active_Power']
    x_test=Test_f.drop(['Active_Power'],axis=1)
    y_test=Test_f['Active_Power']
    file_path_y = os.path.join(direct_path, 'y_test_HD_1.npy')
    np.save(file_path_y, y_test)
    file_path_x = os.path.join(direct_path, 'X_test_HD_1.npy') 
    x_test.to_csv(file_path_x,index=None)
    Scors=['neg_mean_absolute_error']
    gridParams={'kernel':['linear'],
        'gamma':['scale','auto'],
                    'C':[0.1,1e-09, 1e-08, 1e-07, 1e-06, 1e-05, 1e-04, 1e-03, 1e-02,
        1e-01, 1e+00, 1e+01, 1e+02, 1e+03]
        }
    svr_model=SVR()
    svr = GridSearchCV(svr_model,gridParams,
                                verbose=3,
                                cv=pds,
                                scoring=Scors[0])

    svr.fit(X,y)
    print(svr.best_estimator_)
    print(svr.best_score_)
    print(svr.cv_results_)
    return svr

def generate_seq(model_name,Train,Val,Test,horizon,resolution):
    X_train = X_val = X_test = y_train = y_val = y_test = None
    print('generate dl seq')
    print(model_name)
    if model_name in ('CNN', 'LSTM'):
        if model_name=='CNN':
            n=0
            print(n)
        if model_name == 'LSTM':
            n=1
            print('n lstm,:',n)
        for p in [1]:
            print('generate_seq')
            X_train,X_test,X_val,y_train,y_test,y_val=make_data(Train,Val,Test,n,resolution)
            print(X_train.shape)
            print(y_train.shape)
            print("*******************")
            print(X_val.shape)
            print(y_val.shape)
            print("*******************")
            print(X_test.shape)
            print(y_test.shape)
            zero_seq=[]
            fzero_seq=[]
            for r in range(1,2):
                fzero_seq.append([0.]*X_test.shape[2])
            fzero_seq.append([0.]*X_test.shape[2])
            zero_seq=np.array(fzero_seq)
            L_train=[]
            L_test=[]
            L_val=[]
            for i in range(X_train.shape[0]):
                if(np.array_equal(X_train[i], zero_seq)):
                    L_train.append(i)
            X_train=np.delete(X_train,L_train, axis=0)
            y_train=np.delete(y_train,L_train, axis=0)

            for i in range(X_val.shape[0]):
                if(np.array_equal(X_val[i], zero_seq)):
                    L_val.append(i)
            X_val=np.delete(X_val, L_val, axis=0)
            y_val=np.delete(y_val, L_val, axis=0)

            for i in range(X_test.shape[0]):
                if(np.array_equal(X_test[i], zero_seq)):
                    L_test.append(i)
            X_test=np.delete(X_test, L_test, axis=0)
            y_test=np.delete(y_test, L_test, axis=0)
            file_path_x = os.path.join(direct_path, 'X_test_HD_1.npy')
            np.save(file_path_x, X_test)
            file_path_y = os.path.join(direct_path, 'y_test_HD_1.npy')
            np.save(file_path_y, y_test)
            print(X_train.shape)
            print(y_train.shape)
            print("*******************")
            print(X_val.shape)
            print(y_val.shape)
            print("*******************")
            print("X_tes and y_test shapes*******************")
            print(X_test.shape)
            print(y_test.shape)
            
            a= np.zeros(X_test.shape[2])
            L_test=[]
            count=0
            for w in range(len(y_test)):
                if(np.array_equal(X_test[w][1], a)):
                    L_test.append(w)
                    count=count+1
            print('number of zeros in test are: ',count)
            # np.save('../SeqDB/X_test_HD_'+str(n),X_test)
            # np.save('../SeqDB/y_test_HD_'+str(n),y_test)
    if model_name=='MLP':
        X_train=Train.drop(['Active_Power'],axis=1)
        y_train=Train['Active_Power']
        X_val=Val.drop(['Active_Power'],axis=1)
        y_val=Val['Active_Power']
        X_test=Test.drop(['Active_Power'],axis=1)
        y_test=Test['Active_Power']
        file_path_y = os.path.join(direct_path, 'y_test_HD_1.npy')
        np.save(file_path_y, y_test)
        file_path_x = os.path.join(direct_path, 'X_test_HD_1.npy') 
        X_test.to_csv(file_path_x,index=None)
    if X_train is None or X_val is None or X_test is None or y_train is None or y_val is None or y_test is None:
        raise ValueError("The sequences were not generated. Please check the model_name and input data.")

    return X_train,X_val,X_test,y_train,y_val,y_test

import calendar
def days_in_month(year, month):
    num_days = calendar.monthrange(year, month)[1]
    return list(range(1, num_days + 1))    
def df_fill(df,colum,n,resolution): 
    print('columns are: ',df.columns)
    array_5minutes=[]
    if resolution == '1y':
        df['VTime']=df['version'].astype(str)
        for l in range(n):
            array_5minutes.append(np.array([0]*len(colum)))
        for ver in (df['VTime'].unique()):
            data_vr=df[df['VTime']==yr]
            data_vr=data_vr.reset_index(drop=True)
            years=sorted(data_vr['Year'].unique())
            years = list(range(min(years), max(years) + 1))
            for yr in years:
                data_yr=data_vr[data_vr['VTime']==month]
                data_yr=data_yr.reset_index(drop=True)
                if (data_yr.shape[0]!=0):
                    my_data=data_month[colum]
                    array_5minutes.append(np.array(my_data.iloc[0]))
                else:
                    array_5minutes.append(np.array([0]*len(colum)))

    if resolution == '1m':
        df['VTime']=df['version'].astype(str)+'-'+df['Year'].astype(str)
        for l in range(n):
            array_5minutes.append(np.array([0]*len(colum)))
        for yr in (df['VTime'].unique()):
            data_yr=df[df['VTime']==yr]
            data_yr=data_yr.reset_index(drop=True)
            for m in range (1,13):
                data_month=data_yr[data_yr['VTime']==month]
                data_month=data_month.reset_index(drop=True)
                if (data_month.shape[0]!=0):
                    my_data=data_month[colum]
                    array_5minutes.append(np.array(my_data.iloc[0]))
                else:
                    array_5minutes.append(np.array([0]*len(colum)))



    if resolution == '1d':
        df['VTime']=df['version'].astype(str)+'-'+df['Year'].astype(str)+'-'+df['Month'].astype(str)
        for l in range(n):
            array_5minutes.append(np.array([0]*len(colum)))
        for month in (df['VTime'].unique()):
            yr = int(month.split('-')[1])
            m= int(month.split('-')[2])
            data_month=df[df['VTime']==month]
            data_month=data_month.reset_index(drop=True)
            #days=data_month['Day'].unique()
            days=days_in_month(yr,m)
            for da in range(days[0],days[-1]+1):
                data_day=data_month[data_month['Day']==da]
                data_day=data_day.reset_index(drop=True)
                if (data_day.shape[0]!=0):
                    my_data=data_day[colum]
                    array_5minutes.append(np.array(my_data.iloc[0]))
                else:
                    array_5minutes.append(np.array([0]*len(colum)))

    else:    
        cnt=0
        print('this is the data lenght befor sequencing',df.shape)
        df['VTime']=df['version'].astype(str)+'-'+df['Year'].astype(str)+'-'+df['Month'].astype(str)+'-'+df['Day'].astype(str)
        print('the unique days are: ',len(df['VTime'].unique()))
        print('the unique days are: ',df['VTime'].unique())
        for day in (df['VTime'].unique()):
            for l in range(n):
                array_5minutes.append(np.array([0]*len(colum)))
            dd=df[df['VTime']==day]
            dd=dd.reset_index(drop=True)
            hours=dd['Hour'].unique()
            hours=sorted(hours)
            print('those are unique hours: ',hours)
            for hr in range(hours[0],hours[-1]+1):
                data_hour=dd[dd['Hour']==hr]
                data_hour=data_hour.reset_index(drop=True)
                if resolution=='5m':
                    if (data_hour.shape[0]!=0):
                        for minu in range(0,60,5):
                            dm=data_hour[data_hour['Minute']==minu]
                            dm=dm.reset_index(drop=True)
                            if (dm.shape[0]!=0):
                                cnt=cnt+1
                                my_data=dm[colum]
                                array_5minutes.append(np.array(my_data.iloc[0]))
                            else:
                                array_5minutes.append(np.array([0]*len(colum)))
                    else:
                        for s in range(0,9):
                            array_5minutes.append(np.array([0]*len(colum)))
                if resolution == '15m':
                    if (data_hour.shape[0]!=0):
                        for minu in range(0,5,1):
                            dm=data_hour[data_hour['15minute']==minu]
                            dm=dm.reset_index(drop=True)
                            if (dm.shape[0]==1):
                                my_data=dm[colum]
                                array_5minutes.append(np.array(my_data.iloc[0]))
                            else:
                                array_5minutes.append(np.array([0]*len(colum)))
                    else:
                        for s in range(0,9):
                            array_5minutes.append(np.array([0]*len(colum)))
                if resolution =='1h':
                    if (data_hour.shape[0]!=0):
                        my_data=data_hour[colum]
                        array_5minutes.append(np.array(my_data.iloc[0]))
                    else:
                        array_5minutes.append(np.array([0]*len(colum)))

    print('the coun is: ',cnt)
    return np.array(array_5minutes)

#This function create output feature(PV power) and merge input and output variables
def remove_target_column(columns, target_column):
    if target_column in columns:
        columns.remove(target_column)
    return columns
def combin_seq(df, cols, n, resolution):
    # Assuming df_fill is a function defined elsewhere that fills missing data
    my_array = df_fill(df, cols, n, resolution)
    
    dt = pd.DataFrame(my_array, columns=cols)
    print('columns of combin: ',cols)
    dt = dt.reset_index(drop=True)
    the_array = []
    pmp_array = []

    # Find the index of the Active_Power column
    active_power_index = dt.columns.get_loc('Active_Power')
    if 'VTime' in dt.columns:
        dt = dt.drop(columns=['VTime'])
    
    for i in range(dt.shape[0]):
        if i == dt.shape[0] - n:
            break
        else:
            the_minute_array = []
            for j in range(i, i + (n + 1)):
                pmp = dt['Active_Power'][j]
                # Exclude Active_Power from the predictors
                row_array = np.array(dt.iloc[j])
                row_array = np.delete(row_array, [active_power_index],axis=0)
                the_minute_array.append(row_array)
            pmp_array.append(pmp)
            the_array.append(np.array(the_minute_array).astype(np.float32))
    
    return np.array(the_array), np.array(pmp_array)
def make_data(Train1,Val1,Test1,n,resolution):
    print(Train1.columns)
    columns=Train1.columns
    target_column = 'Active_Power'
    columns = list(columns)
    columns.remove(target_column)
    # cols_to_use = pd.Index(columns)
    cols_to_use=Train1.columns

    print('make_test_sequences')
    X_test,y_test=combin_seq(Test1,cols_to_use,n,resolution)
    print('make_val_sequences')
    X_val,y_val=combin_seq(Val1,cols_to_use,n,resolution)
    print('make_train_sequences')
    X_train,y_train=combin_seq(Train1,cols_to_use,n,resolution)
    return X_train,X_test,X_val,y_train,y_test,y_val



######################### Model Evaluation and scoring #######################
mode_de_pred=None
@bp.route('/model/predict',methods=['POST'])
def model_predict():
    global mode_de_pred
    mode_de_pred='test'
    print('mode_de_pred: ',mode_de_pred)
    data = request.json
    model_name = data.get('model')
    cursor = processed_files_collection.find({}, {'_id': 0})
    df = pd.DataFrame(list(cursor))
    df['Active_Power']=df['Active_Power']*1000
    df['rating']=df['rating']*1000
    df['Active_Power']=df['Active_Power']/df['area']
    df['rating']=df['rating']/df['area']
    df['Time'] = pd.to_datetime(df['Timestamp'], format='%Y-%m-%d %H:%M:%S')
    df['Day']=df['Time'].dt.day
    df['Month']=df['Time'].dt.month
    df['Hour']=df['Time'].dt.hour
    df['Minute']=df['Time'].dt.minute
    df['Year']=df['Time'].dt.year
    # cols_to_use = pd.Index(columns)
    cols_to_use=['Month','Day','Hour','Minute','technology','year_of_installation','rating',
                 'azimuth', 'tilt','track','roof','maintenance_startm', 'maintenance_starth',
       'maintenance_endm', 'maintenance_endh','Global_Horizontal_Radiation',
                 'Weather_Relative_Humidity','Weather_Daily_Rainfall'
                 ,'Weather_Temperature_Celsius','Active_Power']
    print('make_test_sequences')
    X_test,y_test=combin_seq(df,cols_to_use,1,'5m')
    print('sequences of test are built')
    zero_seq=[]
    fzero_seq=[]
    for r in range(1,2):
        fzero_seq.append([0.]*X_test.shape[2])
    fzero_seq.append([0.]*X_test.shape[2])
    zero_seq=np.array(fzero_seq)
    L_test=[]
    for i in range(X_test.shape[0]):
        if(np.array_equal(X_test[i], zero_seq)):
            L_test.append(i)
    X_test=np.delete(X_test, L_test, axis=0)
    y_test=np.delete(y_test, L_test, axis=0)
   
    print("X_tes and y_test shapes*******************")
    print(X_test.shape)
    print(y_test.shape)
    a= np.zeros(X_test.shape[2])
    L_test=[]
    count=0
    for w in range(len(y_test)):
        if(np.array_equal(X_test[w][1], a)):
            L_test.append(w)
            count=count+1
    X_test=np.delete(X_test, L_test, axis=0)
    y_test=np.delete(y_test, L_test, axis=0)
    file_path_x = os.path.join(direct_path, 'X_test_HD_1.npy')
    np.save(file_path_x, X_test)
    file_path_y = os.path.join(direct_path, 'y_test_HD_1.npy')
    np.save(file_path_y, y_test)
    print('number of zeros in test are: ',count)
            # np.save('../SeqDB/X_test_HD_'+str(n),X_test)
    processed_files_collection.delete_many({})
   

    save_to_mongo(df, 'processed_data')
       
    return jsonify({'message': 'Model trained'}), 200
   
@bp.route('/model/score')
def get_model_score():
    print('mode_de_pred from score: ',mode_de_pred)
    if mode_de_pred=='test':
        print('this is test mode from score')
        model=load_model_from_file_with_name(model_name)
        cursor=processed_files_collection.find({}, {'_id': 0})
        df = pd.DataFrame(list(cursor))
        cols=['Year','Month','Day','Hour','Minute','version','technology','year_of_installation','rating',
                 'azimuth', 'tilt','track','roof','maintenance_startm', 'maintenance_starth',
       'maintenance_endm', 'maintenance_endh','Global_Horizontal_Radiation',
                 'Weather_Relative_Humidity','Weather_Daily_Rainfall'
                 ,'Weather_Temperature_Celsius','Active_Power']
        df=df[cols]
        print('the mode was test')

    else:
        print('this is not test mode')
        model = load_model_from_file()
        cursor = test_processed_files_collection.find({}, {'_id': 0})
        df = pd.DataFrame(list(cursor))
    print('shape of test,: ',df.shape)
    X_test, y_test = load_test_data()
    print('shape of xtest,: ',len(X_test))
    num_columns = len(df.columns)-1
    print('columns for a array: ', num_columns)
# Create an array filled with zeros, with the length equal to the number of columns
    
        
    


    if mode_de_pred=='test':
        predictions = model(tf.constant(X_test))
        predictions = {key: value.numpy().tolist() for key, value in predictions.items()}
        print('predictions len is: ',len(predictions['dense_8']))
        #print(predictions['dense_8'])
        predictions1=predictions['dense_8']
        print('predictions are: ',predictions1)
        predictions=np.array(predictions1)
        #flattened_predictions = [item[0] for item in predictions]
        #predictions=flattened_predictions
    else:
        predictions = model.predict(X_test)
    print('df shape: ',df.shape,'predictions')
    df['Active_Power_pred']=predictions  
    if  reso == '5m':
        if horiz == '15m':
            df=encode_15_mn(df)
            df = df.groupby(['Year', 'Month', 'Day', 'Hour','15minute']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
        if horiz == '1h':
            df = df.groupby(['Year', 'Month', 'Day', 'Hour']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
         
        if horiz == '1d':
            df = df.groupby(['Year', 'Month', 'Day']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
    
        if horiz == '1m':
            df = df.groupby(['Year', 'Month']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()

        if horiz == '1y':
            df = df.groupby(['Year']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
    if  reso == '15m':
        if horiz == '1h':
            df = df.groupby(['Year', 'Month', 'Day', 'Hour']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
    
        if horiz == '1d':
            df = df.groupby(['Year', 'Month', 'Day']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
    
        if horiz == '1m':
            df = df.groupby(['Year', 'Month']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
        if horiz == '1y':
            df = df.groupby(['Year']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
    if  reso == '1h':
        if horiz == '1d':
            df = df.groupby(['Year', 'Month', 'Day']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
        if horiz == '1m':
            df = df.groupby(['Year', 'Month']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
        if horiz == '1y':
            df = df.groupby(['Year']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
    if  reso == '1d':
        if horiz == '1m':
            df = df.groupby(['Year', 'Month']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
        if horiz == '1y':
            df = df.groupby(['Year']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
    if  reso == '1m':
        if horiz == '1y':
            df = df.groupby(['Year']).agg({
            'Active_Power': 'sum','Active_Power_pred':'sum'}).reset_index()
    # Check if Active_Power_pred column exists
    if 'Active_Power_pred' not in df.columns:
        return jsonify({'error': 'Active_Power_pred column does not exist'})
    df['Timestamp'] = pd.to_datetime(df[['Year', 'Month', 'Day', 'Hour', 'Minute']])
    df['Timestamp'] = df['Timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S')
    test_predicted_files_collection.delete_many({})
   

    save_to_mongo(df, 'test_predicted_data')

    nan_counts = df.isna().sum()
    print("NaN values in each column:\n", nan_counts)
    
    # Print rows with NaN values
    nan_rows = df[df.isna().any(axis=1)]
    print("Rows with NaN values:\n", nan_rows)
    # Calculate RMSE
    rmse = np.sqrt(mean_squared_error(df["Active_Power"], df["Active_Power_pred"]))

    # Calculate NRMSE
    nrmse = rmse*100/df["Active_Power"].mean()

    # Calculate MSE
    mse = mean_squared_error(df["Active_Power"], df["Active_Power_pred"])

    # Calculate MAE
    mae = mean_absolute_error(df["Active_Power"], df["Active_Power_pred"])

    # Calculate NMAE
    nmae = mae*100/df["Active_Power"].mean()

    # Calculate MAPE
    mape=mean_absolute_percentage_error(df["Active_Power"], df["Active_Power_pred"])
    
    return jsonify({'MAE': mae, 'NMAE': nmae, 'RMSE': rmse, 'NRMSE': nrmse, 'MAPE': mape})


def encode_15_mn(data):
    data['15minute'] = 15
    
    conditions = [
        (data['Minute'] >= 0) & (data['Minute'] <= 10),
        (data['Minute'] >= 15) & (data['Minute'] <= 25),
        (data['Minute'] >= 30) & (data['Minute'] <= 40),
        (data['Minute'] >= 45) & (data['Minute'] <= 55)
    ]
    
    choices = [1, 2, 3, 4]
    
    data['15minute'] = np.select(conditions, choices, default=15)
    
    return data
def load_test_data():
    if model_name== 'LSTM' or model_name== 'CNN':
        X_test_path = '../SeqDB/X_test_HD_1.npy'
    else: 
        X_test_path = '../SeqDB/X_test_HD_1.csv'
    y_test_path = '../SeqDB/y_test_HD_1.npy'
    
    if os.path.exists(X_test_path) and os.path.exists(y_test_path):
        if model_name== 'LSTM' or model_name== 'CNN':
            X_test = np.load(X_test_path)
        else:
            X_test = pd.read_csv(X_test_path)
        y_test = np.load(y_test_path)
    else:
        raise FileNotFoundError("Test data not found in the specified directory.")
    
    return X_test, y_test

def find_model_file():
    model_dir = '../ModelDB'
    model_file = None
    
    for file in os.listdir(model_dir):
        if file.endswith('.h5'):
            model_file = os.path.join(model_dir, file)
            break
    
    if model_file is None:
        raise FileNotFoundError(f"No model file found in {model_dir}.")
    
    return model_file
from tensorflow.keras.initializers import Orthogonal

# Define a dictionary of custom objects
import tensorflow as tf
print(tf.__version__)

def load_model_from_file():
   
    model_path = find_model_file()
    model = load_model(model_path)
    return model

def load_model_from_file_with_name(model_name):
    UPLOAD_FOLDER = '../TrainedModelDB'
    model_path = os.path.join(os.path.dirname(__file__), UPLOAD_FOLDER, model_name)
    
    if os.path.exists(model_path):
        model = tf.saved_model.load(model_path)
        inference_function = model.signatures["serving_default"]
    else:
        raise FileNotFoundError(f"Model file not found at {model_path}.")
    
    return inference_function

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
                
