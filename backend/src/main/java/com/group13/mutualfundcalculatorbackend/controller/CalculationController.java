package com.group13.mutualfundcalculatorbackend.controller;

import com.group13.mutualfundcalculatorbackend.dto.FutureValueResponse;
import com.group13.mutualfundcalculatorbackend.service.CalculationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/calculations")
public class CalculationController {

    private final CalculationService calculationService;

    public CalculationController(CalculationService calculationService) {
        this.calculationService = calculationService;
    }

    @GetMapping("/future-value")
    public FutureValueResponse calculateFutureValue(@RequestParam String ticker,
                                                    @RequestParam BigDecimal initialInvestment,
                                                    @RequestParam Integer years) {
        return calculationService.calculateFutureValue(ticker, initialInvestment, years);
    }
}
