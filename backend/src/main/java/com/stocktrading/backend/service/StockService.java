package com.stocktrading.backend.service;

import com.stocktrading.backend.entity.Stock;
import com.stocktrading.backend.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final Random random = new Random();

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    public Optional<Stock> getStockBySymbol(String symbol) {
        return stockRepository.findBySymbol(symbol);
    }

    @Scheduled(fixedRate = 3000)
    public void updateStockPrices() {

        List<Stock> stocks = stockRepository.findAll();

        for (Stock stock : stocks) {
            try {
                double current = stock.getCurrentPrice().doubleValue();

                double changePercent = (random.nextDouble() - 0.5) * 0.006;

                double newPrice = current * (1 + changePercent);
                newPrice = Math.max(newPrice, 1.0);

                BigDecimal oldPrice = stock.getCurrentPrice();
                BigDecimal newPriceBD = BigDecimal.valueOf(newPrice)
                        .setScale(2, RoundingMode.HALF_UP);

                BigDecimal changePct = BigDecimal.ZERO;
                if (oldPrice.compareTo(BigDecimal.ZERO) > 0) {
                    changePct = newPriceBD.subtract(oldPrice)
                            .divide(oldPrice, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .setScale(2, RoundingMode.HALF_UP);
                }

                stock.setPreviousPrice(oldPrice);
                stock.setCurrentPrice(newPriceBD);
                stock.setChangePercent(changePct);
                stock.setUpdatedAt(LocalDateTime.now(IST));

                stockRepository.save(stock);


                messagingTemplate.convertAndSend(
                        "/topic/stocks/" + stock.getSymbol(), stock
                );

            } catch (Exception e) {
                System.err.println("Failed to update: " + stock.getSymbol()
                        + " — " + e.getMessage());
            }
        }
    }
}