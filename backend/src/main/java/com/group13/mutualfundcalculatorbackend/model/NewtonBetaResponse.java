package com.group13.mutualfundcalculatorbackend.model;

import java.math.BigDecimal;

public record NewtonBetaResponse(
        String status,
        String statusMessage,
        BigDecimal data,
        String disclaimer
) {
}
