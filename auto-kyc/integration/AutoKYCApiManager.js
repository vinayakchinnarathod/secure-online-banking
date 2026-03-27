// AutoKYCApiManager.js - API Connection Manager for Secure Banking Portal
import axios from 'axios';

class AutoKYCApiManager {
  constructor() {
    this.baseURL = 'http://localhost:8000/api';
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`🚀 Auto-KYC API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Auto-KYC API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ Auto-KYC API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Auto-KYC API Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // Health Check
  async healthCheck() {
    try {
      const response = await this.axiosInstance.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  // Document Upload
  async uploadDocument(file, documentType = 'id_card') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);

      const response = await this.axiosInstance.post('/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Document upload failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Document Analysis
  async analyzeDocument(filePath) {
    try {
      const response = await this.axiosInstance.post('/analyze-document', {
        file_path: filePath,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Document analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Face Verification
  async verifyFace(faceImage, livenessCheck = true) {
    try {
      const formData = new FormData();
      formData.append('face_image', faceImage);
      formData.append('liveness_check', livenessCheck);

      const response = await this.axiosInstance.post('/face-verification', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Face verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Liveness Session
  async createLivenessSession(deviceCorrelationId) {
    try {
      const response = await this.axiosInstance.post('/face-liveness', {
        livenessOperationMode: 'Passive',
        sendResultsToClient: true,
        deviceCorrelationId: deviceCorrelationId,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Liveness session creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Customer Data
  async getCustomers() {
    try {
      const response = await this.axiosInstance.get('/customers');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customers: ${error.response?.data?.message || error.message}`);
    }
  }

  async getCustomer(customerId) {
    try {
      const response = await this.axiosInstance.get(`/customer/${customerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customer: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateCustomer(customerData) {
    try {
      const response = await this.axiosInstance.post('/update', customerData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update customer: ${error.response?.data?.message || error.message}`);
    }
  }

  // Status and Logs
  async getCustomerStatus(customerId) {
    try {
      const response = await this.axiosInstance.get(`/status/${customerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customer status: ${error.response?.data?.message || error.message}`);
    }
  }

  async getCustomerLogs(customerId) {
    try {
      const response = await this.axiosInstance.get(`/logs/${customerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customer logs: ${error.response?.data?.message || error.message}`);
    }
  }

  // Batch Operations
  async uploadMultipleFiles(files, documentTypes = []) {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      const response = await this.axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Multiple file upload failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Advanced Analysis
  async performAdvancedAnalysis(customerId, idDocument, idDocumentName) {
    try {
      const response = await this.axiosInstance.post('/analyze', {
        customer_id: customerId,
        id_document: idDocument,
        id_document_name: idDocumentName,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Advanced analysis failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Verification Status Check
  async checkVerificationStatus(customerId) {
    try {
      const [status, logs] = await Promise.all([
        this.getCustomerStatus(customerId),
        this.getCustomerLogs(customerId)
      ]);
      return { status, logs };
    } catch (error) {
      throw new Error(`Verification status check failed: ${error.message}`);
    }
  }

  // Complete Verification Flow
  async performCompleteVerification(file, documentType, userId) {
    try {
      console.log('🚀 Starting Complete Auto-KYC Verification Flow');

      // Step 1: Upload Document
      console.log('📄 Step 1: Uploading document...');
      const uploadResult = await this.uploadDocument(file, documentType);

      // Step 2: Analyze Document
      console.log('🔍 Step 2: Analyzing document...');
      const analysisResult = await this.analyzeDocument(uploadResult.file_info.path);

      // Step 3: Face Verification (if applicable)
      let faceResult = null;
      if (documentType === 'id_card' || documentType === 'passport') {
        console.log('📸 Step 3: Performing face verification...');
        faceResult = await this.verifyFace(file, true);
      }

      // Step 4: Create Liveness Session
      console.log('🔍 Step 4: Creating liveness session...');
      const livenessResult = await this.createLivenessSession(userId);

      // Step 5: Update Customer Status
      console.log('📝 Step 5: Updating customer status...');
      const customerData = {
        id: userId,
        verification_status: 'completed',
        verification_date: new Date().toISOString(),
        document_type: documentType,
        analysis_result: analysisResult,
        face_verification_result: faceResult,
        liveness_session: livenessResult,
      };

      await this.updateCustomer(customerData);

      console.log('✅ Complete verification flow finished successfully');

      return {
        success: true,
        upload_result: uploadResult,
        analysis_result: analysisResult,
        face_verification_result: faceResult,
        liveness_result: livenessResult,
        customer_data: customerData,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('❌ Complete verification flow failed:', error);
      throw error;
    }
  }

  // Service Status
  async getServiceStatus() {
    try {
      const health = await this.healthCheck();
      return {
        status: 'healthy',
        auto_kyc_service: health,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Create singleton instance
const autoKYCApi = new AutoKYCApiManager();

export default autoKYCApi;
