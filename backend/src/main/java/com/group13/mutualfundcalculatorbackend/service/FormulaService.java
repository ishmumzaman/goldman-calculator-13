package com.group13.mutualfundcalculatorbackend.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;

@Service
public class FormulaService {

    private static final MathContext MATH_CONTEXT = MathContext.DECIMAL64;

    public BigDecimal calculateAnnualRate(BigDecimal riskFreeRate, BigDecimal beta, BigDecimal expectedReturnRate) {
        return riskFreeRate.add(beta.multiply(expectedReturnRate.subtract(riskFreeRate, MATH_CONTEXT), MATH_CONTEXT), MATH_CONTEXT);
    }

    public BigDecimal calculateFutureValue(BigDecimal principal, BigDecimal annualRate, int years) {
        BigDecimal growthFactor = BigDecimal.ONE.add(annualRate, MATH_CONTEXT).pow(years, MATH_CONTEXT);
        return principal.multiply(growthFactor, MATH_CONTEXT);
    }
}
