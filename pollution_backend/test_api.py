#!/usr/bin/env python3
"""
Test script for the pollution verification API
"""

import json
import time
import os

def test_health_endpoint():
    """Test the health endpoint"""
    print("Testing health endpoint...")
    try:
        import urllib.request
        import urllib.parse
        
        url = "http://localhost:5000/health"
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print("✅ Health check successful!")
            print(f"Status: {data['status']}")
            print(f"Service: {data['service']}")
            print(f"Version: {data['version']}")
            return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_verification_endpoint():
    """Test the verification endpoint"""
    print("\nTesting verification endpoint...")
    try:
        import urllib.request
        import urllib.parse
        
        # Test data
        test_data = {
            "report_id": 123,
            "latitude": 40.7128,
            "longitude": -74.0060,
            "date": "2025-01-20",
            "user_image_path": "./test_image.jpg"
        }
        
        # Create a dummy test image
        from PIL import Image
        img = Image.new('RGB', (224, 224), color=(100, 150, 200))
        img.save('./test_image.jpg')
        
        url = "http://localhost:5000/api/verify"
        data = json.dumps(test_data).encode('utf-8')
        
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            print("✅ Verification test successful!")
            print(f"Report ID: {result['report_id']}")
            print(f"Verified: {result['verified']}")
            print(f"Category: {result['category']}")
            print(f"User Confidence: {result['user_confidence']:.2f}")
            print(f"Satellite Confidence: {result['satellite_confidence']:.2f}")
            if 'reason' in result:
                print(f"Reason: {result['reason']}")
            return True
    except Exception as e:
        print(f"❌ Verification test failed: {e}")
        return False

def test_satellite_endpoint():
    """Test the satellite endpoint"""
    print("\nTesting satellite endpoint...")
    try:
        import urllib.request
        import urllib.parse
        
        test_data = {
            "latitude": 40.7128,
            "longitude": -74.0060,
            "date": "2025-01-20"
        }
        
        url = "http://localhost:5000/api/satellite/fetch"
        data = json.dumps(test_data).encode('utf-8')
        
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            print("✅ Satellite fetch test successful!")
            print(f"Success: {result['success']}")
            print(f"Image Path: {result['image_path']}")
            print(f"Coordinates: {result['latitude']}, {result['longitude']}")
            return True
    except Exception as e:
        print(f"❌ Satellite test failed: {e}")
        return False

def test_model_endpoint():
    """Test the model info endpoint"""
    print("\nTesting model info endpoint...")
    try:
        import urllib.request
        
        url = "http://localhost:5000/api/model/info"
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            print("✅ Model info test successful!")
            print(f"Model Loaded: {data['model_loaded']}")
            print(f"Class Names: {data['class_names']}")
            print(f"Version: {data['version']}")
            return True
    except Exception as e:
        print(f"❌ Model info test failed: {e}")
        return False

def test_classification_endpoint():
    """Test the classification endpoint"""
    print("\nTesting classification endpoint...")
    try:
        import urllib.request
        
        test_data = {
            "image_path": "./test_image.jpg"
        }
        
        url = "http://localhost:5000/api/model/classify"
        data = json.dumps(test_data).encode('utf-8')
        
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            print("✅ Classification test successful!")
            print(f"Success: {result['success']}")
            print(f"Predicted Category: {result['prediction']['category']}")
            print(f"Confidence: {result['prediction']['confidence']:.2f}")
            return True
    except Exception as e:
        print(f"❌ Classification test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Pollution Verification API Tests")
    print("=" * 50)
    
    # Wait for server to start
    print("Waiting for server to start...")
    time.sleep(5)
    
    tests = [
        test_health_endpoint,
        test_verification_endpoint,
        test_satellite_endpoint,
        test_model_endpoint,
        test_classification_endpoint
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        time.sleep(1)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The verification system is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the server logs for details.")
    
    # Clean up test image
    try:
        if os.path.exists('./test_image.jpg'):
            os.remove('./test_image.jpg')
    except:
        pass

if __name__ == '__main__':
    main()
