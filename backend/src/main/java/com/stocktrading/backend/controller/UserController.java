package com.stocktrading.backend.controller;

import com.stocktrading.backend.entity.User;
import com.stocktrading.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // Existing profile endpoint
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ NEW — Deposit funds
    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(
            Authentication authentication,
            @RequestBody Map<String, Double> body) {

        double amount = body.getOrDefault("amount", 0.0);

        if (amount <= 0) {
            return ResponseEntity.badRequest().body("Amount must be greater than 0");
        }
        if (amount > 1000000) {
            return ResponseEntity.badRequest().body("Maximum deposit is ₹10,00,000");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal newBalance = user.getBalance().add(BigDecimal.valueOf(amount));
        user.setBalance(newBalance);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "✅ ₹" + amount + " added successfully!",
                "newBalance", newBalance
        ));
    }
}