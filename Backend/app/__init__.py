from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    app.config['UPLOAD_FOLDER'] = '../ModelDB'

    # Load configuration from config module
    app.config.from_object('config.Config')

    # Initialize JWT manager
    jwt = JWTManager(app)

    # Initialize Flask extensions here

    # Register blueprints here
    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp)

    from app.upload import bp as upload_bp
    app.register_blueprint(upload_bp)

    from app.preprocessing import bp as preprocessing_bp
    app.register_blueprint(preprocessing_bp)

    from app.prediction import bp as prediction_bp
    app.register_blueprint(prediction_bp)

    @app.route('/test/')
    def test_page():
        return '<h1>Testing the Flask Application Factory Pattern</h1>'

    return app