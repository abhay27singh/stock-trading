package com.stocktrading.backend.repository;

import com.stocktrading.backend.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {

    // ✅ matches "stock.symbol" navigation + "recordedAt" field
    List<PriceHistory> findByStockSymbolOrderByRecordedAtAsc(String symbol);
}