export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>
  ) { super(message) }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super("NOT_FOUND", `${resource} not found`, 404, { resource, id })
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super("FORBIDDEN", message, 403)
  }
}

export class ValidationError extends AppError {
  constructor(errors: Record<string, string[]>) {
    super("VALIDATION_ERROR", "Validation failed", 422, { errors })
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super("RATE_LIMITED", "Too many requests", 429)
  }
}
