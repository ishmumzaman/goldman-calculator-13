package com.group13.mutualfundcalculatorbackend.model;

import java.math.BigDecimal;
import java.util.List;

public record NewtonPriceResponse(
        String status,
        String statusMessage,
        List<List<BigDecimal>> data
) {
}
