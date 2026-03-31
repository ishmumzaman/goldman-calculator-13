package com.group13.mutualfundcalculatorbackend.service;

import com.group13.mutualfundcalculatorbackend.client.HistoricalPriceClient;
import com.group13.mutualfundcalculatorbackend.exception.UpstreamDataException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.time.LocalDate;
import java.util.Map;
import java.util.NavigableMap;
import java.util.TreeMap;

@Service
public class HistoricalReturnService {

    private static final MathContext MATH_CONTEXT = MathContext.DECIMAL64;
    private static final int LOOKBACK_YEARS = 5;

    private final HistoricalPriceClient historicalPriceClient;

    public HistoricalReturnService(HistoricalPriceClient historicalPriceClient) {
        this.historicalPriceClient = historicalPriceClient;
    }

    public BigDecimal calculateTrailingFiveYearReturn(String ticker) {
        Map<LocalDate, BigDecimal> dailyCloseSeries = historicalPriceClient.fetchDailyCloseSeries(ticker);
        NavigableMap<LocalDate, BigDecimal> sortedSeries = new TreeMap<>(dailyCloseSeries);

        if (sortedSeries.isEmpty()) {
            throw new UpstreamDataException("No usable historical price data exists for the benchmark 5-year lookback window");
        }

        LocalDate latestAvailableDate = sortedSeries.lastKey();
        LocalDate lookbackStartDate = latestAvailableDate.minusYears(LOOKBACK_YEARS);
        if (sortedSeries.firstKey().isAfter(lookbackStartDate)) {
            throw new UpstreamDataException("No usable historical price data exists for the benchmark 5-year lookback window");
        }

        Map.Entry<LocalDate, BigDecimal> firstEntry = sortedSeries.ceilingEntry(lookbackStartDate);
        if (firstEntry == null) {
            throw new UpstreamDataException("No usable historical price data exists for the benchmark 5-year lookback window");
        }

        BigDecimal firstPrice = firstEntry.getValue();
        BigDecimal lastPrice = sortedSeries.lastEntry().getValue();

        if (firstPrice == null || BigDecimal.ZERO.compareTo(firstPrice) == 0) {
            throw new UpstreamDataException("The first trading day price in the benchmark 5-year lookback window is invalid");
        }
        if (lastPrice == null) {
            throw new UpstreamDataException("The last trading day price in the benchmark 5-year lookback window is invalid");
        }

        return lastPrice.subtract(firstPrice, MATH_CONTEXT)
                .divide(firstPrice, MATH_CONTEXT);
    }
}
