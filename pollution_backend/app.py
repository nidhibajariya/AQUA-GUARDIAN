"""
Pollution Verification Backend
Flask API for satellite image verification and CNN-based pollution classification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Import modules
from api.satellite import satellite_bp
from database.connection import init_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Enable CORS for frontend integration
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(satellite_bp, url_prefix='/api')
    
    # Initialize database
    init_db()
    
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'service': 'pollution-verification-backend',
            'version': '1.0.0'
        })
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Pollution Verification Backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
