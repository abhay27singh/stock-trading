package com.stocktrading.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "portfolios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"portfolios","transactions","watchlist","password"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "stock_id")
    @JsonIgnoreProperties({"portfolios","transactions","watchlist","priceHistories"})
    private Stock stock;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(name = "avg_buy_price", precision = 10, scale = 2)
    private BigDecimal avgBuyPrice = BigDecimal.ZERO;
}