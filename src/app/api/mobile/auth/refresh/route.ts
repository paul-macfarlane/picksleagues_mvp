import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {
  createDBRefreshToken,
  getActiveDBRefreshTokenByToken,
  revokeDBRefreshToken,
} from "@/db/refreshTokens";
import { z } from "zod";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_AT,
  REFRESH_TOKEN_EXPIRES_IN,
} from "@/models/refreshTokens";

const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const parsedData = RefreshTokenSchema.safeParse(data);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 400 },
      );
    }

    const { refreshToken } = parsedData.data;
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    ) as jwt.JwtPayload;
    if (!decoded || !decoded.sub || decoded.type !== "refresh") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const storedToken = await getActiveDBRefreshTokenByToken(decoded.token);
    if (!storedToken) {
      return NextResponse.json(
        { error: "Token not found or revoked" },
        { status: 401 },
      );
    }

    const userId = decoded.sub;
    const accessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    const newRefreshToken = jwt.sign(
      { sub: userId, type: "refresh" },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
    );

    await revokeDBRefreshToken(storedToken.token);

    await createDBRefreshToken({
      userId: userId as string,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_AT),
    });

    return NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
