package com.group13.mutualfundcalculatorbackend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FundControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void returnsConfiguredFundsInOrder() throws Exception {
        mockMvc.perform(get("/api/v1/funds"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.funds[0].ticker").value("VFIAX"))
                .andExpect(jsonPath("$.funds[1].ticker").value("FXAIX"))
                .andExpect(jsonPath("$.funds[2].ticker").value("SWPPX"))
                .andExpect(jsonPath("$.funds[0].name").value("Vanguard 500 Index Fund Admiral Shares"))
                .andExpect(jsonPath("$.funds[0].family").value("Vanguard"))
                .andExpect(jsonPath("$.funds[0].category").value("Large Blend"))
                .andExpect(jsonPath("$.funds[0].benchmarkIndexTicker").value("^GSPC"));
    }
}
