package com.stocktrading.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "stock_id")
    @JsonIgnoreProperties({"portfolios","transactions","watchlist","priceHistories"})
    private Stock stock;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt = LocalDateTime.now();
}