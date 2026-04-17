package com.stocktrading.backend.controller;

import com.stocktrading.backend.dto.TradeRequest;
import com.stocktrading.backend.entity.Portfolio;
import com.stocktrading.backend.entity.Transaction;
import com.stocktrading.backend.service.TradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/trade")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    @PostMapping("/execute")
    public ResponseEntity<String> executeTrade(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody TradeRequest request) {
        return ResponseEntity.ok(
                tradeService.executeTrade(
                        userDetails.getUsername(), request));
    }

    @GetMapping("/portfolio")
    public ResponseEntity<List<Portfolio>> getPortfolio(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                tradeService.getPortfolio(userDetails.getUsername()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Transaction>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                tradeService.getTransactionHistory(
                        userDetails.getUsername()));
    }
}