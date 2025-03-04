export class ApplicationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}

export class BadInputError<T extends Record<string, string | undefined> = Record<string, string | undefined>> extends ApplicationError {
  errors?: T;

  constructor(message: string, errors?: T) {
    super(message, 400);
    this.errors = errors;
    Object.setPrototypeOf(this, BadInputError.prototype);
  }
}

export class NotAllowedError extends ApplicationError {
  constructor(message: string) {
    super(message, 403);
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(message, 404);
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}
