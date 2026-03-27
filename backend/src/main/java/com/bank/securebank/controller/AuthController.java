package com.bank.securebank.controller;

import com.bank.securebank.model.User;
import com.bank.securebank.service.AuthService;
import com.bank.securebank.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody User user) {
        // Check if user already exists
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return Map.of("error", "Username already exists!");
        }
        
        // Set default values for KYC status
        user.setKycStatus("PENDING");
        
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        
        // Save user with KYC information
        userRepository.save(user);
        
        return Map.of(
            "message", "User registered successfully! Your KYC information has been submitted for review.",
            "success", "true"
        );
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User user) {
        return authService.login(user);
    }
}