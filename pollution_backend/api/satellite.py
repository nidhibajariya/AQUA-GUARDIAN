"""
Satellite data API endpoints
Handles satellite imagery fetching and processing
"""

from flask import Blueprint, request, jsonify
import logging
from datetime import datetime

from ..services.satellite_service import SatelliteService

logger = logging.getLogger(__name__)

satellite_bp = Blueprint('satellite', __name__)
satellite_service = SatelliteService()

@satellite_bp.route('/satellite/fetch', methods=['POST'])
def fetch_satellite_image():
    """
    Fetch satellite image for given coordinates and date
    
    Expected JSON payload:
    {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "date": "2025-01-20"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['latitude', 'longitude']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        logger.info(f"Fetching satellite image for coordinates: {latitude}, {longitude}")
        
        # Fetch satellite image
        image_path = satellite_service.fetch_satellite_image(latitude, longitude, date)
        
        if not image_path:
            return jsonify({
                'error': 'Unable to fetch satellite imagery for this location',
                'latitude': latitude,
                'longitude': longitude,
                'date': date
            }), 503
        
        return jsonify({
            'success': True,
            'image_path': image_path,
            'latitude': latitude,
            'longitude': longitude,
            'date': date,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Satellite fetch error: {str(e)}")
        return jsonify({'error': 'Failed to fetch satellite image'}), 500

@satellite_bp.route('/satellite/analyze', methods=['POST'])
def analyze_satellite_image():
    """
    Analyze satellite image for pollution detection
    
    Expected JSON payload:
    {
        "image_path": "/path/to/satellite/image.jpg",
        "pollution_type": "plastic_pollution"
    }
    """
    try:
        data = request.get_json()
        
        if 'image_path' not in data:
            return jsonify({'error': 'Missing required field: image_path'}), 400
        
        image_path = data['image_path']
        pollution_type = data.get('pollution_type', 'general')
        
        logger.info(f"Analyzing satellite image: {image_path}")
        
        # Analyze satellite image
        analysis_result = satellite_service.analyze_image(image_path, pollution_type)
        
        return jsonify({
            'success': True,
            'analysis': analysis_result,
            'image_path': image_path,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Satellite analysis error: {str(e)}")
        return jsonify({'error': 'Failed to analyze satellite image'}), 500

@satellite_bp.route('/satellite/health', methods=['GET'])
def satellite_health():
    """Check satellite service health"""
    try:
        health_status = satellite_service.check_health()
        return jsonify(health_status)
    except Exception as e:
        logger.error(f"Satellite health check error: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500
