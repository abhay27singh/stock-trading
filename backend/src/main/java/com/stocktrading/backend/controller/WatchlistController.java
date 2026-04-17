package com.stocktrading.backend.controller;

import com.stocktrading.backend.entity.Watchlist;
import com.stocktrading.backend.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    public ResponseEntity<List<Watchlist>> getWatchlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                watchlistService.getWatchlist(userDetails.getUsername()));
    }

    @PostMapping("/add/{symbol}")
    public ResponseEntity<String> addToWatchlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String symbol) {
        return ResponseEntity.ok(
                watchlistService.addToWatchlist(
                        userDetails.getUsername(), symbol));
    }

    @DeleteMapping("/remove/{symbol}")
    public ResponseEntity<String> removeFromWatchlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String symbol) {
        return ResponseEntity.ok(
                watchlistService.removeFromWatchlist(
                        userDetails.getUsername(), symbol));
    }
}