package com.bank.securebank.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/loan")
@CrossOrigin(origins = "http://localhost:3000")
public class LoanController {

    private List<Map<String, Object>> loans = new ArrayList<>();

    @PostMapping("/apply")
    public ResponseEntity<?> applyLoan(@RequestBody Map<String, Object> body) {

        Map<String, Object> loan = new HashMap<>();
        loan.put("id", loans.size() + 1);
        loan.put("principal", body.get("principal"));
        loan.put("interestRate", body.get("interestRate"));
        loan.put("tenureMonths", body.get("tenureMonths"));
        loan.put("username", body.get("username"));
        loan.put("status", "PENDING");

        loans.add(loan);

        return ResponseEntity.ok(loan);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getLoans(@RequestParam String username) {

        List<Map<String, Object>> userLoans = new ArrayList<>();

        for (Map<String, Object> loan : loans) {
            if (loan.get("username").equals(username)) {
                userLoans.add(loan);
            }
        }

        return ResponseEntity.ok(userLoans);
    }
}