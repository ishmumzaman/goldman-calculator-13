package com.group13.mutualfundcalculatorbackend.config;

import com.group13.mutualfundcalculatorbackend.model.FundDefinition;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    @NotBlank
    private String allowedOrigin;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal riskFreeRate;

    @NotBlank
    private String benchmarkIndexTicker;

    @Valid
    @NotNull
    private NewtonProperties newton = new NewtonProperties();

    @Valid
    @NotEmpty
    private List<FundDefinition> funds = new ArrayList<>();

    public String getAllowedOrigin() {
        return allowedOrigin;
    }

    public void setAllowedOrigin(String allowedOrigin) {
        this.allowedOrigin = allowedOrigin;
    }

    public BigDecimal getRiskFreeRate() {
        return riskFreeRate;
    }

    public void setRiskFreeRate(BigDecimal riskFreeRate) {
        this.riskFreeRate = riskFreeRate;
    }

    public String getBenchmarkIndexTicker() {
        return benchmarkIndexTicker;
    }

    public void setBenchmarkIndexTicker(String benchmarkIndexTicker) {
        this.benchmarkIndexTicker = benchmarkIndexTicker;
    }

    public NewtonProperties getNewton() {
        return newton;
    }

    public void setNewton(NewtonProperties newton) {
        this.newton = newton;
    }

    public List<FundDefinition> getFunds() {
        return funds;
    }

    public void setFunds(List<FundDefinition> funds) {
        this.funds = funds;
    }

    public static class NewtonProperties {

        @NotBlank
        private String baseUrl;

        @NotBlank
        private String interval;

        @NotNull
        @Min(1)
        private Integer observations;

        @NotBlank
        private String priceInterval;

        @NotBlank
        private String priceDataType;

        @NotNull
        @Min(1)
        private Integer priceObservations;

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String getInterval() {
            return interval;
        }

        public void setInterval(String interval) {
            this.interval = interval;
        }

        public Integer getObservations() {
            return observations;
        }

        public void setObservations(Integer observations) {
            this.observations = observations;
        }

        public String getPriceInterval() {
            return priceInterval;
        }

        public void setPriceInterval(String priceInterval) {
            this.priceInterval = priceInterval;
        }

        public String getPriceDataType() {
            return priceDataType;
        }

        public void setPriceDataType(String priceDataType) {
            this.priceDataType = priceDataType;
        }

        public Integer getPriceObservations() {
            return priceObservations;
        }

        public void setPriceObservations(Integer priceObservations) {
            this.priceObservations = priceObservations;
        }
    }
}
