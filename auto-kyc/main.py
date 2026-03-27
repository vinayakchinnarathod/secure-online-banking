#!/usr/bin/env python3
"""
Auto-KYC Application Main Entry Point
AI-powered KYC verification system with Azure integration
"""

import uvicorn
import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

# Add code directory to Python path
sys.path.append('code')
sys.path.append('.')

from config import Config
from api_simple import app as api_app

# Create FastAPI application
app = FastAPI(
    title="Auto-KYC Verification System",
    description="AI-powered KYC verification with Azure services integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_app, prefix="/api")

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with API documentation"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Auto-KYC Verification System</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; color: #1976d2; }
            .api-link { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .api-link a { color: #1976d2; text-decoration: none; font-weight: bold; }
            .status { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Auto-KYC Verification System</h1>
                <p>AI-powered KYC verification with Azure services integration</p>
            </div>
            
            <div class="status">
                <h3>🚀 System Status</h3>
                <p>✅ API Server: Running</p>
                <p>✅ Environment: {Config.ENVIRONMENT}</p>
                <p>✅ Azure Services: {'Configured' if Config.is_azure_configured() else 'Using Dummy'}</p>
            </div>
            
            <div class="api-link">
                <h3>📚 API Documentation</h3>
                <p><a href="/docs" target="_blank">📖 Swagger UI Documentation</a></p>
                <p><a href="/redoc" target="_blank">📋 ReDoc Documentation</a></p>
            </div>
            
            <div class="api-link">
                <h3>🔗 API Endpoints</h3>
                <p><strong>Health Check:</strong> <a href="/api/health">GET /api/health</a></p>
                <p><strong>Upload Document:</strong> POST /api/upload-document</p>
                <p><strong>Face Verification:</strong> POST /api/face-verification</p>
                <p><strong>Document Analysis:</strong> POST /api/analyze-document</p>
                <p><strong>Customer Data:</strong> GET /api/customers</p>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "auto-kyc-api",
        "version": "1.0.0",
        "environment": Config.ENVIRONMENT,
        "azure_configured": Config.is_azure_configured(),
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "upload": "/api/upload-document",
            "face_verification": "/api/face-verification",
            "document_analysis": "/api/analyze-document"
        }
    }

if __name__ == "__main__":
    print("🚀 Starting Auto-KYC Verification System...")
    print("📍 Server: " + Config.API_BASE_URL)
    print("🔧 Environment: " + str(Config.ENVIRONMENT))
    print("🔐 Azure Services: " + ('Configured' if Config.is_azure_configured() else 'Using Dummy'))
    print("📚 API Docs: " + Config.API_BASE_URL + "/docs")
    
    # Create upload directory if it doesn't exist
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    
    # Run the application
    uvicorn.run(
        "main:app",
        host=Config.API_HOST,
        port=Config.API_PORT,
        reload=True if Config.ENVIRONMENT == 'development' else False,
        log_level=Config.LOG_LEVEL.lower()
    )
