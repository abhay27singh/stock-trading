package com.stocktrading.backend.dto;

import lombok.Data;

@Data
public class TradeRequest {
    private String symbol;
    private Integer quantity;
    private String type;
}