import { z } from "zod";
import { TestCaseSchema } from "../schemas/analysis";

export type { TestCase } from "../schemas/analysis";

export interface ModelOptions {
  max_tokens?: number;
  temperature?: number;
}

export interface AiProvider {
  complete(systemPrompt: string, userPrompt: string, options?: ModelOptions): Promise<string>;
}

export class MockProvider implements AiProvider {
  async complete(_systemPrompt: string, userPrompt: string, _options?: ModelOptions): Promise<string> {
    // Detect which agent is calling based on prompt content
    if (userPrompt.includes("Extract structured information")) {
      return JSON.stringify(mockParsedSpec);
    }
    if (userPrompt.includes("Identify QA risks")) {
      return JSON.stringify(mockRiskRegistry);
    }
    if (userPrompt.includes("Create test matrix")) {
      return JSON.stringify(mockTestMatrix);
    }
    if (userPrompt.startsWith("Generate executable ") && userPrompt.includes("test code from this test matrix")) {
      return [
        "===METADATA===",
        JSON.stringify({ framework: mockTestFile.framework, filename: mockTestFile.filename }),
        "===CODE===",
        mockTestFile.code,
        "===END===",
      ].join("\n");
    }
    if (userPrompt.startsWith("Your previous response did not follow")) {
      return [
        "===METADATA===",
        JSON.stringify({ framework: mockTestFile.framework, filename: mockTestFile.filename }),
        "===CODE===",
        mockTestFile.code,
        "===END===",
      ].join("\n");
    }
    if (userPrompt.includes("Review test coverage")) {
      return JSON.stringify(mockCoverageResult);
    }
    if (userPrompt.includes("targeted revision")) {
      return JSON.stringify(mockRevisedTests);
    }
    return "{}";
  }
}

const mockParsedSpec = {
  title: "User Authentication API",
  detectedScope: "Authentication system with registration, login, token refresh, and password reset",
  userStories: [
    "As a user, I want to register with email and password",
    "As a user, I want to log in and receive a JWT token",
    "As a user, I want to refresh my access token using a refresh token",
    "As a user, I want to reset my password via email",
    "As a user, I want to log out and invalidate my session",
  ],
  businessRules: [
    "Password must be at least 8 characters",
    "Email must be unique",
    "Access tokens expire in a short duration",
    "Refresh tokens are long-lived",
    "Password reset links expire after 1 hour",
    "Rate limiting on login endpoint to prevent brute force",
  ],
  apiEndpoints: [
    "POST /auth/register",
    "POST /auth/login",
    "POST /auth/logout",
    "POST /auth/refresh",
    "POST /auth/password/reset-request",
    "POST /auth/password/reset",
    "GET /auth/me",
  ],
  assumptions: [
    "JWTs are used for access tokens",
    "Email delivery is handled by a third-party service",
    "Tokens are stored server-side for invalidation",
  ],
  constraints: [
    "Password reset token valid for 1 hour",
    "Max 5 failed login attempts before temporary lockout",
    "Access token expiry not specified in the spec",
  ],
};

const mockRiskRegistry = [
  {
    id: "R-001",
    title: "Access token expiry not specified",
    description: "The spec does not define how long access tokens are valid. This could lead to tokens that never expire or expire too quickly.",
    severity: "CRITICAL",
    sourceRef: "Business Rules — token expiry",
    whyItMatters: "Unbounded token lifetime is a critical security vulnerability. If tokens never expire, a stolen token grants permanent access.",
    linkedTestIds: [],
  },
  {
    id: "R-002",
    title: "No rate limit on password reset endpoint",
    description: "The password reset request endpoint is not rate-limited. An attacker can spam reset emails to any address.",
    severity: "HIGH",
    sourceRef: "POST /auth/password/reset-request",
    whyItMatters: "Without rate limiting, the endpoint can be abused for email harassment and to reveal valid email addresses via timing.",
    linkedTestIds: [],
  },
  {
    id: "R-003",
    title: "Refresh token rotation not specified",
    description: "The spec does not mention whether refresh tokens are rotated on use. Reusable refresh tokens are a security risk.",
    severity: "HIGH",
    sourceRef: "POST /auth/refresh",
    whyItMatters: "If refresh tokens are not rotated, a stolen refresh token grants indefinite access even after the user logs out.",
    linkedTestIds: [],
  },
  {
    id: "R-004",
    title: "Concurrent login behavior undefined",
    description: "The spec does not specify whether multiple simultaneous sessions are allowed.",
    severity: "MEDIUM",
    sourceRef: "POST /auth/login",
    whyItMatters: "Without a defined policy, users may accumulate active sessions from forgotten devices.",
    linkedTestIds: [],
  },
  {
    id: "R-005",
    title: "Email enumeration via registration",
    description: "The 409 response on duplicate email reveals whether an email is registered.",
    severity: "MEDIUM",
    sourceRef: "POST /auth/register — 409 response",
    whyItMatters: "Email enumeration enables targeted phishing and credential stuffing attacks.",
    linkedTestIds: [],
  },
  {
    id: "R-006",
    title: "Password reset token not invalidated after use",
    description: "The spec does not state that reset tokens are single-use.",
    severity: "HIGH",
    sourceRef: "POST /auth/password/reset",
    whyItMatters: "A reusable reset token allows an attacker who intercepts one reset email to reset the password multiple times.",
    linkedTestIds: [],
  },
];

const mockTestMatrix = [
  {
    id: "T-001",
    title: "Successful user registration",
    category: "happy_path",
    priority: "HIGH",
    given: "A valid email, password (min 8 chars), and name",
    when: "POST /auth/register is called",
    then: "Returns 201 with user object, accessToken, and refreshToken",
    linkedRiskIds: [],
  },
  {
    id: "T-002",
    title: "Successful login with valid credentials",
    category: "happy_path",
    priority: "HIGH",
    given: "A registered user with valid credentials",
    when: "POST /auth/login is called",
    then: "Returns 200 with accessToken and refreshToken",
    linkedRiskIds: [],
  },
  {
    id: "T-003",
    title: "Registration with password under 8 characters",
    category: "negative_case",
    priority: "HIGH",
    given: "A registration request with password 'abc123' (6 chars)",
    when: "POST /auth/register is called",
    then: "Returns 422 with validation error for password field",
    linkedRiskIds: [],
  },
  {
    id: "T-004",
    title: "Login with wrong password",
    category: "negative_case",
    priority: "HIGH",
    given: "A registered user and an incorrect password",
    when: "POST /auth/login is called",
    then: "Returns 401, does not reveal whether email is valid",
    linkedRiskIds: ["R-005"],
  },
  {
    id: "T-005",
    title: "Token refresh with valid refresh token",
    category: "api_validation",
    priority: "HIGH",
    given: "A valid, unexpired refresh token",
    when: "POST /auth/refresh is called",
    then: "Returns 200 with new accessToken",
    linkedRiskIds: [],
  },
  {
    id: "T-006",
    title: "Rate limiting on login after 5 failed attempts",
    category: "edge_case",
    priority: "HIGH",
    given: "5 consecutive failed login attempts for the same email",
    when: "A 6th login attempt is made",
    then: "Returns 429 and account is temporarily locked",
    linkedRiskIds: [],
  },
  {
    id: "T-007",
    title: "Password reset token used twice",
    category: "abuse_case",
    priority: "HIGH",
    given: "A valid password reset token that has already been used",
    when: "POST /auth/password/reset is called again with the same token",
    then: "Returns 400 — token already used",
    linkedRiskIds: ["R-006"],
  },
  {
    id: "T-008",
    title: "Regression: logout invalidates token",
    category: "regression",
    priority: "MEDIUM",
    given: "A logged-in user with a valid access token",
    when: "POST /auth/logout is called, then GET /auth/me is called with the same token",
    then: "GET /auth/me returns 401",
    linkedRiskIds: [],
  },
];

const mockTestFile = {
  framework: "playwright",
  filename: "auth-api.spec.ts",
  code: `import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('User Authentication API', () => {
  let accessToken: string;
  let refreshToken: string;
  const testUser = {
    email: \`test-\${Date.now()}@example.com\`,
    password: 'SecurePassword123',
    name: 'Test User',
  };

  test.describe('Registration', () => {
    test('T-001: Successful user registration', async ({ request }) => {
      const res = await request.post(\`\${BASE_URL}/auth/register\`, {
        data: testUser,
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe(testUser.email);
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
      accessToken = body.accessToken;
      refreshToken = body.refreshToken;
    });

    test('T-003: Registration with password under 8 characters', async ({ request }) => {
      const res = await request.post(\`\${BASE_URL}/auth/register\`, {
        data: { ...testUser, password: 'abc123', email: 'other@example.com' },
      });
      expect(res.status()).toBe(422);
    });
  });

  test.describe('Login', () => {
    test('T-002: Successful login with valid credentials', async ({ request }) => {
      const res = await request.post(\`\${BASE_URL}/auth/login\`, {
        data: { email: testUser.email, password: testUser.password },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.accessToken).toBeDefined();
    });

    test('T-004: Login with wrong password — no email enumeration', async ({ request }) => {
      const res = await request.post(\`\${BASE_URL}/auth/login\`, {
        data: { email: testUser.email, password: 'wrongpassword' },
      });
      expect(res.status()).toBe(401);
      const body = await res.json();
      expect(JSON.stringify(body)).not.toContain('email');
    });

    test('T-006: Rate limiting after 5 failed login attempts', async ({ request }) => {
      const failedLogin = () => request.post(\`\${BASE_URL}/auth/login\`, {
        data: { email: 'ratelimit@example.com', password: 'wrong' },
      });
      for (let i = 0; i < 5; i++) await failedLogin();
      const res = await failedLogin();
      expect(res.status()).toBe(429);
    });
  });

  test.describe('Token Management', () => {
    test('T-005: Token refresh with valid refresh token', async ({ request }) => {
      const res = await request.post(\`\${BASE_URL}/auth/refresh\`, {
        data: { refreshToken },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.accessToken).toBeDefined();
    });

    test('T-008: Regression — logout invalidates token', async ({ request }) => {
      await request.post(\`\${BASE_URL}/auth/logout\`, {
        headers: { Authorization: \`Bearer \${accessToken}\` },
      });
      const res = await request.get(\`\${BASE_URL}/auth/me\`, {
        headers: { Authorization: \`Bearer \${accessToken}\` },
      });
      expect(res.status()).toBe(401);
    });
  });

  test.describe('Abuse Cases', () => {
    test('T-007: Password reset token used twice', async ({ request }) => {
      // Request reset
      await request.post(\`\${BASE_URL}/auth/password/reset-request\`, {
        data: { email: testUser.email },
      });
      // Note: in a real test, extract token from email
      const fakeToken = 'already-used-token';
      const res1 = await request.post(\`\${BASE_URL}/auth/password/reset\`, {
        data: { token: fakeToken, newPassword: 'NewPassword123' },
      });
      const res2 = await request.post(\`\${BASE_URL}/auth/password/reset\`, {
        data: { token: fakeToken, newPassword: 'AnotherPassword123' },
      });
      expect(res2.status()).toBe(400);
    });
  });
});`,
};

const mockCoverageResult = {
  score: 72,
  summary: "Good coverage of core authentication flows. Critical gap: no tests for access token expiry (R-001). High risk R-003 (refresh token rotation) also uncovered.",
  gaps: [
    "R-001 (CRITICAL): No test verifies access token expiry behavior",
    "R-002 (HIGH): No test verifies rate limiting on password reset endpoint",
    "R-003 (HIGH): No test verifies refresh token rotation on use",
    "Missing test category: edge_case for token boundary conditions",
  ],
  reviewerFeedback: "Coverage gaps detected on CRITICAL risk R-001 and HIGH risks R-002, R-003. Triggering Test Planner revision to add targeted tests.",
  plannerRevised: true,
};

export const mockRevisedTests = z.array(TestCaseSchema).parse([
  {
    id: "T-009",
    title: "Access token expiry — expired token rejected",
    category: "edge_case",
    priority: "HIGH",
    given: "An access token that has passed its expiry time",
    when: "GET /auth/me is called with the expired token",
    then: "Returns 401 with error indicating token has expired",
    linkedRiskIds: ["R-001"],
  },
  {
    id: "T-010",
    title: "Rate limiting on password reset request",
    category: "abuse_case",
    priority: "HIGH",
    given: "More than 5 password reset requests for the same email in a short window",
    when: "POST /auth/password/reset-request is called repeatedly",
    then: "Returns 429 after the rate limit is exceeded",
    linkedRiskIds: ["R-002"],
  },
  {
    id: "T-011",
    title: "Refresh token invalidated after use",
    category: "edge_case",
    priority: "HIGH",
    given: "A valid refresh token that has been used once to get a new access token",
    when: "POST /auth/refresh is called again with the same refresh token",
    then: "Returns 401 — refresh token already consumed",
    linkedRiskIds: ["R-003"],
  },
]);
