package com.group13.mutualfundcalculatorbackend.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class FormulaServiceTest {

    private final FormulaService formulaService = new FormulaService();

    @Test
    void calculatesAnnualRate() {
        BigDecimal annualRate = formulaService.calculateAnnualRate(
                new BigDecimal("0.0435"),
                new BigDecimal("0.98"),
                new BigDecimal("0.12")
        );

        assertThat(annualRate).isEqualByComparingTo("0.11847");
    }

    @Test
    void calculatesFutureValue() {
        BigDecimal futureValue = formulaService.calculateFutureValue(
                new BigDecimal("10000"),
                new BigDecimal("0.11813"),
                5
        );

        assertThat(futureValue).isEqualByComparingTo("17476.78324151925");
    }
}
