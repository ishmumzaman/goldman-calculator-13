package com.group13.mutualfundcalculatorbackend.model;

import jakarta.validation.constraints.NotBlank;

public record FundDefinition(
        @NotBlank String ticker,
        @NotBlank String name,
        @NotBlank String family,
        @NotBlank String category,
        @NotBlank String benchmarkIndexTicker
) {
}
