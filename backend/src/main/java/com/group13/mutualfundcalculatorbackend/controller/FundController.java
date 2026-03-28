package com.group13.mutualfundcalculatorbackend.controller;

import com.group13.mutualfundcalculatorbackend.dto.FundListResponse;
import com.group13.mutualfundcalculatorbackend.dto.FundResponse;
import com.group13.mutualfundcalculatorbackend.model.FundDefinition;
import com.group13.mutualfundcalculatorbackend.service.FundService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/funds")
public class FundController {

    private final FundService fundService;

    public FundController(FundService fundService) {
        this.fundService = fundService;
    }

    @GetMapping
    public FundListResponse getFunds() {
        List<FundResponse> funds = fundService.getFunds().stream()
                .map(this::toResponse)
                .toList();
        return new FundListResponse(funds);
    }

    private FundResponse toResponse(FundDefinition fundDefinition) {
        return new FundResponse(
                fundDefinition.ticker(),
                fundDefinition.name(),
                fundDefinition.family(),
                fundDefinition.category(),
                fundDefinition.benchmarkIndexTicker()
        );
    }
}
