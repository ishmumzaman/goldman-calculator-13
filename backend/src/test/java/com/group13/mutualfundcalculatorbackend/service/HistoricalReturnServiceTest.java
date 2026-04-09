package com.group13.mutualfundcalculatorbackend.service;

import com.group13.mutualfundcalculatorbackend.client.HistoricalPriceClient;
import com.group13.mutualfundcalculatorbackend.exception.UpstreamDataException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class HistoricalReturnServiceTest {

    @Test
    void calculatesTrailingFiveYearReturnFromBenchmarkSeries() {
        HistoricalPriceClient client = mock(HistoricalPriceClient.class);
        when(client.fetchDailyCloseSeries("^GSPC")).thenReturn(Map.of(
                LocalDate.parse("2021-03-19"), new BigDecimal("98.00"),
                LocalDate.parse("2021-03-22"), new BigDecimal("100.00"),
                LocalDate.parse("2024-06-28"), new BigDecimal("130.00"),
                LocalDate.parse("2026-03-20"), new BigDecimal("150.00")
        ));

        HistoricalReturnService service = new HistoricalReturnService(client);

        BigDecimal result = service.calculateTrailingFiveYearReturn("^GSPC");

        assertThat(result).isEqualByComparingTo("0.5");
    }

    @Test
    void usesFirstTradingDayOnOrAfterLookbackBoundary() {
        HistoricalPriceClient client = mock(HistoricalPriceClient.class);
        when(client.fetchDailyCloseSeries("^GSPC")).thenReturn(Map.of(
                LocalDate.parse("2020-12-31"), new BigDecimal("90.00"),
                LocalDate.parse("2021-03-19"), new BigDecimal("99.00"),
                LocalDate.parse("2021-03-22"), new BigDecimal("100.00"),
                LocalDate.parse("2026-03-20"), new BigDecimal("140.00")
        ));

        HistoricalReturnService service = new HistoricalReturnService(client);

        BigDecimal result = service.calculateTrailingFiveYearReturn("^GSPC");

        assertThat(result).isEqualByComparingTo("0.4");
    }

    @Test
    void throwsWhenFiveYearLookbackHasInsufficientHistory() {
        HistoricalPriceClient client = mock(HistoricalPriceClient.class);
        when(client.fetchDailyCloseSeries("^GSPC")).thenReturn(Map.of(
                LocalDate.parse("2021-03-22"), new BigDecimal("100.00"),
                LocalDate.parse("2026-03-20"), new BigDecimal("140.00")
        ));

        HistoricalReturnService service = new HistoricalReturnService(client);

        assertThatThrownBy(() -> service.calculateTrailingFiveYearReturn("^GSPC"))
                .isInstanceOf(UpstreamDataException.class)
                .hasMessage("No usable historical price data exists for the benchmark 5-year lookback window");
    }
}
