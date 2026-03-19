import { useState, useCallback, lazy, Suspense } from "react";
import SidebarNav from "./components/layout/SidebarNav.jsx";

/* ── Lazy-load screens ── */
const Calculator = lazy(() => import("./screens/Calculator.jsx"));
const InvestmentProjection = lazy(() => import("./screens/InvestmentProjection.jsx"));
const CompareFunds = lazy(() => import("./screens/CompareFunds.jsx"));
const SavedHistory = lazy(() => import("./screens/SavedHistory.jsx"));
const Portfolio = lazy(() => import("./screens/Portfolio.jsx"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center flex-1">
    <span className="font-inter text-sm text-[var(--text-muted)] animate-pulse">Loading…</span>
  </div>
);

export default function App() {
  const [screen, setScreen] = useState("calculator");
  const [calcResult, setCalcResult] = useState(null);

  const handleNavigate = useCallback((key) => {
    setScreen(key);
    // Clear result when navigating away from results
    if (key !== "results") setCalcResult(null);
  }, []);

  const handleCalculate = useCallback((result) => {
    setCalcResult(result);
    setScreen("results");
  }, []);

  const handleViewHistoryResult = useCallback((item) => {
    if (item?._navigateToCalc) {
      setScreen("calculator");
      return;
    }
    // TODO: Re-run forecast with the history item's params and navigate to results
    setScreen("calculator");
  }, []);

  const handleBackFromResults = useCallback(() => {
    setScreen("calculator");
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case "calculator":
        return <Calculator onCalculate={handleCalculate} />;
      case "results":
        return (
          <InvestmentProjection
            result={calcResult}
            onBack={handleBackFromResults}
          />
        );
      case "compare":
        return <CompareFunds />;
      case "history":
        return <SavedHistory onViewResult={handleViewHistoryResult} />;
      case "portfolio":
        return <Portfolio />;
      case "learn":
        return <PlaceholderScreen title="Learn CAPM" subtitle="Interactive CAPM model explainer coming soon." />;
      case "settings":
        return <PlaceholderScreen title="Settings" subtitle="Preferences and configuration coming soon." />;
      default:
        return <Calculator onCalculate={handleCalculate} />;
    }
  };

  return (
    <div className="flex h-full w-full bg-[var(--bg-page)]">
      <SidebarNav
        activeScreen={screen === "results" ? "calculator" : screen}
        onNavigate={handleNavigate}
      />
      <main className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Suspense fallback={<LoadingFallback />}>
          {renderScreen()}
        </Suspense>
      </main>
    </div>
  );
}

/** Simple placeholder for optional / future screens */
function PlaceholderScreen({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4">
      <h2 className="font-instrument text-3xl text-[var(--text-primary)]">{title}</h2>
      <p className="font-inter text-sm text-[var(--text-muted)]">{subtitle}</p>
    </div>
  );
}
