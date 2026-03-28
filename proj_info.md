# Mutual Fund Calculator

A web application designed to help users estimate potential returns on
their mutual fund investments.

-   Users will be able to select a mutual fund, input an initial
    investment amount, and input the investment duration to calculate
    the future value of their investment.

------------------------------------------------------------------------

## Introduction

This project will allow the student to learn about mutual fund (MF)
trading, model investments, and predict returns over time.\
This project is intended for college students at a sophomore level of
their computer science (or equivalent) degree.

Upon completion, the student should have: - A strong foundation in full
stack engineering - Enhanced financial literacy in the domain of mutual
fund trading

------------------------------------------------------------------------

## Terminology

### Mutual Fund

An investment vehicle that pools money from multiple investors to
purchase a diversified portfolio of stocks, bonds, or other securities
(according to the fund's stated strategy).\
Example: ClearBridge Large Cap Growth Fund

### Beta

Denotes volatility or systematic risk of a security or portfolio
compared to the market.

Assuming the S&P 500 is the "market" and has a beta of 1: - Stocks
higher than 1 are interpreted as more volatile than the market.

### Return Rate

Net gain or loss of an investment over a specified period, expressed as
a percentage of the investment's initial cost.

Definitions from: https://www.investopedia.com/

------------------------------------------------------------------------

## Mutual Fund Predicted Future Performance Formula

Use the S&P historical return over the past 5 years, the selected MF's
historical beta, and the Capital Asset Pricing Model to predict the
future value of an investment.

### Formula

    FV = P * e^(r * t)

Where: - **P** = principal (initial investment) - **r** = rate = risk
free rate + beta \* (expected return rate -- risk free rate) - **t** =
time

### Risk Free Rate

US Treasury Interest Rate\
https://fred.stlouisfed.org/series/DGS10

### Expected Return Rate

Use historical average returns from chosen mutual fund for previous
year:

    (last day of year value – first day of year value) / first day of year value

Get average rate for previous year.

### Beta

Get calculated beta from an open-source API (ex: Newton Analytics)

Example:
https://api.newtonanalytics.com/stock-beta/?ticker=VFIAX&index=\^GSPC&interval=1mo&observations=12

-   Ticker is mutual fund symbol
-   Index is S&P 500
-   Keep index, interval, and observations same as example

------------------------------------------------------------------------

## Structure

### Backend

Build the services layer of the backend that exposes RESTful APIs for
the frontend.

Endpoints:

-   GET list of mutual funds
    -   Hardcode mutual funds (ensure they are supported by Newton API)\
    -   Example list:
        https://www.marketwatch.com/tools/top-25-mutual-funds
-   GET future value of investment amount
    -   Parameters:
        -   Mutual fund
        -   Initial investment amount
        -   Time
    -   Hardcode risk free rate
    -   Connect to APIs to:
        -   Retrieve beta
        -   Calculate expected return rate from last year data

------------------------------------------------------------------------

### Frontend

Build frontend and connect to backend endpoints to retrieve data and
populate the UI.

UI Components:

-   Dropdown to select mutual fund
-   Input field for initial investment amount
-   Input field to choose time horizon

------------------------------------------------------------------------

### Presentation

Create a presentation showcasing: - Finished product - Learning
milestones

------------------------------------------------------------------------

## Timeline

-   Week 1: Project setup
-   Week 2: Backend API development
-   Week 3: UI
-   Week 4: Wrap up, bonus features, prepare presentation

------------------------------------------------------------------------

## Prerequisites

Install:

-   IntelliJ IDEA:
    https://www.jetbrains.com/idea/download/?section=windows
-   Git:
    https://www.jetbrains.com/help/idea/set-up-a-git-repository.html
-   Angular CLI & Node.js: https://angular.dev/tutorials/first-app
-   Java 8: https://www.java.com/en/download/

------------------------------------------------------------------------

## Possible Bonus Features

-   JUnit tests on backend
-   Jasmine tests on frontend
-   Allow selection of multiple mutual funds for comparison
-   Broaden scope to include ETFs
-   UI enhancements (historical graphs, comparisons, animations)
-   Advanced Option:
    -   Use cloud provider (ex: Google Cloud)
    -   Create SQL server instance
    -   Database for writing investments
    -   Additional endpoints for read/write operations
    -   UI display features like grid of past investments or graph
        tracking investment values

Up to you --- get creative.

------------------------------------------------------------------------

## AI Challenge

Use ChatGPT (or model of your choice) to broaden the scope of the
application.

Example prompt:

Given a list of tickers \[y\], a risk tolerance parameter p, generate a
complete portfolio optimizing for the best returns over t years.

*y, p, and t can be input parameters from the specifications above.*

------------------------------------------------------------------------

## Set Up Instructions

1.  Follow steps to connect to OpenAI:
    https://platform.openai.com/docs/libraries
2.  Create a free ChatGPT account and generate an API key:
    https://platform.openai.com/api-keys

------------------------------------------------------------------------

Feel free to be creative and add or remove parameters, or come up with
your own ideas.
