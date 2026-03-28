package com.group13.mutualfundcalculatorbackend.client;

import com.group13.mutualfundcalculatorbackend.config.AppProperties;
import com.group13.mutualfundcalculatorbackend.exception.UpstreamDataException;
import com.group13.mutualfundcalculatorbackend.model.NewtonBetaResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;

@Component
public class BetaClient {

    private final RestClient restClient;
    private final AppProperties appProperties;

    public BetaClient(RestClient.Builder restClientBuilder, AppProperties appProperties) {
        this.restClient = restClientBuilder
                .clone()
                .baseUrl(appProperties.getNewton().getBaseUrl())
                .build();
        this.appProperties = appProperties;
    }

    public BigDecimal fetchBeta(String ticker) {
        try {
            NewtonBetaResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/stock-beta/")
                            .queryParam("ticker", ticker)
                            .queryParam("index", appProperties.getBenchmarkIndexTicker())
                            .queryParam("interval", appProperties.getNewton().getInterval())
                            .queryParam("observations", appProperties.getNewton().getObservations())
                            .build())
                    .retrieve()
                    .body(NewtonBetaResponse.class);

            if (response == null || response.data() == null) {
                throw new UpstreamDataException("Newton Analytics returned no beta data");
            }
            if (!"200".equals(response.status())) {
                throw new UpstreamDataException("Newton Analytics returned an unexpected status");
            }
            return response.data();
        } catch (RestClientException exception) {
            throw new UpstreamDataException("Failed to retrieve beta from Newton Analytics", exception);
        }
    }
}
