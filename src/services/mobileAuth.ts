import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  ApplicationError,
  AuthenticationError,
  BadInputError,
} from "@/models/errors";

export function extractJwtToken(request: NextRequest): string {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("Missing or invalid authorization token");
  }

  return authHeader.substring(7);
}

export function authenticateMobileRequest(request: NextRequest): string {
  try {
    const token = extractJwtToken(request);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;

    if (!decoded || !decoded.sub) {
      throw new AuthenticationError("Invalid token");
    }

    return decoded.sub;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError("Invalid authentication token");
    }

    console.error("Unexpected authentication error:", error);
    throw new AuthenticationError("Authentication failed");
  }
}

/**
 * Error handler for mobile API routes
 * Formats errors into a consistent response format
 *
 * @param error The error that occurred
 * @returns A formatted Next.js response
 */
export function handleMobileApiError(error: unknown): NextResponse {
  console.error("Mobile API error:", error);

  if (
    error instanceof AuthenticationError ||
    error instanceof jwt.JsonWebTokenError
  ) {
    return NextResponse.json(
      {
        error:
          error instanceof AuthenticationError
            ? error.message
            : "Invalid authentication token",
      },
      { status: 401 },
    );
  }

  if (error instanceof ApplicationError) {
    const response: {
      error: string;
      errors?: Record<string, string | undefined>;
    } = {
      error: error.message,
    };

    if (error instanceof BadInputError) {
      response.errors = error.errors;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 },
  );
}
