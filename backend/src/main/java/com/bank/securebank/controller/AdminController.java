package com.bank.securebank.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import com.bank.securebank.model.User;
import com.bank.securebank.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/kyc")
    public ResponseEntity<List<Map<String, Object>>> getKyc() {
        List<Map<String, Object>> kycApplications = new ArrayList<>();
        
        // Get all users from database
        List<User> users = userRepository.findAll();
        System.out.println("=== DEBUG: Total users found: " + users.size());
        
        for (User user : users) {
            System.out.println("=== DEBUG: User: " + user.getUsername());
            System.out.println("=== DEBUG: KYC Status: " + user.getKycStatus());
            System.out.println("=== DEBUG: Aadhaar: " + user.getAadhaarNumber());
            System.out.println("=== DEBUG: PAN: " + user.getPanNumber());
            System.out.println("=== DEBUG: Address: " + user.getAddress());
            
            Map<String, Object> kycData = new HashMap<>();
            kycData.put("id", user.getId());
            kycData.put("username", user.getUsername());
            kycData.put("fullName", user.getFullName() != null ? user.getFullName() : user.getUsername());
            kycData.put("email", user.getEmail() != null ? user.getEmail() : "Not Provided");
            kycData.put("aadhaarNumber", user.getAadhaarNumber() != null ? user.getAadhaarNumber() : "Not Provided");
            kycData.put("panNumber", user.getPanNumber() != null ? user.getPanNumber() : "Not Provided");
            kycData.put("address", user.getAddress() != null ? user.getAddress() : "Not Provided");
            kycData.put("phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "Not Provided");
            kycData.put("status", user.getKycStatus() != null ? user.getKycStatus() : "PENDING");
            
            kycApplications.add(kycData);
        }
        
        System.out.println("=== DEBUG: Returning " + kycApplications.size() + " KYC applications");
        return ResponseEntity.ok(kycApplications);
    }

    @GetMapping("/kyc/{id}")
    public ResponseEntity<Map<String, Object>> getKycById(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            Map<String, Object> kycData = new HashMap<>();
            kycData.put("id", user.getId());
            kycData.put("username", user.getUsername());
            kycData.put("fullName", user.getFullName());
            kycData.put("email", user.getEmail());
            kycData.put("aadhaarNumber", user.getAadhaarNumber());
            kycData.put("panNumber", user.getPanNumber());
            kycData.put("address", user.getAddress());
            kycData.put("phoneNumber", user.getPhoneNumber());
            kycData.put("status", user.getKycStatus() != null ? user.getKycStatus() : "PENDING");
            return ResponseEntity.ok(kycData);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/kyc/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveKyc(@PathVariable Long id, @RequestBody Map<String, String> reviewData) {
        try {
            System.out.println("Attempting to approve KYC for user ID: " + id);
            User user = userRepository.findById(id).orElse(null);
            if (user != null) {
                System.out.println("Found user: " + user.getUsername());
                user.setKycStatus("APPROVED");
                userRepository.save(user);
                System.out.println("Successfully updated KYC status to APPROVED");
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "KYC approved successfully");
                response.put("kycId", user.getId());
                response.put("username", user.getUsername());
                response.put("status", user.getKycStatus());
                response.put("reviewedBy", reviewData.get("reviewedBy"));
                
                return ResponseEntity.ok(response);
            }
            System.out.println("User not found with ID: " + id);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "User not found with ID: " + id,
                "kycId", id
            ));
        } catch (Exception e) {
            System.out.println("Error approving KYC: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error approving KYC: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/kyc/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectKyc(@PathVariable Long id, @RequestBody Map<String, String> rejectionData) {
        try {
            System.out.println("Attempting to reject KYC for user ID: " + id);
            User user = userRepository.findById(id).orElse(null);
            if (user != null) {
                System.out.println("Found user: " + user.getUsername());
                user.setKycStatus("REJECTED");
                userRepository.save(user);
                System.out.println("Successfully updated KYC status to REJECTED");
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "KYC rejected successfully");
                response.put("kycId", user.getId());
                response.put("username", user.getUsername());
                response.put("status", user.getKycStatus());
                response.put("reviewedBy", rejectionData.get("reviewedBy"));
                response.put("rejectionReason", rejectionData.get("reason"));
                
                return ResponseEntity.ok(response);
            }
            System.out.println("User not found with ID: " + id);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "User not found with ID: " + id,
                "kycId", id
            ));
        } catch (Exception e) {
            System.out.println("Error rejecting KYC: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error rejecting KYC: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        System.out.println("=== ADMIN DEBUG: getAllUsers endpoint called");
        
        // Get current authentication
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            System.out.println("=== ADMIN DEBUG: Authenticated user: " + auth.getName());
            System.out.println("=== ADMIN DEBUG: User authorities: " + auth.getAuthorities());
        } else {
            System.out.println("=== ADMIN DEBUG: No authentication found!");
        }
        
        List<User> users = userRepository.findAll();
        System.out.println("=== DEBUG: Users endpoint called, found " + users.size() + " users");
        for (User user : users) {
            System.out.println("=== DEBUG: User - ID: " + user.getId() + ", Username: " + user.getUsername() + ", Role: " + user.getRole());
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testDatabase() {
        System.out.println("=== ADMIN DEBUG: testDatabase endpoint called");
        
        // Get current authentication
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            System.out.println("=== ADMIN DEBUG: Authenticated user: " + auth.getName());
            System.out.println("=== ADMIN DEBUG: User authorities: " + auth.getAuthorities());
        } else {
            System.out.println("=== ADMIN DEBUG: No authentication found!");
        }
        
        Map<String, Object> response = new HashMap<>();
        List<User> users = userRepository.findAll();
        response.put("totalUsers", users.size());
        response.put("users", users.stream().map(u -> Map.of(
            "id", u.getId(),
            "username", u.getUsername(),
            "role", u.getRole(),
            "aadhaar", u.getAadhaarNumber(),
            "pan", u.getPanNumber(),
            "address", u.getAddress()
        )).toList());
        response.put("authenticatedUser", auth != null ? auth.getName() : "none");
        response.put("authorities", auth != null ? auth.getAuthorities().toString() : "none");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/checkbook-requests")
    public ResponseEntity<List<Map<String, Object>>> getCheckbookRequests() {
        List<Map<String, Object>> requests = new ArrayList<>();
        
        // Sample checkbook requests
        Map<String, Object> request1 = new HashMap<>();
        request1.put("id", 1L);
        request1.put("accountNumber", "XXXX-1234");
        request1.put("requestDate", "2024-01-15");
        request1.put("status", "PENDING");
        request1.put("username", "john_doe");
        
        Map<String, Object> request2 = new HashMap<>();
        request2.put("id", 2L);
        request2.put("accountNumber", "XXXX-5678");
        request2.put("requestDate", "2024-01-10");
        request2.put("status", "APPROVED");
        request2.put("username", "jane_smith");
        
        requests.add(request1);
        requests.add(request2);
        
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/loans")
    public ResponseEntity<List<Map<String, Object>>> getLoans() {
        List<Map<String, Object>> loans = new ArrayList<>();
        
        // Sample loan data
        Map<String, Object> loan1 = new HashMap<>();
        loan1.put("id", 1L);
        loan1.put("principal", 50000.0);
        loan1.put("interestRate", 8.5);
        loan1.put("tenureMonths", 24);
        loan1.put("status", "APPROVED");
        loan1.put("username", "john_doe");
        
        Map<String, Object> loan2 = new HashMap<>();
        loan2.put("id", 2L);
        loan2.put("principal", 75000.0);
        loan2.put("interestRate", 9.0);
        loan2.put("tenureMonths", 36);
        loan2.put("status", "PENDING");
        loan2.put("username", "jane_smith");
        
        loans.add(loan1);
        loans.add(loan2);
        
        return ResponseEntity.ok(loans);
    }
}