package com.group13.mutualfundcalculatorbackend.service;

import com.group13.mutualfundcalculatorbackend.client.HistoricalPriceClient;
import com.group13.mutualfundcalculatorbackend.exception.UpstreamDataException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Map;
import java.util.NavigableMap;
import java.util.TreeMap;

@Service
public class HistoricalReturnService {

    private static final MathContext MATH_CONTEXT = MathContext.DECIMAL64;

    private final HistoricalPriceClient historicalPriceClient;
    private final Clock clock;

    public HistoricalReturnService(HistoricalPriceClient historicalPriceClient, Clock clock) {
        this.historicalPriceClient = historicalPriceClient;
        this.clock = clock;
    }

    public BigDecimal calculatePreviousFullYearReturn(String ticker) {
        Map<LocalDate, BigDecimal> dailyCloseSeries = historicalPriceClient.fetchDailyCloseSeries(ticker);
        int previousYear = LocalDate.now(clock).minusYears(1).getYear();

        NavigableMap<LocalDate, BigDecimal> previousYearSeries = new TreeMap<>();
        dailyCloseSeries.forEach((date, close) -> {
            if (date.getYear() == previousYear) {
                previousYearSeries.put(date, close);
            }
        });

        if (previousYearSeries.isEmpty()) {
            throw new UpstreamDataException("No usable historical price data exists for the previous full calendar year");
        }

        BigDecimal firstPrice = previousYearSeries.firstEntry().getValue();
        BigDecimal lastPrice = previousYearSeries.lastEntry().getValue();

        if (firstPrice == null || BigDecimal.ZERO.compareTo(firstPrice) == 0) {
            throw new UpstreamDataException("The first trading day price for the previous full calendar year is invalid");
        }
        if (lastPrice == null) {
            throw new UpstreamDataException("The last trading day price for the previous full calendar year is invalid");
        }

        return lastPrice.subtract(firstPrice, MATH_CONTEXT)
                .divide(firstPrice, MATH_CONTEXT);
    }
}
