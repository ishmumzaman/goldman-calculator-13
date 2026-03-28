package com.group13.mutualfundcalculatorbackend.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record FutureValueResponse(
        String ticker,
        String fundName,
        BigDecimal initialInvestment,
        int years,
        BigDecimal riskFreeRate,
        BigDecimal beta,
        BigDecimal expectedReturnRate,
        BigDecimal annualRate,
        BigDecimal futureValue,
        String currency,
        Instant calculationTimestamp
) {
}
