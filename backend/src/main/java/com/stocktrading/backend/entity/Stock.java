package com.stocktrading.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "stocks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String symbol;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "current_price", precision = 10, scale = 2)
    private BigDecimal currentPrice = BigDecimal.ZERO;

    @Column(name = "previous_price", precision = 10, scale = 2)
    private BigDecimal previousPrice = BigDecimal.ZERO;

    @Column(name = "change_percent", precision = 5, scale = 2)
    private BigDecimal changePercent = BigDecimal.ZERO;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ✅ FIX: Added FetchType.LAZY to ALL collections
    // Without LAZY, Hibernate loads portfolios/transactions/watchlist/priceHistories
    // for every stock on every 3-second scheduler tick → 500+ queries/minute
    @JsonIgnore
    @OneToMany(mappedBy = "stock", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Portfolio> portfolios;

    @JsonIgnore
    @OneToMany(mappedBy = "stock", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions;

    @JsonIgnore
    @OneToMany(mappedBy = "stock", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Watchlist> watchlist;

    @JsonIgnore
    @OneToMany(mappedBy = "stock", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PriceHistory> priceHistories;
}