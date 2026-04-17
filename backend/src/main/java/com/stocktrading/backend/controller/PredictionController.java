package com.stocktrading.backend.controller;

import com.stocktrading.backend.service.PredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/predict")
@CrossOrigin(origins = "http://localhost:3001")
public class PredictionController {

    @Autowired
    private PredictionService predictionService;

    @PostMapping("/{symbol}")
    public ResponseEntity<Map<String, Object>> predict(
            @PathVariable String symbol,
            @RequestBody Map<String, Object> body) {

        List<Double> prices = (List<Double>) body.get("prices");
        Double buyPrice = body.get("buyPrice") != null ?
                ((Number) body.get("buyPrice")).doubleValue() : prices.get(0);

        Map<String, Object> result = predictionService.getPrediction(symbol, prices, buyPrice);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        List<Double> testPrices = Arrays.asList(3200.0, 3220.0, 3195.0, 3240.0, 3260.0, 3245.0, 3270.0);
        Map<String, Object> result = predictionService.getPrediction("TCS.BSE", testPrices, 3200.0);
        return ResponseEntity.ok(result);
    }
}
