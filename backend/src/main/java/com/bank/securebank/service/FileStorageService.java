package com.bank.securebank.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private Path fileStorageLocation;

    public FileStorageService() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file, String username, String documentType) {
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            // Check file type
            String contentType = file.getContentType();
            if (!isValidFileType(contentType)) {
                throw new RuntimeException("Invalid file type. Only images and PDFs are allowed.");
            }

            // Check file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                throw new RuntimeException("File size exceeds 5MB limit.");
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String newFilename = username + "_" + documentType + "_" + UUID.randomUUID() + fileExtension;

            // Create user-specific directory
            Path userDir = this.fileStorageLocation.resolve(username);
            Files.createDirectories(userDir);

            // Store file
            Path targetLocation = userDir.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return username + "/" + newFilename;

        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), ex);
        }
    }

    public byte[] getFileContent(String filePath) throws IOException {
        Path path = this.fileStorageLocation.resolve(filePath).normalize();
        return Files.readAllBytes(path);
    }

    public boolean fileExists(String filePath) {
        Path path = this.fileStorageLocation.resolve(filePath).normalize();
        return Files.exists(path);
    }

    private boolean isValidFileType(String contentType) {
        return contentType != null && (
            contentType.startsWith("image/") || 
            contentType.equals("application/pdf")
        );
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}
