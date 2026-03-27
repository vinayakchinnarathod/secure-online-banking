import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration class"""
    
    # API Configuration
    API_HOST = os.getenv('API_HOST', 'localhost')
    API_PORT = int(os.getenv('API_PORT', 8000))
    API_BASE_URL = f"http://{API_HOST}:{API_PORT}"
    
    # Environment Configuration
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
    
    # Azure Configuration
    AZURE_FACE_API_KEY = os.getenv('AZURE_FACE_API_KEY', '')
    AZURE_FACE_ENDPOINT = os.getenv('AZURE_FACE_ENDPOINT', '')
    AZURE_OPENAI_KEY = os.getenv('AZURE_OPENAI_KEY', '')
    AZURE_OPENAI_ENDPOINT = os.getenv('AZURE_OPENAI_ENDPOINT', '')
    
    # Azure Storage Configuration
    AZURE_STORAGE_CONNECTION_STRING = os.getenv('AZURE_STORAGE_CONNECTION_STRING', '')
    AZURE_CONTAINER_NAME = os.getenv('AZURE_CONTAINER_NAME', 'kyc-documents')
    
    # Azure Cosmos DB Configuration
    AZURE_COSMOS_ENDPOINT = os.getenv('AZURE_COSMOS_ENDPOINT', '')
    AZURE_COSMOS_KEY = os.getenv('AZURE_COSMOS_KEY', '')
    AZURE_COSMOS_DATABASE = os.getenv('AZURE_COSMOS_DATABASE', 'kyc-database')
    AZURE_COSMOS_CONTAINER = os.getenv('AZURE_COSMOS_CONTAINER', 'customers')
    
    # File Upload Configuration
    MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', 16 * 1024 * 1024))  # 16MB
    ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf']
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'temp_imgs')
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'kyc_app.log')
    
    # CORS Configuration
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    @staticmethod
    def get_azure_config():
        """Get Azure configuration for services"""
        return {
            'face_api_key': Config.AZURE_FACE_API_KEY,
            'face_endpoint': Config.AZURE_FACE_ENDPOINT,
            'openai_key': Config.AZURE_OPENAI_KEY,
            'openai_endpoint': Config.AZURE_OPENAI_ENDPOINT,
            'storage_connection': Config.AZURE_STORAGE_CONNECTION_STRING,
            'container_name': Config.AZURE_CONTAINER_NAME,
            'cosmos_endpoint': Config.AZURE_COSMOS_ENDPOINT,
            'cosmos_key': Config.AZURE_COSMOS_KEY,
            'cosmos_database': Config.AZURE_COSMOS_DATABASE,
            'cosmos_container': Config.AZURE_COSMOS_CONTAINER
        }
    
    @staticmethod
    def is_azure_configured():
        """Check if Azure services are properly configured"""
        # For local development, always return True to use dummy services
        if Config.ENVIRONMENT == 'development':
            return True
        
        # For production, check actual Azure configuration
        required_vars = [
            Config.AZURE_FACE_API_KEY,
            Config.AZURE_FACE_ENDPOINT,
            Config.AZURE_OPENAI_KEY,
            Config.AZURE_OPENAI_ENDPOINT
        ]
        return all(var.strip() for var in required_vars)
    
    @staticmethod
    def get_file_config():
        """Get file upload configuration"""
        return {
            'max_size': Config.MAX_FILE_SIZE,
            'allowed_extensions': Config.ALLOWED_EXTENSIONS,
            'upload_folder': Config.UPLOAD_FOLDER}

# Development/Production environment detection
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')

if ENVIRONMENT == 'development':
    # Use dummy services for development
    print("🔧 Running in DEVELOPMENT mode - using dummy services")
else:
    # Use real Azure services for production
    print("🚀 Running in PRODUCTION mode - using Azure services")
    if not Config.is_azure_configured():
        print("⚠️  WARNING: Azure services not properly configured!")
