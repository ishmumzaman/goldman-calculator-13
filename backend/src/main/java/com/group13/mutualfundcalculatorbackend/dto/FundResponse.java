package com.group13.mutualfundcalculatorbackend.dto;

public record FundResponse(
        String ticker,
        String name,
        String family,
        String category,
        String benchmarkIndexTicker
) {
}
