// AutoKYCService.java - Java Service for Auto-KYC Integration
package com.bank.securebank.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.*;
import java.io.IOException;

@Service
public class AutoKYCService {

    private final String AUTO_KYC_BASE_URL = "http://localhost:8000/api";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AutoKYCService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // Health check for Auto-KYC service
    public boolean isServiceHealthy() {
        try {
            String url = AUTO_KYC_BASE_URL + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            System.err.println("Auto-KYC service health check failed: " + e.getMessage());
            return false;
        }
    }

    // Upload document for verification
    public Map<String, Object> uploadDocument(MultipartFile file, String documentType) {
        try {
            String url = AUTO_KYC_BASE_URL + "/upload-document";
            
            // Prepare multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());
            body.add("document_type", documentType);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return objectMapper.readValue(response.getBody(), Map.class);
            } else {
                throw new RuntimeException("Document upload failed with status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("Document upload error: " + e.getMessage());
            return createErrorResponse("Document upload failed: " + e.getMessage());
        }
    }

    // Analyze uploaded document
    public Map<String, Object> analyzeDocument(String filePath) {
        try {
            String url = AUTO_KYC_BASE_URL + "/analyze-document";
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("file_path", filePath);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return objectMapper.readValue(response.getBody(), Map.class);
            } else {
                throw new RuntimeException("Document analysis failed");
            }
        } catch (Exception e) {
            System.err.println("Document analysis error: " + e.getMessage());
            return createErrorResponse("Document analysis failed: " + e.getMessage());
        }
    }

    // Perform face verification
    public Map<String, Object> verifyFace(MultipartFile faceImage, boolean livenessCheck) {
        try {
            String url = AUTO_KYC_BASE_URL + "/face-verification";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("face_image", faceImage.getResource());
            body.add("liveness_check", livenessCheck);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return objectMapper.readValue(response.getBody(), Map.class);
            } else {
                throw new RuntimeException("Face verification failed");
            }
        } catch (Exception e) {
            System.err.println("Face verification error: " + e.getMessage());
            return createErrorResponse("Face verification failed: " + e.getMessage());
        }
    }

    // Create liveness session
    public Map<String, Object> createLivenessSession(String deviceCorrelationId) {
        try {
            String url = AUTO_KYC_BASE_URL + "/face-liveness";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("livenessOperationMode", "Passive");
            requestBody.put("sendResultsToClient", true);
            requestBody.put("deviceCorrelationId", deviceCorrelationId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return objectMapper.readValue(response.getBody(), Map.class);
            } else {
                throw new RuntimeException("Liveness session creation failed");
            }
        } catch (Exception e) {
            System.err.println("Liveness session error: " + e.getMessage());
            return createErrorResponse("Liveness session creation failed: " + e.getMessage());
        }
    }

    // Get all customers
    public List<Map<String, Object>> getAllCustomers() {
        try {
            String url = AUTO_KYC_BASE_URL + "/customers";
            ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return (List<Map<String, Object>>) response.getBody();
            } else {
                throw new RuntimeException("Failed to get customers");
            }
        } catch (Exception e) {
            System.err.println("Get customers error: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // Get specific customer
    public Map<String, Object> getCustomer(String customerId) {
        try {
            String url = AUTO_KYC_BASE_URL + "/customer/" + customerId;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                throw new RuntimeException("Failed to get customer");
            }
        } catch (Exception e) {
            System.err.println("Get customer error: " + e.getMessage());
            return createErrorResponse("Failed to get customer: " + e.getMessage());
        }
    }

    // Update customer data
    public Map<String, Object> updateCustomer(Map<String, Object> customerData) {
        try {
            String url = AUTO_KYC_BASE_URL + "/update";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(customerData, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                throw new RuntimeException("Failed to update customer");
            }
        } catch (Exception e) {
            System.err.println("Update customer error: " + e.getMessage());
            return createErrorResponse("Failed to update customer: " + e.getMessage());
        }
    }

    // Get customer verification status
    public Map<String, Object> getCustomerStatus(String customerId) {
        try {
            String url = AUTO_KYC_BASE_URL + "/status/" + customerId;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                throw new RuntimeException("Failed to get customer status");
            }
        } catch (Exception e) {
            System.err.println("Get customer status error: " + e.getMessage());
            return createErrorResponse("Failed to get customer status: " + e.getMessage());
        }
    }

    // Get customer logs
    public Map<String, Object> getCustomerLogs(String customerId) {
        try {
            String url = AUTO_KYC_BASE_URL + "/logs/" + customerId;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                throw new RuntimeException("Failed to get customer logs");
            }
        } catch (Exception e) {
            System.err.println("Get customer logs error: " + e.getMessage());
            return createErrorResponse("Failed to get customer logs: " + e.getMessage());
        }
    }

    // Complete verification workflow
    public Map<String, Object> performCompleteVerification(
            MultipartFile documentFile, 
            String documentType, 
            String userId,
            MultipartFile faceImage) {
        
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        
        try {
            // Step 1: Upload document
            Map<String, Object> uploadResult = uploadDocument(documentFile, documentType);
            if (uploadResult.containsKey("success") && !(Boolean) uploadResult.get("success")) {
                errors.add("Document upload failed");
                result.put("upload_result", uploadResult);
            } else {
                result.put("upload_result", uploadResult);
                
                // Step 2: Analyze document
                String filePath = (String) ((Map<String, Object>) uploadResult.get("file_info")).get("path");
                Map<String, Object> analysisResult = analyzeDocument(filePath);
                result.put("analysis_result", analysisResult);
                
                // Step 3: Face verification (if face image provided)
                if (faceImage != null) {
                    Map<String, Object> faceResult = verifyFace(faceImage, true);
                    result.put("face_verification_result", faceResult);
                }
                
                // Step 4: Create liveness session
                Map<String, Object> livenessResult = createLivenessSession(userId);
                result.put("liveness_result", livenessResult);
                
                // Step 5: Determine overall status
                String overallStatus = determineOverallStatus(analysisResult, 
                    result.containsKey("face_verification_result") ? 
                    (Map<String, Object>) result.get("face_verification_result") : null);
                
                result.put("overall_status", overallStatus);
                result.put("success", true);
                result.put("timestamp", new Date().toString());
            }
            
        } catch (Exception e) {
            errors.add("Verification workflow failed: " + e.getMessage());
            result.put("success", false);
            result.put("errors", errors);
        }
        
        return result;
    }

    // Helper method to determine overall verification status
    private String determineOverallStatus(Map<String, Object> analysisResult, Map<String, Object> faceResult) {
        try {
            double analysisConfidence = 0.0;
            double faceConfidence = 0.0;
            
            if (analysisResult.containsKey("success") && (Boolean) analysisResult.get("success")) {
                Map<String, Object> analysis = (Map<String, Object>) analysisResult.get("analysis");
                if (analysis.containsKey("confidence")) {
                    analysisConfidence = (Double) analysis.get("confidence");
                }
            }
            
            if (faceResult != null && faceResult.containsKey("success") && (Boolean) faceResult.get("success")) {
                Map<String, Object> verificationResult = (Map<String, Object>) faceResult.get("verification_result");
                if (verificationResult.containsKey("confidence")) {
                    faceConfidence = (Double) verificationResult.get("confidence");
                }
            }
            
            if (analysisConfidence >= 0.9 && (faceResult == null || faceConfidence >= 0.9)) {
                return "VERIFIED";
            } else if (analysisConfidence >= 0.7 && (faceResult == null || faceConfidence >= 0.7)) {
                return "VERIFIED_WITH_NOTES";
            } else {
                return "VERIFICATION_FAILED";
            }
        } catch (Exception e) {
            return "VERIFICATION_FAILED";
        }
    }

    // Helper method to create error response
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", message);
        errorResponse.put("timestamp", new Date().toString());
        return errorResponse;
    }

    // Get service statistics
    public Map<String, Object> getServiceStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Check service health
            stats.put("service_healthy", isServiceHealthy());
            
            // Get customer count
            List<Map<String, Object>> customers = getAllCustomers();
            stats.put("total_customers", customers.size());
            
            // Calculate verification statistics
            long verifiedCount = customers.stream()
                .filter(c -> "verified".equals(c.get("status")) || "green".equals(c.get("status")))
                .count();
            
            long pendingCount = customers.stream()
                .filter(c -> "pending".equals(c.get("status")) || "yellow".equals(c.get("status")))
                .count();
            
            long failedCount = customers.stream()
                .filter(c -> "failed".equals(c.get("status")) || "red".equals(c.get("status")))
                .count();
            
            stats.put("verified_customers", verifiedCount);
            stats.put("pending_customers", pendingCount);
            stats.put("failed_customers", failedCount);
            
            return stats;
        } catch (Exception e) {
            return createErrorResponse("Failed to get service statistics: " + e.getMessage());
        }
    }
}
