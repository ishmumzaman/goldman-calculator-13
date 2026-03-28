package com.group13.mutualfundcalculatorbackend.client;

import com.group13.mutualfundcalculatorbackend.config.AppProperties;
import com.group13.mutualfundcalculatorbackend.exception.UpstreamDataException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class BetaClientTest {

    private BetaClient betaClient;
    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        this.mockServer = MockRestServiceServer.bindTo(builder).build();
        this.betaClient = new BetaClient(builder, testProperties());
    }

    @Test
    void parsesValidBetaResponse() {
        mockServer.expect(requestTo("https://api.newtonanalytics.com/stock-beta/?ticker=VFIAX&index=%5EGSPC&interval=1mo&observations=12"))
                .andExpect(method(GET))
                .andRespond(withSuccess("""
                        {
                          "status": "200",
                          "statusMessage": "Success",
                          "data": 0.6552996813634743,
                          "disclaimer": "test"
                        }
                        """, org.springframework.http.MediaType.APPLICATION_JSON));

        BigDecimal beta = betaClient.fetchBeta("VFIAX");

        assertThat(beta).isEqualByComparingTo("0.6552996813634743");
        mockServer.verify();
    }

    @Test
    void throwsWhenPayloadHasNoData() {
        mockServer.expect(requestTo("https://api.newtonanalytics.com/stock-beta/?ticker=VFIAX&index=%5EGSPC&interval=1mo&observations=12"))
                .andExpect(method(GET))
                .andRespond(withSuccess("""
                        {
                          "status": "200",
                          "statusMessage": "Success",
                          "disclaimer": "test"
                        }
                        """, org.springframework.http.MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> betaClient.fetchBeta("VFIAX"))
                .isInstanceOf(UpstreamDataException.class)
                .hasMessage("Newton Analytics returned no beta data");
    }

    @Test
    void throwsWhenServerReturnsNon2xx() {
        mockServer.expect(requestTo("https://api.newtonanalytics.com/stock-beta/?ticker=VFIAX&index=%5EGSPC&interval=1mo&observations=12"))
                .andExpect(method(GET))
                .andRespond(withServerError());

        assertThatThrownBy(() -> betaClient.fetchBeta("VFIAX"))
                .isInstanceOf(UpstreamDataException.class)
                .hasMessage("Failed to retrieve beta from Newton Analytics");
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
