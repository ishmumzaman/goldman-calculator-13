package com.group13.mutualfundcalculatorbackend.service;

import com.group13.mutualfundcalculatorbackend.client.BetaClient;
import com.group13.mutualfundcalculatorbackend.config.AppProperties;
import com.group13.mutualfundcalculatorbackend.dto.FutureValueResponse;
import com.group13.mutualfundcalculatorbackend.exception.BadRequestException;
import com.group13.mutualfundcalculatorbackend.model.FundDefinition;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CalculationServiceTest {

    @Test
    void calculatesFutureValueResponse() {
        FundService fundService = mock(FundService.class);
        BetaClient betaClient = mock(BetaClient.class);
        HistoricalReturnService historicalReturnService = mock(HistoricalReturnService.class);
        FormulaService formulaService = new FormulaService();

        FundDefinition fundDefinition = new FundDefinition(
                "VFIAX",
                "Vanguard 500 Index Fund Admiral Shares",
                "Vanguard",
                "Large Blend",
                "^GSPC"
        );

        when(fundService.normalizeTicker("  vfiax ")).thenReturn("VFIAX");
        when(fundService.requireFundByTicker("VFIAX")).thenReturn(fundDefinition);
        when(fundService.getFunds()).thenReturn(List.of(fundDefinition));
        when(betaClient.fetchBeta("VFIAX")).thenReturn(new BigDecimal("0.980000"));
        when(historicalReturnService.calculatePreviousFullYearReturn("VFIAX")).thenReturn(new BigDecimal("0.120000"));

        CalculationService calculationService = new CalculationService(
                fundService,
                testProperties(),
                betaClient,
                historicalReturnService,
                formulaService,
                fixedClock()
        );

        FutureValueResponse response = calculationService.calculateFutureValue("  vfiax ", new BigDecimal("10000"), 5);

        assertThat(response.ticker()).isEqualTo("VFIAX");
        assertThat(response.fundName()).isEqualTo("Vanguard 500 Index Fund Admiral Shares");
        assertThat(response.initialInvestment()).isEqualByComparingTo("10000.00");
        assertThat(response.years()).isEqualTo(5);
        assertThat(response.riskFreeRate()).isEqualByComparingTo("0.043500");
        assertThat(response.beta()).isEqualByComparingTo("0.980000");
        assertThat(response.expectedReturnRate()).isEqualByComparingTo("0.120000");
        assertThat(response.annualRate()).isEqualByComparingTo("0.118470");
        assertThat(response.futureValue()).isEqualByComparingTo("17503.37");
        assertThat(response.currency()).isEqualTo("USD");
        assertThat(response.calculationTimestamp()).isEqualTo(Instant.parse("2026-03-21T00:00:00Z"));
    }

    @Test
    void rejectsBlankTicker() {
        CalculationService calculationService = new CalculationService(
                mock(FundService.class),
                testProperties(),
                mock(BetaClient.class),
                mock(HistoricalReturnService.class),
                new FormulaService(),
                fixedClock()
        );

        assertThatThrownBy(() -> calculationService.calculateFutureValue("   ", new BigDecimal("10000"), 5))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("ticker is required");
    }

    @Test
    void rejectsNonPositiveInvestment() {
        FundService fundService = mock(FundService.class);
        when(fundService.normalizeTicker("VFIAX")).thenReturn("VFIAX");

        CalculationService calculationService = new CalculationService(
                fundService,
                testProperties(),
                mock(BetaClient.class),
                mock(HistoricalReturnService.class),
                new FormulaService(),
                fixedClock()
        );

        assertThatThrownBy(() -> calculationService.calculateFutureValue("VFIAX", BigDecimal.ZERO, 5))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("initialInvestment must be greater than 0");
    }

    @Test
    void rejectsInvalidYears() {
        FundService fundService = mock(FundService.class);
        when(fundService.normalizeTicker("VFIAX")).thenReturn("VFIAX");

        CalculationService calculationService = new CalculationService(
                fundService,
                testProperties(),
                mock(BetaClient.class),
                mock(HistoricalReturnService.class),
                new FormulaService(),
                fixedClock()
        );

        assertThatThrownBy(() -> calculationService.calculateFutureValue("VFIAX", new BigDecimal("10000"), 0))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("years must be a positive integer");
    }

    private Clock fixedClock() {
        return Clock.fixed(Instant.parse("2026-03-21T00:00:00Z"), ZoneOffset.UTC);
    }

    private AppProperties testProperties() {
        AppProperties properties = new AppProperties();
        properties.setAllowedOrigin("http://localhost:5173");
        properties.setRiskFreeRate(new BigDecimal("0.0435"));
        properties.setBenchmarkIndexTicker("^GSPC");
        return properties;
    }
}
