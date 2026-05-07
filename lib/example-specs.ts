export const EXAMPLE_SPECS = {
  "todo-api": {
    label: "Todo API Spec",
    inputType: "plain_spec" as const,
    text: `# Todo API — Product Spec

A REST API for managing todo items. Users can create, read, update, and delete todos.

## User Stories
- As a user, I want to create a new todo item with a title and optional description.
- As a user, I want to mark a todo as complete.
- As a user, I want to list all my todos, filtered by status.
- As a user, I want to update a todo's title, description, or priority.
- As a user, I want to delete a todo I no longer need.
- As a user, I want to add tags to todos.
- As a user, I want to set a due date on a todo.

## API Endpoints
- POST /todos — Create a new todo
- GET /todos — List all todos
- GET /todos/:id — Get a single todo
- PUT /todos/:id — Update a todo
- DELETE /todos/:id — Delete a todo
- PATCH /todos/:id/complete — Mark as complete

## Business Rules
- Title is required, max 200 characters
- Priority must be one of: low, medium, high, urgent
- Status must be one of: pending, in_progress, complete, cancelled
- Due date must be in the future when created
- Completed todos cannot be moved back to pending
- A todo can have at most 10 tags
- Users can only access their own todos

## Constraints
- All endpoints require authentication
- Rate limit: 100 requests per minute per user
- Maximum 1000 active todos per user`,
  },

  "checkout-flow": {
    label: "Checkout Flow PRD",
    inputType: "prd" as const,
    text: `# Checkout Flow — Product Requirements Document

Redesign the checkout flow to reduce cart abandonment. The new flow should be single-page, support guest checkout, and add Apple Pay and Google Pay.

## Goals
- Increase checkout completion rate to 55%+
- Support guest checkout without account creation
- Add Apple Pay and Google Pay

## User Stories
- As a guest user, I want to check out without creating an account.
- As a user, I want to pay with credit/debit card, Apple Pay, or Google Pay.
- As a user, I want to see an itemized order summary before paying.
- As a user, I want to apply a promo code before paying.
- As a user, I want an order confirmation immediately after payment.

## Business Rules
- Promo codes are case-insensitive and single-use per user
- Promo codes cannot be stacked
- Tax calculated based on shipping address state
- Shipping is free for orders over $75
- Payment must be authorized before order is created
- If payment fails, the cart must remain intact
- Out-of-stock items must be removed from cart before checkout proceeds

## Edge Cases
- Item goes out of stock between cart and checkout
- Session expires mid-checkout
- User navigates back after payment authorization`,
  },

  "user-auth": {
    label: "User Auth OpenAPI",
    inputType: "openapi" as const,
    text: `openapi: 3.0.3
info:
  title: User Authentication API
  description: API for user registration, login, token management, and password reset
  version: 1.0.0

paths:
  /auth/register:
    post:
      summary: Register a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              required: [email, password, name]
              properties:
                email: { type: string, format: email }
                password: { type: string, minLength: 8 }
                name: { type: string, maxLength: 100 }
      responses:
        '201': { description: User created }
        '409': { description: Email already registered }

  /auth/login:
    post:
      summary: Login with email and password
      responses:
        '200': { description: Login successful with JWT tokens }
        '401': { description: Invalid credentials }
        '429': { description: Too many failed attempts }

  /auth/refresh:
    post:
      summary: Refresh access token
      responses:
        '200': { description: New access token }
        '401': { description: Invalid refresh token }

  /auth/password/reset-request:
    post:
      summary: Request password reset email
      responses:
        '200': { description: Always returns 200 to prevent enumeration }

  /auth/password/reset:
    post:
      summary: Reset password with token
      responses:
        '200': { description: Password reset }
        '400': { description: Invalid or expired token }`,
  },
} as const;
