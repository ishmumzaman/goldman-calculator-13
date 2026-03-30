package com.group13.mutualfundcalculatorbackend.service;

import com.group13.mutualfundcalculatorbackend.client.HistoricalPriceClient;
import com.group13.mutualfundcalculatorbackend.exception.UpstreamDataException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class HistoricalReturnServiceTest {

    @Test
    void calculatesReturnForPreviousFullCalendarYear() {
        HistoricalPriceClient client = mock(HistoricalPriceClient.class);
        when(client.fetchDailyCloseSeries("VFIAX")).thenReturn(Map.of(
                LocalDate.parse("2024-12-31"), new BigDecimal("8.50"),
                LocalDate.parse("2025-01-02"), new BigDecimal("10.00"),
                LocalDate.parse("2025-06-30"), new BigDecimal("11.50"),
                LocalDate.parse("2025-12-31"), new BigDecimal("12.00"),
                LocalDate.parse("2026-01-02"), new BigDecimal("13.00")
        ));

        HistoricalReturnService service = new HistoricalReturnService(client, fixedClock());

        BigDecimal result = service.calculatePreviousFullYearReturn("VFIAX");

        assertThat(result).isEqualByComparingTo("0.2");
    }

    @Test
    void usesFirstAndLastTradingDaysWithinPreviousYear() {
        HistoricalPriceClient client = mock(HistoricalPriceClient.class);
        when(client.fetchDailyCloseSeries("VFIAX")).thenReturn(Map.of(
                LocalDate.parse("2025-01-03"), new BigDecimal("9.00"),
                LocalDate.parse("2025-12-30"), new BigDecimal("11.00"),
                LocalDate.parse("2025-12-31"), new BigDecimal("12.00")
        ));

        HistoricalReturnService service = new HistoricalReturnService(client, fixedClock());

        BigDecimal result = service.calculatePreviousFullYearReturn("VFIAX");

        assertThat(result).isEqualByComparingTo("0.3333333333333333");
    }

    @Test
    void throwsWhenPreviousYearHasNoUsableData() {
        HistoricalPriceClient client = mock(HistoricalPriceClient.class);
        when(client.fetchDailyCloseSeries("VFIAX")).thenReturn(Map.of(
                LocalDate.parse("2024-12-31"), new BigDecimal("8.50"),
                LocalDate.parse("2026-01-02"), new BigDecimal("13.00")
        ));

        HistoricalReturnService service = new HistoricalReturnService(client, fixedClock());

        assertThatThrownBy(() -> service.calculatePreviousFullYearReturn("VFIAX"))
                .isInstanceOf(UpstreamDataException.class)
                .hasMessage("No usable historical price data exists for the previous full calendar year");
    }

    private Clock fixedClock() {
        return Clock.fixed(Instant.parse("2026-03-21T00:00:00Z"), ZoneOffset.UTC);
    }
}
