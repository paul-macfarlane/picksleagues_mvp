export class ApplicationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}

export class BadInputError extends ApplicationError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, ApplicationError.prototype);
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
