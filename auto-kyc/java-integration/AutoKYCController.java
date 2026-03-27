// AutoKYCController.java - Java Controller for Auto-KYC Integration
package com.bank.securebank.controller;

import com.bank.securebank.service.AutoKYCService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/autokyc")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AutoKYCController {

    @Autowired
    private AutoKYCService autoKYCService;

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("service_healthy", autoKYCService.isServiceHealthy());
        response.put("timestamp", new java.util.Date().toString());
        return ResponseEntity.ok(response);
    }

    // Upload document for verification
    @PostMapping("/upload-document")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("document_type") String documentType) {
        
        try {
            System.out.println("=== AUTO-KYC DOCUMENT UPLOAD REQUEST ===");
            System.out.println("File: " + file.getOriginalFilename());
            System.out.println("Size: " + file.getSize() + " bytes");
            System.out.println("Document Type: " + documentType);
            
            Map<String, Object> result = autoKYCService.uploadDocument(file, documentType);
            
            System.out.println("=== AUTO-KYC DOCUMENT UPLOAD COMPLETED ===");
            System.out.println("Success: " + result.get("success"));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("=== AUTO-KYC DOCUMENT UPLOAD ERROR ===");
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Document upload failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Analyze document
    @PostMapping("/analyze-document")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analyzeDocument(@RequestBody Map<String, String> request) {
        try {
            String filePath = request.get("file_path");
            
            System.out.println("=== AUTO-KYC DOCUMENT ANALYSIS REQUEST ===");
            System.out.println("File Path: " + filePath);
            
            Map<String, Object> result = autoKYCService.analyzeDocument(filePath);
            
            System.out.println("=== AUTO-KYC DOCUMENT ANALYSIS COMPLETED ===");
            System.out.println("Success: " + result.get("success"));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("=== AUTO-KYC DOCUMENT ANALYSIS ERROR ===");
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Document analysis failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Face verification
    @PostMapping("/face-verification")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> verifyFace(
            @RequestParam("face_image") MultipartFile faceImage,
            @RequestParam(value = "liveness_check", defaultValue = "true") boolean livenessCheck) {
        
        try {
            System.out.println("=== AUTO-KYC FACE VERIFICATION REQUEST ===");
            System.out.println("Face Image: " + faceImage.getOriginalFilename());
            System.out.println("Liveness Check: " + livenessCheck);
            
            Map<String, Object> result = autoKYCService.verifyFace(faceImage, livenessCheck);
            
            System.out.println("=== AUTO-KYC FACE VERIFICATION COMPLETED ===");
            System.out.println("Success: " + result.get("success"));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("=== AUTO-KYC FACE VERIFICATION ERROR ===");
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Face verification failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Create liveness session
    @PostMapping("/liveness-session")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> createLivenessSession(@RequestBody Map<String, Object> request) {
        try {
            String deviceCorrelationId = (String) request.get("deviceCorrelationId");
            
            System.out.println("=== AUTO-KYC LIVENESS SESSION REQUEST ===");
            System.out.println("Device Correlation ID: " + deviceCorrelationId);
            
            Map<String, Object> result = autoKYCService.createLivenessSession(deviceCorrelationId);
            
            System.out.println("=== AUTO-KYC LIVENESS SESSION COMPLETED ===");
            System.out.println("Success: " + result.get("success"));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("=== AUTO-KYC LIVENESS SESSION ERROR ===");
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Liveness session creation failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Complete verification workflow
    @PostMapping("/complete-verification")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> performCompleteVerification(
            @RequestParam("document_file") MultipartFile documentFile,
            @RequestParam("document_type") String documentType,
            @RequestParam("user_id") String userId,
            @RequestParam(value = "face_image", required = false) MultipartFile faceImage) {
        
        try {
            System.out.println("=== AUTO-KYC COMPLETE VERIFICATION REQUEST ===");
            System.out.println("User ID: " + userId);
            System.out.println("Document: " + documentFile.getOriginalFilename());
            System.out.println("Document Type: " + documentType);
            System.out.println("Face Image: " + (faceImage != null ? faceImage.getOriginalFilename() : "Not provided"));
            
            Map<String, Object> result = autoKYCService.performCompleteVerification(
                documentFile, documentType, userId, faceImage);
            
            System.out.println("=== AUTO-KYC COMPLETE VERIFICATION COMPLETED ===");
            System.out.println("Success: " + result.get("success"));
            System.out.println("Overall Status: " + result.get("overall_status"));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("=== AUTO-KYC COMPLETE VERIFICATION ERROR ===");
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Complete verification failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get all customers
    @GetMapping("/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllCustomers() {
        try {
            System.out.println("=== AUTO-KYC GET ALL CUSTOMERS REQUEST ===");
            
            List<Map<String, Object>> customers = autoKYCService.getAllCustomers();
            
            System.out.println("=== AUTO-KYC GET ALL CUSTOMERS COMPLETED ===");
            System.out.println("Customers Count: " + customers.size());
            
            return ResponseEntity.ok(customers);
            
        } catch (Exception e) {
            System.err.println("=== AUTO-KYC GET ALL CUSTOMERS ERROR ===");
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Get specific customer
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getCustomer(@PathVariable String customerId) {
        try {
            System.out.println("=== AUTO-KYC GET CUSTOMER REQUEST ===");
            System.out.println("Customer ID: " + customerId);
            
            Map<String, Object> customer = autoKYCService.getCustomer(customerId);
            
            System.out.println("=== AUTO-KYC GET CUSTOMER COMPLETED ===");
            
            return ResponseEntity.ok(customer);
            
        } catch (Exception e) {
            System.err.println("=== AUTO-KYC GET CUSTOMER ERROR ===");
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to get customer: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Update customer
    @PostMapping("/update-customer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateCustomer(@RequestBody Map<String, Object> customerData) {
        try {
            System.out.println("=== AUTO-KYC UPDATE CUSTOMER REQUEST ===");
            System.out.println("Customer Data: " + customerData);
            
            Map<String, Object> result = autoKYCService.updateCustomer(customerData);
            
            System.out.println("=== AUTO-KYC UPDATE CUSTOMER COMPLETED ===");
            System.out.println("Success: " + result.get("success"));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("=== AUTO-KYC UPDATE CUSTOMER ERROR ===");
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update customer: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get customer verification status
    @GetMapping("/customer/{customerId}/status")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getCustomerStatus(@PathVariable String customerId) {
        try {
            System.out.println("=== AUTO-KYC GET CUSTOMER STATUS REQUEST ===");
            System.out.println("Customer ID: " + customerId);
            
            Map<String, Object> status = autoKYCService.getCustomerStatus(customerId);
            
            System.out.println("=== AUTO-KYC GET CUSTOMER STATUS COMPLETED ===");
            System.out.println("Status: " + status.get("status"));
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            System.err.println("=== AUTO-KYC GET CUSTOMER STATUS ERROR ===");
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to get customer status: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get customer logs
    @GetMapping("/customer/{customerId}/logs")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getCustomerLogs(@PathVariable String customerId) {
        try {
            System.out.println("=== AUTO-KYC GET CUSTOMER LOGS REQUEST ===");
            System.out.println("Customer ID: " + customerId);
            
            Map<String, Object> logs = autoKYCService.getCustomerLogs(customerId);
            
            System.out.println("=== AUTO-KYC GET CUSTOMER LOGS COMPLETED ===");
            
            return ResponseEntity.ok(logs);
            
        } catch (Exception e) {
            System.err.println("=== AUTO-KYC GET CUSTOMER LOGS ERROR ===");
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to get customer logs: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get service statistics
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getServiceStatistics() {
        try {
            System.out.println("=== AUTO-KYC GET SERVICE STATISTICS REQUEST ===");
            
            Map<String, Object> stats = autoKYCService.getServiceStatistics();
            
            System.out.println("=== AUTO-KYC GET SERVICE STATISTICS COMPLETED ===");
            System.out.println("Service Healthy: " + stats.get("service_healthy"));
            System.out.println("Total Customers: " + stats.get("total_customers"));
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            System.err.println("=== AUTO-KYC GET SERVICE STATISTICS ERROR ===");
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to get service statistics: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Test endpoint for integration testing
    @GetMapping("/test-integration")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> testIntegration() {
        Map<String, Object> response = new java.util.HashMap<>();
        
        try {
            response.put("java_backend", "running");
            response.put("auto_kyc_service", autoKYCService.isServiceHealthy() ? "connected" : "disconnected");
            response.put("integration_status", "functional");
            response.put("timestamp", new java.util.Date().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("integration_status", "error");
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
