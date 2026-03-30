package com.group13.mutualfundcalculatorbackend.client;

import com.group13.mutualfundcalculatorbackend.config.AppProperties;
import com.group13.mutualfundcalculatorbackend.exception.UpstreamDataException;
import com.group13.mutualfundcalculatorbackend.model.NewtonPriceResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.TreeMap;

@Component
public class HistoricalPriceClient {

    private final RestClient restClient;
    private final AppProperties appProperties;

    public HistoricalPriceClient(RestClient.Builder restClientBuilder, AppProperties appProperties) {
        this.restClient = restClientBuilder
                .clone()
                .baseUrl(appProperties.getNewton().getBaseUrl())
                .build();
        this.appProperties = appProperties;
    }

    public Map<LocalDate, BigDecimal> fetchDailyCloseSeries(String ticker) {
        try {
            NewtonPriceResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/price/")
                            .queryParam("ticker", ticker)
                            .queryParam("interval", appProperties.getNewton().getPriceInterval())
                            .queryParam("dataType", appProperties.getNewton().getPriceDataType())
                            .queryParam("observations", appProperties.getNewton().getPriceObservations())
                            .build())
                    .retrieve()
                    .body(NewtonPriceResponse.class);

            if (response == null) {
                throw new UpstreamDataException("Newton Analytics returned no historical price response");
            }
            if (!"200".equals(response.status())) {
                throw new UpstreamDataException("Newton Analytics returned an unexpected historical price status");
            }
            if (response.data() == null || response.data().isEmpty()) {
                throw new UpstreamDataException("Newton Analytics returned no historical price data");
            }

            Map<LocalDate, BigDecimal> dailyCloseSeries = new TreeMap<>();
            for (var row : response.data()) {
                if (row == null || row.size() < 2 || row.get(0) == null || row.get(1) == null) {
                    continue;
                }

                LocalDate tradingDate = Instant.ofEpochSecond(row.get(0).longValueExact())
                        .atZone(ZoneOffset.UTC)
                        .toLocalDate();
                dailyCloseSeries.put(tradingDate, row.get(1));
            }

            if (dailyCloseSeries.isEmpty()) {
                throw new UpstreamDataException("Newton Analytics returned no usable historical closing prices");
            }
            return dailyCloseSeries;
        } catch (RestClientException exception) {
            throw new UpstreamDataException("Failed to retrieve historical prices from Newton Analytics", exception);
        }
    }
}
