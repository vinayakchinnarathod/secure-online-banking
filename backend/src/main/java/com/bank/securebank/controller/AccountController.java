package com.bank.securebank.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
@CrossOrigin(origins = "http://localhost:3000")
public class AccountController {

    @GetMapping("/balance")
    public ResponseEntity<?> getAccountBalance(@RequestParam String username) {
        try {
            // Mock account balance data
            Map<String, Object> response = new HashMap<>();
            
            // Different balances for different users
            double balance = 25000.00; // Default balance
            
            if ("admin".equals(username)) {
                balance = 50000.00;
            } else if ("john_doe".equals(username)) {
                balance = 35000.00;
            } else if ("jane_smith".equals(username)) {
                balance = 28000.00;
            }
            
            response.put("balance", balance);
            response.put("accountNumber", "XXXX-XXXX-" + username.hashCode() % 10000);
            response.put("accountType", "Savings Account");
            response.put("currency", "INR");
            response.put("lastUpdated", "2024-03-01");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving account balance");
        }
    }

    @GetMapping("/details")
    public ResponseEntity<?> getAccountDetails(@RequestParam String username) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            response.put("username", username);
            response.put("fullName", "User " + username.substring(0, 1).toUpperCase() + username.substring(1));
            response.put("email", username + "@securebank.com");
            response.put("phone", "+91-9876543210");
            response.put("address", "123 Banking Street, Financial District, Mumbai - 400001");
            response.put("accountNumber", "XXXX-XXXX-" + username.hashCode() % 10000);
            response.put("ifscCode", "SBIN0001234");
            response.put("branch", "Main Branch, Mumbai");
            response.put("accountType", "Savings Account");
            response.put("status", "ACTIVE");
            response.put("kycStatus", "APPROVED");
            response.put("createdAt", "2023-01-15");
            response.put("lastUpdated", "2024-03-01");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving account details");
        }
    }
}
