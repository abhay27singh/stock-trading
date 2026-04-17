package com.stocktrading.backend.controller;

import com.stocktrading.backend.entity.Stock;
import com.stocktrading.backend.entity.Transaction;
import com.stocktrading.backend.entity.User;
import com.stocktrading.backend.repository.PortfolioRepository;
import com.stocktrading.backend.repository.StockRepository;
import com.stocktrading.backend.repository.TransactionRepository;
import com.stocktrading.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final TransactionRepository transactionRepository;
    private final PortfolioRepository portfolioRepository;

    // ========== STATISTICS ==========

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        List<User> users = userRepository.findAll();
        List<Transaction> transactions = transactionRepository.findAll();
        List<Stock> stocks = stockRepository.findAll();

        stats.put("totalUsers", users.size());
        stats.put("totalStocks", stocks.size());
        stats.put("totalTransactions", transactions.size());

        // Total trading volume
        BigDecimal totalVolume = transactions.stream()
                .map(Transaction::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalVolume", totalVolume);

        // Buy vs Sell counts
        long buyCount = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.BUY).count();
        long sellCount = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.SELL).count();
        stats.put("buyCount", buyCount);
        stats.put("sellCount", sellCount);

        // Total balance across all users
        BigDecimal totalBalance = users.stream()
                .map(User::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalUserBalance", totalBalance);

        // Most traded stock
        Map<String, Long> stockTradeCount = new HashMap<>();
        for (Transaction t : transactions) {
            if (t.getStock() != null) {
                String symbol = t.getStock().getSymbol();
                stockTradeCount.merge(symbol, 1L, Long::sum);
            }
        }
        String mostTraded = stockTradeCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
        stats.put("mostTradedStock", mostTraded);

        return ResponseEntity.ok(stats);
    }

    // ========== USERS ==========

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (User user : users) {
            Map<String, Object> userMap = new LinkedHashMap<>();
            userMap.put("id", user.getId());
            userMap.put("name", user.getName());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole());
            userMap.put("balance", user.getBalance());
            userMap.put("createdAt", user.getCreatedAt());

            int portfolioCount = portfolioRepository.findByUser(user).size();
            userMap.put("portfolioCount", portfolioCount);

            result.add(userMap);
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.badRequest().body("Cannot delete an admin user");
        }

        // Delete user's portfolios, transactions, watchlist (cascade handles it)
        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "User " + user.getName() + " deleted successfully"));
    }

    // ========== TRADES ==========

    @GetMapping("/trades")
    public ResponseEntity<List<Transaction>> getAllTrades() {
        List<Transaction> transactions = transactionRepository.findAll();
        transactions.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return ResponseEntity.ok(transactions);
    }

    // ========== STOCKS MANAGEMENT ==========

    @GetMapping("/stocks")
    public ResponseEntity<List<Stock>> getAllStocks() {
        return ResponseEntity.ok(stockRepository.findAll());
    }

    @PostMapping("/stocks")
    public ResponseEntity<?> addStock(@RequestBody Map<String, Object> body) {
        String symbol = (String) body.get("symbol");
        String companyName = (String) body.get("companyName");
        double price = ((Number) body.get("currentPrice")).doubleValue();

        if (symbol == null || companyName == null || price <= 0) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        if (stockRepository.findBySymbol(symbol).isPresent()) {
            return ResponseEntity.badRequest().body("Stock symbol already exists");
        }

        Stock stock = new Stock();
        stock.setSymbol(symbol);
        stock.setCompanyName(companyName);
        stock.setCurrentPrice(BigDecimal.valueOf(price));
        stock.setPreviousPrice(BigDecimal.valueOf(price));
        stock.setChangePercent(BigDecimal.ZERO);
        stockRepository.save(stock);

        return ResponseEntity.ok(stock);
    }

    @PutMapping("/stocks/{id}")
    public ResponseEntity<?> updateStock(@PathVariable Long id,
                                          @RequestBody Map<String, Object> body) {
        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        if (body.containsKey("companyName")) {
            stock.setCompanyName((String) body.get("companyName"));
        }
        if (body.containsKey("currentPrice")) {
            double price = ((Number) body.get("currentPrice")).doubleValue();
            stock.setPreviousPrice(stock.getCurrentPrice());
            stock.setCurrentPrice(BigDecimal.valueOf(price));
        }
        stockRepository.save(stock);
        return ResponseEntity.ok(stock);
    }

    @DeleteMapping("/stocks/{id}")
    public ResponseEntity<?> deleteStock(@PathVariable Long id) {
        if (!stockRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("Stock not found");
        }
        stockRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Stock deleted successfully"));
    }
}
