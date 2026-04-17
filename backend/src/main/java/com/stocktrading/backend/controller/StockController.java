package com.stocktrading.backend.controller;

import com.stocktrading.backend.entity.PriceHistory;
import com.stocktrading.backend.entity.Stock;
import com.stocktrading.backend.repository.PriceHistoryRepository;
import com.stocktrading.backend.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneOffset;
import java.util.*;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    private final PriceHistoryRepository priceHistoryRepository;

    @GetMapping
    public ResponseEntity<List<Stock>> getAllStocks() {
        return ResponseEntity.ok(stockService.getAllStocks());
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<Stock> getStock(@PathVariable String symbol) {
        return stockService.getStockBySymbol(symbol)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ FIXED FOR CHART
    @GetMapping("/{symbol}/history")
    public ResponseEntity<List<Map<String, Object>>> getPriceHistory(
            @PathVariable String symbol) {

        List<PriceHistory> history = priceHistoryRepository
                .findByStockSymbolOrderByRecordedAtAsc(symbol);

        List<Map<String, Object>> response = history.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();

            long epoch = p.getRecordedAt().toEpochSecond(ZoneOffset.UTC);

            map.put("time", epoch);
            map.put("price", p.getPrice());

            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }
}