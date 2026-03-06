/**
 * API error for non-2xx responses (except 429).
 * @see https://developer.epages.com/apps/response-codes.html
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Thrown when the API returns 429 Too Many Requests (rate limit exceeded).
 * @see https://developer.epages.com/apps/api-call-limit.html
 */
export class TooManyRequestsError extends ApiError {
  constructor(message: string, body?: unknown) {
    super(message, 429, body);
    this.name = "TooManyRequestsError";
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

/**
 * Thrown when client configuration is missing or invalid (e.g. no host/shop).
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}
