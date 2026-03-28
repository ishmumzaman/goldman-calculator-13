package com.group13.mutualfundcalculatorbackend.client;

import com.group13.mutualfundcalculatorbackend.config.AppProperties;
import com.group13.mutualfundcalculatorbackend.exception.UpstreamDataException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class HistoricalPriceClientTest {

    private HistoricalPriceClient historicalPriceClient;
    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        this.mockServer = MockRestServiceServer.bindTo(builder).build();
        this.historicalPriceClient = new HistoricalPriceClient(builder, testProperties());
    }

    @Test
    void parsesDailyPriceSeries() {
        mockServer.expect(requestTo("https://api.newtonanalytics.com/price/?ticker=VFIAX&interval=1d&dataType=04&observations=800"))
                .andExpect(method(GET))
                .andRespond(withSuccess("""
                        {
                          "status": "200",
                          "statusMessage": "Success",
                          "data": [
                            [1735776000, 9.00],
                            [1767139200, 11.00]
                          ]
                        }
                        """, MediaType.APPLICATION_JSON));

        Map<LocalDate, BigDecimal> series = historicalPriceClient.fetchDailyCloseSeries("VFIAX");

        assertThat(series)
                .containsEntry(LocalDate.parse("2025-01-02"), new BigDecimal("9.00"))
                .containsEntry(LocalDate.parse("2025-12-31"), new BigDecimal("11.00"));
    }

    @Test
    void throwsWhenApiReturnsUnexpectedStatus() {
        mockServer.expect(requestTo("https://api.newtonanalytics.com/price/?ticker=VFIAX&interval=1d&dataType=04&observations=800"))
                .andExpect(method(GET))
                .andRespond(withSuccess("""
                        {
                          "status": "400",
                          "statusMessage": "Failure",
                          "data": []
                        }
                        """, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> historicalPriceClient.fetchDailyCloseSeries("VFIAX"))
                .isInstanceOf(UpstreamDataException.class)
                .hasMessage("Newton Analytics returned an unexpected historical price status");
    }

    private AppProperties testProperties() {
        AppProperties properties = new AppProperties();
        properties.setAllowedOrigin("http://localhost:5173");
        properties.setRiskFreeRate(new BigDecimal("0.0435"));
        properties.setBenchmarkIndexTicker("^GSPC");

        AppProperties.NewtonProperties newtonProperties = new AppProperties.NewtonProperties();
        newtonProperties.setBaseUrl("https://api.newtonanalytics.com");
        newtonProperties.setInterval("1mo");
        newtonProperties.setObservations(12);
        newtonProperties.setPriceInterval("1d");
        newtonProperties.setPriceDataType("04");
        newtonProperties.setPriceObservations(800);
        properties.setNewton(newtonProperties);
        return properties;
    }
}
