"""
Satellite Service for fetching and processing satellite imagery
Supports Google Earth Engine and Sentinel Hub APIs
"""

import os
import logging
import requests
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import ee
from PIL import Image
import io

logger = logging.getLogger(__name__)

class SatelliteService:
    def __init__(self):
        self.ee_initialized = False
        self.sentinel_hub_url = os.getenv('SENTINEL_HUB_URL', 'https://services.sentinel-hub.com/api/v1/process')
        self.sentinel_hub_token = os.getenv('SENTINEL_HUB_TOKEN')
        self.google_earth_engine_key = os.getenv('GOOGLE_EARTH_ENGINE_KEY')
        self.satellite_cache_dir = os.getenv('SATELLITE_CACHE_DIR', './data/satellite_images')
        
        # Create cache directory
        os.makedirs(self.satellite_cache_dir, exist_ok=True)
        
        # Initialize Google Earth Engine if key is provided
        if self.google_earth_engine_key:
            self._initialize_google_earth_engine()
    
    def _initialize_google_earth_engine(self):
        """Initialize Google Earth Engine"""
        try:
            # Set up authentication (this would need to be configured properly)
            # ee.Authenticate()  # This requires user interaction
            # ee.Initialize()
            self.ee_initialized = True
            logger.info("Google Earth Engine initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Google Earth Engine: {str(e)}")
            self.ee_initialized = False
    
    def fetch_satellite_image(self, latitude: float, longitude: float, date: str) -> Optional[str]:
        """
        Fetch satellite image for given coordinates and date
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate  
            date: Date in YYYY-MM-DD format
            
        Returns:
            Path to saved satellite image or None if failed
        """
        try:
            # Try Google Earth Engine first
            if self.ee_initialized:
                image_path = self._fetch_from_google_earth_engine(latitude, longitude, date)
                if image_path:
                    return image_path
            
            # Fallback to Sentinel Hub
            image_path = self._fetch_from_sentinel_hub(latitude, longitude, date)
            if image_path:
                return image_path
            
            # Fallback to Landsat (free option)
            image_path = self._fetch_from_landsat(latitude, longitude, date)
            return image_path
            
        except Exception as e:
            logger.error(f"Error fetching satellite image: {str(e)}")
            return None
    
    def _fetch_from_google_earth_engine(self, latitude: float, longitude: float, date: str) -> Optional[str]:
        """Fetch image from Google Earth Engine"""
        try:
            if not self.ee_initialized:
                return None
            
            # Define point of interest
            point = ee.Geometry.Point(longitude, latitude)
            
            # Get Sentinel-2 collection
            collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                         .filterBounds(point)
                         .filterDate(date, (datetime.strptime(date, '%Y-%m-%d') + timedelta(days=1)).strftime('%Y-%m-%d'))
                         .sort('system:time_start', False))
            
            # Get the most recent image
            image = collection.first()
            
            if image is None:
                logger.warning("No Sentinel-2 image found for the specified date")
                return None
            
            # Select RGB bands
            rgb_image = image.select(['B4', 'B3', 'B2']).multiply(0.0001)
            
            # Define region around the point (1km buffer)
            region = point.buffer(1000).bounds()
            
            # Get image URL
            url = rgb_image.getThumbURL({
                'region': region,
                'dimensions': 512,
                'format': 'jpg'
            })
            
            # Download and save image
            response = requests.get(url)
            if response.status_code == 200:
                filename = f"satellite_{latitude}_{longitude}_{date.replace('-', '')}.jpg"
                filepath = os.path.join(self.satellite_cache_dir, filename)
                
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                logger.info(f"Satellite image saved: {filepath}")
                return filepath
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching from Google Earth Engine: {str(e)}")
            return None
    
    def _fetch_from_sentinel_hub(self, latitude: float, longitude: float, date: str) -> Optional[str]:
        """Fetch image from Sentinel Hub"""
        try:
            if not self.sentinel_hub_token:
                logger.warning("Sentinel Hub token not provided")
                return None
            
            # Define bounding box (small area around the point)
            buffer = 0.01  # ~1km buffer
            bbox = [
                longitude - buffer,  # minX
                latitude - buffer,   # minY
                longitude + buffer,  # maxX
                latitude + buffer    # maxY
            ]
            
            # Sentinel Hub request
            request_body = {
                "input": {
                    "bounds": {
                        "bbox": bbox,
                        "properties": {
                            "crs": "http://www.opengis.net/def/crs/EPSG/0/4326"
                        }
                    },
                    "data": [{
                        "type": "sentinel-2-l2a",
                        "dataFilter": {
                            "timeRange": {
                                "from": f"{date}T00:00:00Z",
                                "to": f"{date}T23:59:59Z"
                            }
                        }
                    }]
                },
                "output": {
                    "width": 512,
                    "height": 512,
                    "responses": [{
                        "identifier": "default",
                        "format": {
                            "type": "image/jpeg"
                        }
                    }]
                },
                "evalscript": """
                    // Return RGB composite
                    return [B04, B03, B02];
                """
            }
            
            headers = {
                'Authorization': f'Bearer {self.sentinel_hub_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                self.sentinel_hub_url,
                json=request_body,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                filename = f"sentinel_{latitude}_{longitude}_{date.replace('-', '')}.jpg"
                filepath = os.path.join(self.satellite_cache_dir, filename)
                
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                logger.info(f"Sentinel Hub image saved: {filepath}")
                return filepath
            
            logger.error(f"Sentinel Hub request failed: {response.status_code}")
            return None
            
        except Exception as e:
            logger.error(f"Error fetching from Sentinel Hub: {str(e)}")
            return None
    
    def _fetch_from_landsat(self, latitude: float, longitude: float, date: str) -> Optional[str]:
        """Fetch image from Landsat (NASA's free API)"""
        try:
            nasa_api_key = os.getenv('NASA_API_KEY')
            if not nasa_api_key:
                logger.warning("NASA API key not provided")
                return None
            
            # NASA Landsat API
            url = "https://api.nasa.gov/planetary/earth/imagery"
            params = {
                'lat': latitude,
                'lon': longitude,
                'date': date,
                'api_key': nasa_api_key,
                'dim': 0.1  # 0.1 degree area
            }
            
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                filename = f"landsat_{latitude}_{longitude}_{date.replace('-', '')}.jpg"
                filepath = os.path.join(self.satellite_cache_dir, filename)
                
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                logger.info(f"Landsat image saved: {filepath}")
                return filepath
            
            logger.error(f"Landsat API request failed: {response.status_code}")
            return None
            
        except Exception as e:
            logger.error(f"Error fetching from Landsat: {str(e)}")
            return None
    
    def analyze_image(self, image_path: str, pollution_type: str = 'general') -> Dict[str, Any]:
        """Analyze satellite image for pollution detection"""
        try:
            # This is a simplified analysis
            # In a real implementation, you would use computer vision techniques
            
            # Load image
            image = Image.open(image_path)
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Get image properties
            width, height = image.size
            image_array = np.array(image)
            
            # Simple color analysis for different pollution types
            analysis_result = {
                'image_size': f"{width}x{height}",
                'pollution_type': pollution_type,
                'analysis_method': 'color_analysis',
                'confidence': 0.7,  # Placeholder
                'detected_pollution': self._detect_pollution_by_color(image_array, pollution_type),
                'timestamp': datetime.now().isoformat()
            }
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing image {image_path}: {str(e)}")
            return {
                'error': str(e),
                'pollution_type': pollution_type,
                'timestamp': datetime.now().isoformat()
            }
    
    def _detect_pollution_by_color(self, image_array: np.ndarray, pollution_type: str) -> Dict[str, Any]:
        """Simple color-based pollution detection"""
        # This is a simplified example
        # Real implementation would use more sophisticated computer vision
        
        # Calculate average RGB values
        avg_r = np.mean(image_array[:, :, 0])
        avg_g = np.mean(image_array[:, :, 1])
        avg_b = np.mean(image_array[:, :, 2])
        
        # Simple heuristics for different pollution types
        pollution_indicators = {
            'oil_spill': avg_r < 100 and avg_g < 100 and avg_b < 100,  # Dark areas
            'algae_bloom': avg_g > avg_r and avg_g > avg_b,  # Green dominance
            'sewage_discharge': avg_r > 150 and avg_g < 100 and avg_b < 100,  # Brownish
            'turbidity': avg_b > avg_r and avg_b > avg_g,  # Blue dominance
            'plastic_pollution': avg_r > 200 and avg_g > 200 and avg_b > 200  # Bright/white
        }
        
        detected = pollution_indicators.get(pollution_type, False)
        
        return {
            'detected': detected,
            'confidence': 0.6 if detected else 0.3,
            'color_analysis': {
                'avg_r': float(avg_r),
                'avg_g': float(avg_g),
                'avg_b': float(avg_b)
            }
        }
    
    def check_health(self) -> Dict[str, Any]:
        """Check satellite service health"""
        health_status = {
            'status': 'healthy',
            'google_earth_engine': self.ee_initialized,
            'sentinel_hub': bool(self.sentinel_hub_token),
            'nasa_landsat': bool(os.getenv('NASA_API_KEY')),
            'cache_directory': self.satellite_cache_dir,
            'timestamp': datetime.now().isoformat()
        }
        
        # Check if any service is available
        if not any([self.ee_initialized, self.sentinel_hub_token, os.getenv('NASA_API_KEY')]):
            health_status['status'] = 'unhealthy'
            health_status['error'] = 'No satellite data services configured'
        
        return health_status
