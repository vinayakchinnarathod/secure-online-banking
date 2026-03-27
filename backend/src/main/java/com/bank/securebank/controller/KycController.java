package com.bank.securebank.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;
import com.bank.securebank.model.User;
import com.bank.securebank.repository.UserRepository;

@RestController
@RequestMapping("/api/kyc")
@CrossOrigin(origins = "http://localhost:3000")
public class KycController {

    private final UserRepository userRepository;

    public KycController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/submit")
    public String submitKyc(@RequestBody User kycRequest) {
        try {
            // Find the user by username from the request
            User user = userRepository.findByUsername(kycRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update user's KYC information
            user.setAadhaarNumber(kycRequest.getAadhaarNumber());
            user.setPanNumber(kycRequest.getPanNumber());
            user.setAddress(kycRequest.getAddress());
            user.setPhoneNumber(kycRequest.getPhoneNumber());
            user.setEmail(kycRequest.getEmail());
            user.setFullName(kycRequest.getFullName());
            user.setKycStatus("SUBMITTED");

            userRepository.save(user);
            return "KYC submitted successfully! Pending admin approval.";

        } catch (Exception e) {
            return "Error submitting KYC: " + e.getMessage();
        }
    }

    @GetMapping("/status")
    public Map<String, Object> getKycStatus(@RequestParam String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Return user KYC status and information
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("status", user.getKycStatus() != null ? user.getKycStatus() : "PENDING");
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("aadhaarNumber", user.getAadhaarNumber());
        response.put("panNumber", user.getPanNumber());
        response.put("address", user.getAddress());
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("username", user.getUsername());
        
        return response;
    }
}