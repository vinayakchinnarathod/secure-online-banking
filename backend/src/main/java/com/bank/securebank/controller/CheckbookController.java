package com.bank.securebank.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/checkbook")
@CrossOrigin(origins = "http://localhost:3000")
public class CheckbookController {

    @PostMapping("/request")
    public ResponseEntity<?> requestCheckbook(
            @RequestBody Map<String, String> body) {

        String username = body.get("username");

        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Username required");
        }

        return ResponseEntity.ok("Checkbook requested successfully for " + username);
    }
}