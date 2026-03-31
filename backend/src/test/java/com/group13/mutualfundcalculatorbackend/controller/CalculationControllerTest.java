package com.group13.mutualfundcalculatorbackend.controller;

import com.group13.mutualfundcalculatorbackend.config.AppProperties;
import com.group13.mutualfundcalculatorbackend.dto.FutureValueResponse;
import com.group13.mutualfundcalculatorbackend.exception.BadRequestException;
import com.group13.mutualfundcalculatorbackend.exception.GlobalExceptionHandler;
import com.group13.mutualfundcalculatorbackend.exception.ResourceNotFoundException;
import com.group13.mutualfundcalculatorbackend.exception.UpstreamDataException;
import com.group13.mutualfundcalculatorbackend.service.CalculationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CalculationController.class)
@Import(GlobalExceptionHandler.class)
class CalculationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CalculationService calculationService;

    @MockBean
    private AppProperties appProperties;

    @Test
    void returnsFutureValueResponse() throws Exception {
        FutureValueResponse response = new FutureValueResponse(
                "VFIAX",
                "Vanguard 500 Index Fund Admiral Shares",
                new BigDecimal("10000.00"),
                5,
                new BigDecimal("0.043500"),
                new BigDecimal("0.980000"),
                new BigDecimal("0.120000"),
                new BigDecimal("0.118470"),
                new BigDecimal("17503.37"),
                "USD",
                Instant.parse("2026-03-21T00:00:00Z")
        );

        given(calculationService.calculateFutureValue("VFIAX", new BigDecimal("10000"), 5)).willReturn(response);

        mockMvc.perform(get("/api/v1/calculations/future-value")
                        .queryParam("ticker", "VFIAX")
                        .queryParam("initialInvestment", "10000")
                        .queryParam("years", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticker").value("VFIAX"))
                .andExpect(jsonPath("$.fundName").value("Vanguard 500 Index Fund Admiral Shares"))
                .andExpect(jsonPath("$.futureValue").value(17503.37))
                .andExpect(jsonPath("$.currency").value("USD"));
    }

    @Test
    void returns400ForInvalidAmount() throws Exception {
        given(calculationService.calculateFutureValue(eq("VFIAX"), eq(new BigDecimal("-1")), eq(5)))
                .willThrow(new BadRequestException("initialInvestment must be greater than 0"));

        mockMvc.perform(get("/api/v1/calculations/future-value")
                        .queryParam("ticker", "VFIAX")
                        .queryParam("initialInvestment", "-1")
                        .queryParam("years", "5"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("initialInvestment must be greater than 0"));
    }

    @Test
    void returns400ForInvalidYears() throws Exception {
        mockMvc.perform(get("/api/v1/calculations/future-value")
                        .queryParam("ticker", "VFIAX")
                        .queryParam("initialInvestment", "10000")
                        .queryParam("years", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request parameters are invalid"));
    }

    @Test
    void returns404ForUnsupportedTicker() throws Exception {
        given(calculationService.calculateFutureValue(eq("MISSING"), eq(new BigDecimal("10000")), eq(5)))
                .willThrow(new ResourceNotFoundException("Unsupported mutual fund ticker: MISSING"));

        mockMvc.perform(get("/api/v1/calculations/future-value")
                        .queryParam("ticker", "MISSING")
                        .queryParam("initialInvestment", "10000")
                        .queryParam("years", "5"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Unsupported mutual fund ticker: MISSING"));
    }

    @Test
    void returns503ForBetaFailure() throws Exception {
        given(calculationService.calculateFutureValue(eq("VFIAX"), eq(new BigDecimal("10000")), eq(5)))
                .willThrow(new UpstreamDataException("Failed to retrieve beta from Newton Analytics"));

        mockMvc.perform(get("/api/v1/calculations/future-value")
                        .queryParam("ticker", "VFIAX")
                        .queryParam("initialInvestment", "10000")
                        .queryParam("years", "5"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message").value("Failed to retrieve beta from Newton Analytics"));
    }

    @Test
    void returns503ForHistoricalPriceFailure() throws Exception {
        given(calculationService.calculateFutureValue(eq("VFIAX"), eq(new BigDecimal("10000")), eq(5)))
                .willThrow(new UpstreamDataException("No usable historical price data exists for the benchmark 5-year lookback window"));

        mockMvc.perform(get("/api/v1/calculations/future-value")
                        .queryParam("ticker", "VFIAX")
                        .queryParam("initialInvestment", "10000")
                        .queryParam("years", "5"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message").value("No usable historical price data exists for the benchmark 5-year lookback window"));
    }
}
