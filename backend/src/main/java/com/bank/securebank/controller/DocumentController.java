package com.bank.securebank.controller;

import com.bank.securebank.model.Document;
import com.bank.securebank.repository.DocumentRepository;
import com.bank.securebank.service.FileStorageService;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("username") String username,
            @RequestParam("documentType") String documentType) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if document of this type already exists for this user
            List<Document> existingDocs = documentRepository
                .findByUsernameAndDocumentType(username, documentType.toUpperCase());
            
            if (!existingDocs.isEmpty()) {
                response.put("success", false);
                response.put("message", documentType + " document already uploaded. Please delete the existing one first.");
                return ResponseEntity.badRequest().body(response);
            }

            // Store file
            String filePath = fileStorageService.storeFile(file, username, documentType.toUpperCase());

            // Save document metadata
            Document document = new Document();
            document.setUsername(username);
            document.setDocumentType(documentType.toUpperCase());
            document.setFileName(file.getOriginalFilename());
            document.setFilePath(filePath);
            document.setContentType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setUploadStatus("UPLOADED");

            Document savedDocument = documentRepository.save(document);

            response.put("success", true);
            response.put("message", "Document uploaded successfully");
            response.put("document", savedDocument);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to upload document: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/user/{username}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Document>> getUserDocuments(@PathVariable String username) {
        List<Document> documents = documentRepository.findByUsername(username);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/download/{documentId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {
        try {
            Optional<Document> documentOpt = documentRepository.findById(documentId);
            if (!documentOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Document document = documentOpt.get();
            if (!fileStorageService.fileExists(document.getFilePath())) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileContent = fileStorageService.getFileContent(document.getFilePath());
            ByteArrayResource resource = new ByteArrayResource(fileContent);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(document.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/view/{documentId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Resource> viewDocument(@PathVariable Long documentId) {
        try {
            Optional<Document> documentOpt = documentRepository.findById(documentId);
            if (!documentOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Document document = documentOpt.get();
            if (!fileStorageService.fileExists(document.getFilePath())) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileContent = fileStorageService.getFileContent(document.getFilePath());
            ByteArrayResource resource = new ByteArrayResource(fileContent);

            // Set appropriate content type for inline display
            MediaType contentType;
            String fileName = document.getFileName().toLowerCase();
            
            if (fileName.endsWith(".pdf")) {
                contentType = MediaType.APPLICATION_PDF;
            } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                contentType = MediaType.IMAGE_JPEG;
            } else if (fileName.endsWith(".png")) {
                contentType = MediaType.IMAGE_PNG;
            } else if (fileName.endsWith(".gif")) {
                contentType = MediaType.IMAGE_GIF;
            } else {
                contentType = MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity.ok()
                    .contentType(contentType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getFileName() + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/verify/{documentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> verifyDocument(
            @PathVariable Long documentId,
            @RequestBody Map<String, String> verificationData) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Document> documentOpt = documentRepository.findById(documentId);
            if (!documentOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Document not found");
                return ResponseEntity.notFound().build();
            }

            Document document = documentOpt.get();
            String status = verificationData.get("status");
            String comments = verificationData.get("comments");

            document.setUploadStatus(status.toUpperCase());
            document.setVerificationComments(comments);
            documentRepository.save(document);

            response.put("success", true);
            response.put("message", "Document verification updated successfully");
            response.put("document", document);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to verify document: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Document>> getAllDocuments() {
        System.out.println("=== DOCUMENTS DEBUG: getAllDocuments endpoint called");
        
        // Get current authentication
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            System.out.println("=== DOCUMENTS DEBUG: Authenticated user: " + auth.getName());
            System.out.println("=== DOCUMENTS DEBUG: User authorities: " + auth.getAuthorities());
        } else {
            System.out.println("=== DOCUMENTS DEBUG: No authentication found!");
        }
        
        List<Document> documents = documentRepository.findAll();
        System.out.println("=== DOCUMENTS DEBUG: Found " + documents.size() + " documents");
        
        return ResponseEntity.ok(documents);
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> deleteDocument(@PathVariable Long documentId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Document> documentOpt = documentRepository.findById(documentId);
            if (!documentOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Document not found");
                return ResponseEntity.notFound().build();
            }

            Document document = documentOpt.get();
            
            // Delete file from storage
            try {
                Path filePath = Paths.get("uploads").resolve(document.getFilePath()).normalize();
                Files.deleteIfExists(filePath);
            } catch (Exception e) {
                // Continue even if file deletion fails
            }

            // Delete from database
            documentRepository.delete(document);

            response.put("success", true);
            response.put("message", "Document deleted successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete document: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/ai-verify")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> aiVerifyDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("username") String username) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if user is verifying their own documents
            String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
            if (!currentUser.equals(username)) {
                response.put("success", false);
                response.put("message", "You can only verify your own documents");
                return ResponseEntity.badRequest().body(response);
            }

            // Call Python AI service
            RestTemplate restTemplate = new RestTemplate();
            
            // Create proper multipart request
            LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Create ByteArrayResource for the file
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            
            body.add("file", fileResource);
            body.add("document_type", "auto");
            body.add("username", username); // Add username for validation
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            HttpEntity<LinkedMultiValueMap<String, Object>> requestEntity = 
                new HttpEntity<>(body, headers);
            
            // Call Python AI service
            String pythonServiceUrl = "http://localhost:8000/api/upload-document";
            ResponseEntity<Map> aiResponse = restTemplate.postForEntity(pythonServiceUrl, requestEntity, Map.class);
            
            if (aiResponse.getStatusCode().is2xxSuccessful() && aiResponse.getBody() != null) {
                Map<String, Object> aiResult = aiResponse.getBody();
                Boolean success = (Boolean) aiResult.get("success");
                
                if (success) {
                    // Get user's pending documents
                    List<Document> userDocuments = documentRepository.findByUsername(username);
                    
                    // Update all pending documents to verified
                    for (Document doc : userDocuments) {
                        if ("UPLOADED".equals(doc.getUploadStatus())) {
                            doc.setUploadStatus("VERIFIED");
                            String aiAnalysis = aiResult.get("analysis") != null ? aiResult.get("analysis").toString() : "Successfully processed by AI";
                            String fullComments = "AI Verified: " + aiAnalysis;
                            // Truncate to fit database column limit (255 characters)
                            String truncatedComments = fullComments.length() > 252 ? fullComments.substring(0, 252) + "..." : fullComments;
                            doc.setVerificationComments(truncatedComments);
                            documentRepository.save(doc);
                        }
                    }
                    
                    response.put("success", true);
                    response.put("message", "Document verified successfully by AI");
                    response.put("aiAnalysis", aiResult.get("analysis"));
                    
                    return ResponseEntity.ok(response);
                } else {
                    response.put("success", false);
                    response.put("message", "AI verification failed: " + aiResult.get("message"));
                    return ResponseEntity.badRequest().body(response);
                }
            } else {
                response.put("success", false);
                response.put("message", "AI service is not available");
                return ResponseEntity.status(503).body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "AI verification failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
