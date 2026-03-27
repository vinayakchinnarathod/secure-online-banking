package com.bank.securebank.repository;

import com.bank.securebank.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    List<Document> findByUsername(String username);
    
    List<Document> findByUsernameAndDocumentType(String username, String documentType);
    
    Optional<Document> findByUsernameAndDocumentTypeAndUploadStatus(String username, String documentType, String uploadStatus);
    
    List<Document> findByUploadStatus(String uploadStatus);
    
    List<Document> findByDocumentType(String documentType);
}
