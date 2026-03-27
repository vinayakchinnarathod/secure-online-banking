#!/usr/bin/env python3
"""
API Test Script for Auto-KYC Backend
Tests all API endpoints to ensure they're working properly
"""

import requests
import json
import time
from datetime import datetime

# API Base URL
BASE_URL = "http://localhost:8000/api"

def test_endpoint(method, endpoint, data=None, files=None):
    """Test a single API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            if files:
                response = requests.post(url, files=files, timeout=5)
            else:
                response = requests.post(url, json=data, timeout=5)
        
        print(f"✅ {method} {endpoint} - Status: {response.status_code}")
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"   Response: {json.dumps(result, indent=2)[:200]}...")
            except:
                print(f"   Response: {response.text[:200]}...")
        else:
            print(f"   Error: {response.text[:200]}...")
        
        return response.status_code == 200
        
    except requests.exceptions.RequestException as e:
        print(f"❌ {method} {endpoint} - Error: {str(e)}")
        return False

def main():
    """Test all API endpoints"""
    print("🔍 Testing Auto-KYC API Endpoints")
    print("=" * 50)
    
    # Test results
    results = []
    
    # 1. Health Check
    print("\n📊 Health Check:")
    results.append(test_endpoint("GET", "/health"))
    
    # 2. Root Endpoint
    print("\n🏠 Root Endpoint:")
    results.append(test_endpoint("GET", "/"))
    
    # 3. Customer APIs
    print("\n👥 Customer APIs:")
    results.append(test_endpoint("GET", "/customers"))
    results.append(test_endpoint("GET", "/customer/1"))
    
    # 4. Document Upload (without actual file)
    print("\n📄 Document APIs:")
    test_data = {"file_path": "test.jpg"}
    results.append(test_endpoint("POST", "/analyze-document", test_data))
    
    # 5. Face Verification (without actual image)
    print("\n📸 Face Verification APIs:")
    liveness_data = {
        "livenessOperationMode": "Passive",
        "sendResultsToClient": True,
        "deviceCorrelationId": "test_device"
    }
    results.append(test_endpoint("POST", "/face-liveness", liveness_data))
    
    # 6. Status and Logs
    print("\n📋 Status APIs:")
    results.append(test_endpoint("GET", "/status/1"))
    results.append(test_endpoint("GET", "/logs/1"))
    
    # 7. Liveness Detection
    print("\n🔍 Liveness Detection:")
    results.append(test_endpoint("POST", "/detectLiveness"))
    results.append(test_endpoint("POST", "/livenessComplete"))
    
    # 8. Update Customer
    print("\n✏️ Update Customer:")
    customer_data = {"first_name": "Test", "last_name": "User"}
    results.append(test_endpoint("POST", "/update", customer_data))
    
    # 9. File Upload (without actual files)
    print("\n📁 File Upload:")
    results.append(test_endpoint("POST", "/upload"))
    
    # 10. Document Analysis
    print("\n🔬 Document Analysis:")
    analysis_data = {
        "customer_id": "1",
        "id_document": "base64_encoded_image_data",
        "id_document_name": "test.jpg"
    }
    results.append(test_endpoint("POST", "/analyze", analysis_data))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("🎉 ALL API ENDPOINTS ARE WORKING!")
    else:
        print("⚠️  Some endpoints failed. Check the output above.")
    
    print(f"\n🌐 API Documentation: http://localhost:8000/docs")
    print(f"🌐 Frontend: http://localhost:3000")

if __name__ == "__main__":
    main()
