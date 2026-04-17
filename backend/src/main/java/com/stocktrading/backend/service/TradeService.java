package com.stocktrading.backend.service;

import com.stocktrading.backend.dto.TradeRequest;
import com.stocktrading.backend.entity.*;
import com.stocktrading.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TradeService {

    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final PortfolioRepository portfolioRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public String executeTrade(String email, TradeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Stock stock = stockRepository.findBySymbol(request.getSymbol())
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        if (request.getType().equalsIgnoreCase("BUY")) {
            return buyStock(user, stock, request.getQuantity());
        } else if (request.getType().equalsIgnoreCase("SELL")) {
            return sellStock(user, stock, request.getQuantity());
        }
        throw new RuntimeException("Invalid trade type");
    }

    private String buyStock(User user, Stock stock, Integer quantity) {
        BigDecimal totalCost = stock.getCurrentPrice()
                .multiply(BigDecimal.valueOf(quantity));

        if (user.getBalance().compareTo(totalCost) < 0) {
            throw new RuntimeException("Insufficient balance!");
        }

        user.setBalance(user.getBalance().subtract(totalCost));
        userRepository.save(user);

        Portfolio portfolio = portfolioRepository
                .findByUserAndStock(user, stock)
                .orElse(new Portfolio());

        if (portfolio.getId() == null) {
            portfolio.setUser(user);
            portfolio.setStock(stock);
            portfolio.setQuantity(0);
            portfolio.setAvgBuyPrice(BigDecimal.ZERO);
        }

        BigDecimal totalExisting = portfolio.getAvgBuyPrice()
                .multiply(BigDecimal.valueOf(portfolio.getQuantity()));
        int newQuantity = portfolio.getQuantity() + quantity;
        BigDecimal newAvg = totalExisting.add(totalCost)
                .divide(BigDecimal.valueOf(newQuantity),
                        2, BigDecimal.ROUND_HALF_UP);

        portfolio.setQuantity(newQuantity);
        portfolio.setAvgBuyPrice(newAvg);
        portfolioRepository.save(portfolio);

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setStock(stock);
        transaction.setType(Transaction.TransactionType.BUY);
        transaction.setQuantity(quantity);
        transaction.setPrice(stock.getCurrentPrice());
        transaction.setTotal(totalCost);
        transactionRepository.save(transaction);

        return "Successfully bought " + quantity + " shares of "
                + stock.getSymbol();
    }

    private String sellStock(User user, Stock stock, Integer quantity) {
        Portfolio portfolio = portfolioRepository
                .findByUserAndStock(user, stock)
                .orElseThrow(() -> new RuntimeException(
                        "You don't own this stock!"));

        if (portfolio.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient shares!");
        }

        BigDecimal totalEarnings = stock.getCurrentPrice()
                .multiply(BigDecimal.valueOf(quantity));

        user.setBalance(user.getBalance().add(totalEarnings));
        userRepository.save(user);

        portfolio.setQuantity(portfolio.getQuantity() - quantity);
        if (portfolio.getQuantity() == 0) {
            portfolioRepository.delete(portfolio);
        } else {
            portfolioRepository.save(portfolio);
        }

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setStock(stock);
        transaction.setType(Transaction.TransactionType.SELL);
        transaction.setQuantity(quantity);
        transaction.setPrice(stock.getCurrentPrice());
        transaction.setTotal(totalEarnings);
        transactionRepository.save(transaction);

        return "Successfully sold " + quantity + " shares of "
                + stock.getSymbol();
    }

    public List<Portfolio> getPortfolio(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return portfolioRepository.findByUser(user);
    }

    public List<Transaction> getTransactionHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return transactionRepository.findByUserOrderByCreatedAtDesc(user);
    }
}