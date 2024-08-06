from app.auth import bp
from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity,unset_jwt_cookies
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import User
from datetime import datetime, timedelta

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['pfa']
users_collection = db['users']

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    roles = data.get('roles', ["researcher"])  

    if users_collection.find_one({'username': username}):
        return jsonify({'message': 'User already exists'}), 409
    
    hashed_password = generate_password_hash(password)
    
    # Create User
    new_user = User(
        username=username,
        password=hashed_password,
        roles=roles,
        firstName=data.get('firstName'),
        lastName=data.get('lastName'),
        phone=data.get('phone'),
        email=data.get('email'),
        created_at=datetime.now().strftime("%d-%m-%Y") 
    )
    new_user.save()
    return jsonify({'message': 'User registered successfully'}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = users_collection.find_one({'username': username})

    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid credentials'}), 401

    # Définir la durée de vie du token
    expires_delta = timedelta(hours=2)

    # Calculate the token expiration time
    token_expiration = datetime.utcnow() + expires_delta

    access_token = create_access_token(identity=username, expires_delta=expires_delta)

    # Construct the response manually
    response = {
        "username": user['username'],
        "roles": user['roles'],
        "access_token": access_token,
        # "tokenExpiration": token_expiration.strftime("%Y-%m-%d %H:%M:%S")
        "tokenExpiration": int(token_expiration.timestamp() * 1000)
    }

    print("access_token:",access_token)

    return jsonify(response), 200

@bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    user = users_collection.find_one({'username': current_user})
    user_roles = user['roles']
    return jsonify(logged_in_as=current_user, roles=user_roles), 200

def admin_required(fn):
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user = get_jwt_identity()
        user = users_collection.find_one({'username': current_user})
        if 'admin' not in user['roles']:
            return jsonify({'message': 'Admin role required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@bp.route('/admin-protected', methods=['GET'])
@admin_required
def admin_protected():
    return jsonify(message='This is an admin protected endpoint'), 200


@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    current_user = get_jwt_identity()
    response = jsonify({'message': 'Successfully logged out'})
    unset_jwt_cookies(response)
    return response, 200
