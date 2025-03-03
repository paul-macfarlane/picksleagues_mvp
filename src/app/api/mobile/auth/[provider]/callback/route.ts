import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { createDBUser, getDBUserByEmail } from "@/db/users";
import { createDBRefreshToken } from "@/db/refreshTokens";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_AT,
  REFRESH_TOKEN_EXPIRES_IN,
} from "@/models/refreshTokens";
import { generateUserName } from "@/services/users";
import { z } from "zod";
import { BadInputError } from "@/models/errors";

const googleClient = new OAuth2Client({
  clientId: process.env.MOBILE_GOOGLE_ID,
  clientSecret: process.env.MOBILE_GOOGLE_SECRET,
});

type GenerateTokensResponse = {
  accessToken: string;
  refreshToken: string;
};

function generateTokens(userId: string): GenerateTokensResponse {
  const accessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(
    { sub: userId, type: "refresh", token: accessToken },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
  );

  return { accessToken, refreshToken };
}

const CallbackQuerySchema = z.object({
  code: z.string(),
  state: z.string().optional(),
  error: z.string().optional(),
});

async function handleGoogleAuth(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      code: searchParams.get("code") || "",
      state: searchParams.get("state") || undefined,
      error: searchParams.get("error") || undefined,
    };

    const parsedParams = CallbackQuerySchema.safeParse(queryParams);
    if (!parsedParams.success) {
      throw new BadInputError(parsedParams.error.message);
    }

    if (parsedParams.data.error) {
      throw new BadInputError(
        `Authentication failed: ${parsedParams.data.error}`,
      );
    }

    const { tokens: googleTokens } = await googleClient.getToken({
      code: parsedParams.data.code,
      redirect_uri: `${process.env.NEXT_PUBLIC_HOST}/api/mobile/auth/google/callback`,
    });

    console.log("googleTokens", googleTokens);

    const ticket = await googleClient.verifyIdToken({
      idToken: googleTokens.id_token!,
      audience: process.env.MOBILE_GOOGLE_ID,
    });

    console.log("ticket", ticket);

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new BadInputError("Invalid credentials");
    }

    console.log("payload", payload);

    // Get or create the user
    let isNewUser = false;
    let dbUser = await getDBUserByEmail(payload.email);
    if (!dbUser) {
      const username = await generateUserName(payload.email);
      if (!username) {
        throw new Error("Failed to generate username");
      }

      dbUser = await createDBUser({
        name: payload.name || "User",
        email: payload.email || null,
        image: payload.picture || null,
        firstName: payload.given_name || "First",
        lastName: payload.family_name || "Last",
        emailVerified: payload.email_verified ? new Date() : null,
        username,
      });
      isNewUser = true;

      console.log("dbUser", dbUser);
    }

    const tokens = generateTokens(dbUser.id);

    console.log("tokens", tokens);

    await createDBRefreshToken({
      userId: dbUser.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_AT),
    });

    console.log("created refresh token");

    const redirectUrl = new URL(process.env.MOBILE_URL_BASE!);
    redirectUrl.searchParams.append("accessToken", tokens.accessToken);
    redirectUrl.searchParams.append("refreshToken", tokens.refreshToken);
    redirectUrl.searchParams.append(
      "userData",
      encodeURIComponent(JSON.stringify(dbUser)),
    );
    redirectUrl.searchParams.append("isNewUser", isNewUser.toString());

    console.log("redirectUrl", redirectUrl);

    if (parsedParams.data.state) {
      redirectUrl.searchParams.append("state", parsedParams.data.state);
      console.log("added state", parsedParams.data.state);
    }

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Google auth callback error:", error);

    const redirectUrl = new URL(process.env.MOBILE_URL_BASE!);
    redirectUrl.searchParams.append(
      "error",
      error instanceof Error ? error.message : "Authentication failed",
    );

    return NextResponse.redirect(redirectUrl.toString());
  }
}

async function handleDiscordAuth(request: NextRequest) {
  try {
    console.log("handleDiscordAuth");

    const { searchParams } = new URL(request.url);

    const queryParams = {
      code: searchParams.get("code") || "",
      state: searchParams.get("state") || undefined,
      error: searchParams.get("error") || undefined,
    };

    const parsedParams = CallbackQuerySchema.safeParse(queryParams);
    if (!parsedParams.success) {
      console.log("failed to parse params", parsedParams.error);
      throw new BadInputError(parsedParams.error.message);
    }

    if (parsedParams.data.error) {
      console.log("authentication failed", parsedParams.data.error);
      throw new BadInputError(
        `Authentication failed: ${parsedParams.data.error}`,
      );
    }

    console.log("data", parsedParams.data);

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.MOBILE_DISCORD_ID!,
        client_secret: process.env.MOBILE_DISCORD_SECRET!,
        grant_type: "authorization_code",
        code: parsedParams.data.code,
        redirect_uri: `${process.env.NEXT_PUBLIC_HOST}/api/mobile/auth/discord/callback`,
      }),
    });
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new BadInputError(
        `Discord token exchange failed: ${JSON.stringify(errorData)}`,
      );
    }

    console.log("tokenResponse", tokenResponse);

    const tokens = await tokenResponse.json();
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    if (!userResponse.ok) {
      throw new BadInputError("Failed to fetch Discord user info");
    }

    console.log("userResponse", userResponse);

    const discordUser = await userResponse.json();
    if (!discordUser.email) {
      throw new BadInputError("Email not provided by Discord");
    }

    console.log("discordUser", discordUser);

    let isNewUser = false;
    let dbUser = await getDBUserByEmail(discordUser.email);
    if (!dbUser) {
      const username = await generateUserName(discordUser.email);
      if (!username) {
        console.log("failed to generate username", discordUser);
        throw new Error("Failed to generate username");
      }

      dbUser = await createDBUser({
        name: discordUser.global_name || "User",
        email: discordUser.email || null,
        image: null,
        firstName: "First",
        lastName: "Last",
        emailVerified: discordUser.verified ? new Date() : null,
        username,
      });
      isNewUser = true;
    }

    console.log("dbUser", dbUser);

    const jwtTokens = generateTokens(dbUser.id);

    console.log("jwtTokens", jwtTokens);

    await createDBRefreshToken({
      userId: dbUser.id,
      token: jwtTokens.refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_AT),
    });

    const redirectUrl = new URL(process.env.MOBILE_URL_BASE!);
    redirectUrl.searchParams.append("accessToken", jwtTokens.accessToken);
    redirectUrl.searchParams.append("refreshToken", jwtTokens.refreshToken);
    redirectUrl.searchParams.append("userId", dbUser.id);
    redirectUrl.searchParams.append("isNewUser", isNewUser.toString());

    console.log("redirectUrl", redirectUrl);

    if (parsedParams.data.state) {
      redirectUrl.searchParams.append("state", parsedParams.data.state);
      console.log("setting state", parsedParams.data.state);
    }

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Discord auth callback error:", error);

    const redirectUrl = new URL(process.env.MOBILE_URL_BASE!);
    redirectUrl.searchParams.append(
      "error",
      error instanceof Error ? error.message : "Authentication failed",
    );

    return NextResponse.redirect(redirectUrl.toString());
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  switch (provider) {
    case "google":
      return handleGoogleAuth(request);
    case "discord":
      return handleDiscordAuth(request);
    default:
      return NextResponse.json(
        { error: "Provider not supported" },
        { status: 400 },
      );
  }
}
