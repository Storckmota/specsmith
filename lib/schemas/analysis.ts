import { z } from "zod";

export const InputTypeSchema = z.enum([
  "prd",
  "openapi",
  "github_issue",
  "plain_spec",
]);

export const FrameworkSchema = z.enum(["playwright", "jest", "pytest"]);

export const SeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const TestCategorySchema = z.enum([
  "happy_path",
  "edge_case",
  "negative_case",
  "regression",
  "api_validation",
  "abuse_case",
]);

export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const AnalyzeRequestSchema = z.object({
  specText: z.string().min(10).max(50000),
  inputType: InputTypeSchema,
  framework: FrameworkSchema,
});

export const ParsedSpecSchema = z.object({
  title: z.string(),
  detectedScope: z.string(),
  userStories: z.array(z.string()),
  businessRules: z.array(z.string()),
  apiEndpoints: z.array(z.string()),
  assumptions: z.array(z.string()),
  constraints: z.array(z.string()),
});

export const RiskItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: SeveritySchema,
  sourceRef: z.string(),
  whyItMatters: z.string(),
  linkedTestIds: z.array(z.string()),
});

export const TestCaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: TestCategorySchema,
  priority: PrioritySchema,
  given: z.string(),
  when: z.string(),
  then: z.string(),
  linkedRiskIds: z.array(z.string()),
});

export const TestFileSchema = z.object({
  framework: FrameworkSchema,
  filename: z.string(),
  code: z.string(),
});

export const CoverageResultSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  gaps: z.array(z.string()),
  reviewerFeedback: z.string(),
  plannerRevised: z.boolean(),
});

export const AnalysisResultSchema = z.object({
  summary: z.object({
    title: z.string(),
    inputType: InputTypeSchema,
    detectedScope: z.string(),
  }),
  riskRegistry: z.array(RiskItemSchema),
  testMatrix: z.array(TestCaseSchema),
  testFile: TestFileSchema,
  coverage: CoverageResultSchema,
  providerMode: z.string(),
  agentTimeline: z.array(
    z.object({
      agent: z.string(),
      status: z.enum(["pending", "running", "complete", "revision"]),
      message: z.string().optional(),
    })
  ),
});

export type InputType = z.infer<typeof InputTypeSchema>;
export type Framework = z.infer<typeof FrameworkSchema>;
export type Severity = z.infer<typeof SeveritySchema>;
export type TestCategory = z.infer<typeof TestCategorySchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type ParsedSpec = z.infer<typeof ParsedSpecSchema>;
export type RiskItem = z.infer<typeof RiskItemSchema>;
export type TestCase = z.infer<typeof TestCaseSchema>;
export type TestFile = z.infer<typeof TestFileSchema>;
export type CoverageResult = z.infer<typeof CoverageResultSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
