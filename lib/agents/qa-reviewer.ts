import type { AiProvider } from "../providers/index";
import { type TestCase, type RiskItem, type TestFile, type CoverageResult } from "../schemas/analysis";

const ALL_CATEGORIES = [
  "happy_path",
  "edge_case",
  "negative_case",
  "regression",
  "api_validation",
  "abuse_case",
] as const;

export interface ReviewResult {
  coverageResult: CoverageResult;
  uncoveredHighCriticalRisks: RiskItem[];
}

export function runQaReviewer(
  _provider: AiProvider,
  tests: TestCase[],
  risks: RiskItem[],
  _testFile: TestFile,
  isRevision: boolean
): ReviewResult {
  const coveredRiskIds = new Set(tests.flatMap((t) => t.linkedRiskIds));

  const highCriticalRisks = risks.filter(
    (r) => r.severity === "HIGH" || r.severity === "CRITICAL"
  );

  const uncoveredHighCritical = highCriticalRisks.filter(
    (r) => !coveredRiskIds.has(r.id)
  );

  const presentCategories = new Set(tests.map((t) => t.category));
  const missingCategories = ALL_CATEGORIES.filter((c) => !presentCategories.has(c));

  const gaps: string[] = [];

  for (const risk of uncoveredHighCritical) {
    gaps.push(`${risk.id} (${risk.severity}): No test covers "${risk.title}"`);
  }

  for (const cat of missingCategories) {
    gaps.push(`Missing test category: ${cat.replace("_", " ")}`);
  }

  // Deterministic scoring
  let score = 100;
  for (const risk of uncoveredHighCritical) {
    score -= risk.severity === "CRITICAL" ? 15 : 10;
  }
  score -= missingCategories.length * 3;
  score -= gaps.length * 2;
  score = Math.max(0, Math.min(100, score));

  const plannerRevised = uncoveredHighCritical.length > 0 && !isRevision;

  const reviewerFeedback = plannerRevised
    ? `Coverage gaps detected on ${uncoveredHighCritical.map((r) => r.id).join(", ")}. Triggering Test Planner revision to add targeted tests.`
    : uncoveredHighCritical.length === 0
    ? "All HIGH and CRITICAL risks have linked tests. Coverage is acceptable."
    : "Final review: some gaps remain after revision. Manual review recommended for uncovered risks.";

  const summary =
    score >= 80
      ? `Strong coverage (${score}/100). ${tests.length} tests across ${presentCategories.size} categories.`
      : score >= 60
      ? `Moderate coverage (${score}/100). Key gaps identified. ${uncoveredHighCritical.length} high-severity risks uncovered.`
      : `Low coverage (${score}/100). Significant gaps. ${uncoveredHighCritical.length} critical/high risks have no tests.`;

  return {
    coverageResult: {
      score,
      summary,
      gaps,
      reviewerFeedback,
      plannerRevised,
    },
    uncoveredHighCriticalRisks: uncoveredHighCritical,
  };
}
