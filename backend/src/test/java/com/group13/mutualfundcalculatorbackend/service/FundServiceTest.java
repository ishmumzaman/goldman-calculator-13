package com.group13.mutualfundcalculatorbackend.service;

import com.group13.mutualfundcalculatorbackend.config.AppProperties;
import com.group13.mutualfundcalculatorbackend.model.FundDefinition;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FundServiceTest {

    @Test
    void returnsFundsInConfiguredOrder() {
        FundService fundService = new FundService(testProperties());

        List<FundDefinition> funds = fundService.getFunds();

        assertThat(funds)
                .extracting(FundDefinition::ticker)
                .containsExactly("VFIAX", "FXAIX", "SWPPX");
    }

    @Test
    void normalizesTickerForLookup() {
        FundService fundService = new FundService(testProperties());

        FundDefinition fund = fundService.getFundByTicker("  swppx ");

        assertThat(fund).isNotNull();
        assertThat(fund.ticker()).isEqualTo("SWPPX");
    }

    private AppProperties testProperties() {
        AppProperties properties = new AppProperties();
        properties.setAllowedOrigin("http://localhost:5173");
        properties.setRiskFreeRate(new BigDecimal("0.0435"));
        properties.setBenchmarkIndexTicker("^GSPC");

        AppProperties.NewtonProperties newtonProperties = new AppProperties.NewtonProperties();
        newtonProperties.setBaseUrl("https://api.newtonanalytics.com");
        newtonProperties.setInterval("1mo");
        newtonProperties.setObservations(12);
        newtonProperties.setPriceInterval("1d");
        newtonProperties.setPriceDataType("04");
        newtonProperties.setPriceObservations(800);
        properties.setNewton(newtonProperties);

        properties.setFunds(List.of(
                new FundDefinition("VFIAX", "Vanguard 500 Index Fund Admiral Shares", "Vanguard", "Large Blend", "^GSPC"),
                new FundDefinition("FXAIX", "Fidelity 500 Index Fund", "Fidelity", "Large Blend", "^GSPC"),
                new FundDefinition("SWPPX", "Schwab S&P 500 Index Fund", "Schwab", "Large Blend", "^GSPC")
        ));
        return properties;
    }
}
