# Todo API — Product Spec

## Overview

A REST API for managing todo items. Users can create, read, update, and delete todos. Todos belong to a user and can be organized with tags and priority levels.

## User Stories

- As a user, I want to create a new todo item with a title and optional description so I can track tasks.
- As a user, I want to mark a todo as complete so I can track progress.
- As a user, I want to list all my todos, filtered by status (pending/complete) so I can see what's left.
- As a user, I want to update a todo's title, description, or priority.
- As a user, I want to delete a todo I no longer need.
- As a user, I want to add tags to todos so I can organize them by category.
- As a user, I want to set a due date on a todo and be alerted when it's overdue.

## API Endpoints

### Todos

```
POST   /todos              Create a new todo
GET    /todos              List all todos (with optional filters)
GET    /todos/:id          Get a single todo
PUT    /todos/:id          Update a todo
DELETE /todos/:id          Delete a todo
PATCH  /todos/:id/complete Mark as complete
```

### Tags

```
POST   /todos/:id/tags     Add tag to todo
DELETE /todos/:id/tags/:tag Remove tag from todo
GET    /tags               List all tags used by the user
```

## Business Rules

- Title is required, max 200 characters
- Description is optional, max 2000 characters
- Priority must be one of: low, medium, high, urgent
- Status must be one of: pending, in_progress, complete, cancelled
- Due date must be in ISO 8601 format and must be in the future when created
- Completed todos cannot be moved back to pending
- A todo can have at most 10 tags
- Tag names must be alphanumeric, max 30 characters
- Users can only access their own todos

## Constraints

- All endpoints require authentication (Bearer token)
- Rate limit: 100 requests per minute per user
- Maximum 1000 active todos per user
- Soft delete only — todos are not permanently deleted for 30 days

## Assumptions

- User authentication is handled by a separate auth service
- The API returns JSON
- Timestamps are UTC
- Pagination is not specified — assume offset-based with limit/offset query params
