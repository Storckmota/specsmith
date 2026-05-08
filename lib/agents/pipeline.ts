import { getProvider } from "../providers/index";
import type { AiProvider } from "../providers/index";
import { MockProvider } from "../providers/mock-provider";
import { runSpecParser } from "./spec-parser";
import { runRiskMapper } from "./risk-mapper";
import { runTestPlanner, runTestPlannerRevision } from "./test-planner";
import { runTestWriter } from "./test-writer";
import { runQaReviewer } from "./qa-reviewer";
import type {
  AnalyzeRequest,
  AnalysisResult,
  RiskItem,
  TestCase,
} from "../schemas/analysis";
import { mockRevisedTests } from "../providers/mock-provider";

type TimelineEntry = AnalysisResult["agentTimeline"][number];

// Internal implementation — accepts an explicit provider and display mode label.
async function _runPipelineImpl(
  request: AnalyzeRequest,
  provider: AiProvider,
  mode: string
): Promise<AnalysisResult> {
  const isMock = mode === "Mock mode";
  const timeline: TimelineEntry[] = [];

  const addEvent = (agent: string, status: TimelineEntry["status"], message?: string) => {
    timeline.push({ agent, status, message });
  };

  // Agent 1: Spec Parser
  addEvent("Spec Parser", "running");
  const parsedSpec = await runSpecParser(provider, request.specText, request.inputType);
  addEvent("Spec Parser", "complete", `Extracted ${parsedSpec.userStories.length} user stories, ${parsedSpec.businessRules.length} business rules`);

  // Agent 2: Risk Mapper
  addEvent("Risk Mapper", "running");
  const risks = await runRiskMapper(provider, parsedSpec);
  const criticalCount = risks.filter((r) => r.severity === "CRITICAL").length;
  const highCount = risks.filter((r) => r.severity === "HIGH").length;
  addEvent("Risk Mapper", "complete", `Found ${risks.length} risks (${criticalCount} CRITICAL, ${highCount} HIGH)`);

  // Agent 3: Test Planner
  addEvent("Test Planner", "running");
  let tests = await runTestPlanner(provider, parsedSpec, risks);
  addEvent("Test Planner", "complete", `Created ${tests.length} test cases across ${new Set(tests.map((t) => t.category)).size} categories`);

  // Agent 4: Test Writer
  addEvent("Test Writer", "running");
  let testFile = await runTestWriter(provider, tests, request.framework);
  addEvent("Test Writer", "complete", `Generated ${testFile.filename} (${request.framework})`);

  // Agent 5: QA Reviewer (initial)
  addEvent("QA Reviewer", "running");
  const initialReview = runQaReviewer(provider, tests, risks, testFile, false);
  addEvent("QA Reviewer", "complete", `Score: ${initialReview.coverageResult.score}/100, ${initialReview.uncoveredHighCriticalRisks.length} uncovered high/critical risks`);

  let finalTests = tests;
  let finalTestFile = testFile;
  let finalCoverage = initialReview.coverageResult;

  // Feedback loop: if HIGH/CRITICAL risks are uncovered, trigger revision
  if (initialReview.coverageResult.plannerRevised && initialReview.uncoveredHighCriticalRisks.length > 0) {
    addEvent("QA Reviewer", "revision", `Coverage gap detected: ${initialReview.uncoveredHighCriticalRisks.map((r) => r.id).join(", ")} — triggering revision`);

    // Test Planner revision
    addEvent("Test Planner", "revision", "Adding tests for uncovered high-severity risks");
    const newTests = isMock
      ? mockRevisedTests
      : await runTestPlannerRevision(
          provider,
          initialReview.uncoveredHighCriticalRisks,
          tests,
          tests.length + 1
        );
    finalTests = [...tests, ...newTests];

    // Link revised tests back to risks
    const revisedRisks = linkTestsToRisks(risks, finalTests);

    addEvent("Test Planner", "complete", `Added ${newTests.length} targeted tests`);

    // Test Writer revision
    addEvent("Test Writer", "revision", "Regenerating test file with revised test matrix");
    finalTestFile = await runTestWriter(provider, finalTests, request.framework);
    addEvent("Test Writer", "complete", `Updated ${finalTestFile.filename}`);

    // QA Reviewer final
    addEvent("QA Reviewer", "running", "Final coverage review after revision");
    const finalReview = runQaReviewer(provider, finalTests, revisedRisks, finalTestFile, true);
    finalCoverage = { ...finalReview.coverageResult, plannerRevised: true };
    addEvent("QA Reviewer", "complete", `Final score: ${finalCoverage.score}/100 — coverage updated`);

    // Use revised risks with updated linkedTestIds
    risks.splice(0, risks.length, ...revisedRisks);
  }

  // Build final result
  const finalRisks = linkTestsToRisks(risks, finalTests);

  return {
    summary: {
      title: parsedSpec.title,
      inputType: request.inputType,
      detectedScope: parsedSpec.detectedScope,
    },
    riskRegistry: finalRisks,
    testMatrix: finalTests,
    testFile: finalTestFile,
    coverage: finalCoverage,
    providerMode: mode,
    agentTimeline: timeline,
  };
}

// Public API: resolves provider from environment variables.
export async function runPipeline(request: AnalyzeRequest): Promise<AnalysisResult> {
  const { provider, mode } = getProvider();
  return _runPipelineImpl(request, provider, mode);
}

// Fallback: runs with MockProvider and marks providerMode honestly.
// Used when PROVIDER=api fails and ENABLE_PROVIDER_FALLBACK=true.
export async function runPipelineMockFallback(request: AnalyzeRequest): Promise<AnalysisResult> {
  return _runPipelineImpl(request, new MockProvider(), "API mode → Mock fallback");
}

function linkTestsToRisks(risks: RiskItem[], tests: TestCase[]): RiskItem[] {
  return risks.map((risk) => ({
    ...risk,
    linkedTestIds: tests
      .filter((t) => t.linkedRiskIds.includes(risk.id))
      .map((t) => t.id),
  }));
}
