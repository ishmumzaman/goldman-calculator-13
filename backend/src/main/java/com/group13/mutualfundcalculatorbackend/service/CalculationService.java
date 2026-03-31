package com.group13.mutualfundcalculatorbackend.service;

import com.group13.mutualfundcalculatorbackend.client.BetaClient;
import com.group13.mutualfundcalculatorbackend.config.AppProperties;
import com.group13.mutualfundcalculatorbackend.dto.FutureValueResponse;
import com.group13.mutualfundcalculatorbackend.exception.BadRequestException;
import com.group13.mutualfundcalculatorbackend.model.FundDefinition;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;

@Service
public class CalculationService {

    private static final String USD = "USD";

    private final FundService fundService;
    private final AppProperties appProperties;
    private final BetaClient betaClient;
    private final HistoricalReturnService historicalReturnService;
    private final FormulaService formulaService;
    private final Clock clock;

    public CalculationService(FundService fundService,
                              AppProperties appProperties,
                              BetaClient betaClient,
                              HistoricalReturnService historicalReturnService,
                              FormulaService formulaService,
                              Clock clock) {
        this.fundService = fundService;
        this.appProperties = appProperties;
        this.betaClient = betaClient;
        this.historicalReturnService = historicalReturnService;
        this.formulaService = formulaService;
        this.clock = clock;
    }

    public FutureValueResponse calculateFutureValue(String ticker, BigDecimal initialInvestment, Integer years) {
        String normalizedTicker = fundService.normalizeTicker(ticker);
        if (normalizedTicker == null) {
            normalizedTicker = "";
        }
        validateInputs(normalizedTicker, initialInvestment, years);

        FundDefinition fundDefinition = fundService.requireFundByTicker(normalizedTicker);
        BigDecimal riskFreeRate = appProperties.getRiskFreeRate();
        BigDecimal beta = betaClient.fetchBeta(fundDefinition.ticker());
        BigDecimal expectedReturnRate = historicalReturnService.calculateTrailingFiveYearReturn(fundDefinition.benchmarkIndexTicker());
        BigDecimal annualRate = formulaService.calculateAnnualRate(riskFreeRate, beta, expectedReturnRate);
        BigDecimal futureValue = formulaService.calculateFutureValue(initialInvestment, annualRate, years);

        return new FutureValueResponse(
                fundDefinition.ticker(),
                fundDefinition.name(),
                roundMoney(initialInvestment),
                years,
                roundRate(riskFreeRate),
                roundRate(beta),
                roundRate(expectedReturnRate),
                roundRate(annualRate),
                roundMoney(futureValue),
                USD,
                currentTimestamp()
        );
    }

    private void validateInputs(String ticker, BigDecimal initialInvestment, Integer years) {
        if (ticker.isBlank()) {
            throw new BadRequestException("ticker is required");
        }
        if (initialInvestment == null || initialInvestment.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("initialInvestment must be greater than 0");
        }
        if (years == null || years <= 0) {
            throw new BadRequestException("years must be a positive integer");
        }
    }

    private BigDecimal roundRate(BigDecimal value) {
        return value.setScale(6, RoundingMode.HALF_UP);
    }

    private BigDecimal roundMoney(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private Instant currentTimestamp() {
        return Instant.now(clock);
    }
}
