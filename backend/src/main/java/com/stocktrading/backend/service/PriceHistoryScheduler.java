package com.stocktrading.backend.service;

import com.stocktrading.backend.entity.PriceHistory;
import com.stocktrading.backend.entity.Stock;
import com.stocktrading.backend.repository.PriceHistoryRepository;
import com.stocktrading.backend.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PriceHistoryScheduler {

    private final StockRepository stockRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    @Scheduled(fixedRate = 5000)
    public void savePriceHistory() {

        List<Stock> stocks = stockRepository.findAll();

        for (Stock stock : stocks) {

            PriceHistory history = new PriceHistory();
            history.setStock(stock);

            // ✅ USE REAL CURRENT PRICE ONLY
            history.setPrice(stock.getCurrentPrice());

            history.setRecordedAt(LocalDateTime.now());

            priceHistoryRepository.save(history);
        }
    }
}