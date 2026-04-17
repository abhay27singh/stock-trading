package com.stocktrading.backend.service;

import com.stocktrading.backend.entity.Stock;
import com.stocktrading.backend.entity.User;
import com.stocktrading.backend.entity.Watchlist;
import com.stocktrading.backend.repository.StockRepository;
import com.stocktrading.backend.repository.UserRepository;
import com.stocktrading.backend.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;

    public List<Watchlist> getWatchlist(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return watchlistRepository.findByUser(user);
    }

    public String addToWatchlist(String email, String symbol) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Stock stock = stockRepository.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        if (watchlistRepository.findByUserAndStock(user, stock).isPresent()) {
            return "Stock already in watchlist!";
        }

        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        watchlist.setStock(stock);
        watchlistRepository.save(watchlist);
        return "Added " + symbol + " to watchlist!";
    }

    @Transactional
    public String removeFromWatchlist(String email, String symbol) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Stock stock = stockRepository.findBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
        watchlistRepository.deleteByUserAndStock(user, stock);
        return "Removed " + symbol + " from watchlist!";
    }
}