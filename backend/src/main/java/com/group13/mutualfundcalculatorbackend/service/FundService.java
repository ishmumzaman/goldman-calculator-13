package com.group13.mutualfundcalculatorbackend.service;

import com.group13.mutualfundcalculatorbackend.config.AppProperties;
import com.group13.mutualfundcalculatorbackend.exception.ResourceNotFoundException;
import com.group13.mutualfundcalculatorbackend.model.FundDefinition;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class FundService {

    private final AppProperties appProperties;

    public FundService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public List<FundDefinition> getFunds() {
        return appProperties.getFunds();
    }

    public FundDefinition getFundByTicker(String ticker) {
        String normalizedTicker = normalizeTicker(ticker);
        return appProperties.getFunds().stream()
                .filter(fund -> fund.ticker().equalsIgnoreCase(normalizedTicker))
                .findFirst()
                .orElse(null);
    }

    public FundDefinition requireFundByTicker(String ticker) {
        FundDefinition fundDefinition = getFundByTicker(ticker);
        if (fundDefinition == null) {
            throw new ResourceNotFoundException("Unsupported mutual fund ticker: " + normalizeTicker(ticker));
        }
        return fundDefinition;
    }

    public String normalizeTicker(String ticker) {
        if (ticker == null) {
            return "";
        }
        return ticker.trim().toUpperCase(Locale.US);
    }
}
