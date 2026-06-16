package com.stocktrading.backend.service;

import com.stocktrading.backend.dto.AuthRequest;
import com.stocktrading.backend.dto.AuthResponse;
import com.stocktrading.backend.dto.RegisterRequest;
import com.stocktrading.backend.entity.User;
import com.stocktrading.backend.repository.UserRepository;
import com.stocktrading.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // ✅ REGISTER
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setBalance(BigDecimal.valueOf(100000)); // ✅ FIXED: ₹1,00,000 starting balance

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getBalance().doubleValue()
        );
    }

    // ✅ LOGIN
    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            // ✅ FIXED: using Spring MVC exception, not WebFlux
            throw new RuntimeException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail());

        // ✅ Safe null check on balance
        double balance = user.getBalance() == null
                ? 0.0
                : user.getBalance().doubleValue();

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getName(),
                user.getRole(),
                balance
        );
    }
}