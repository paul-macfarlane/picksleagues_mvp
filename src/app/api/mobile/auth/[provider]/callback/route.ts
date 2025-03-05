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
import { createDBAccount } from "@/db/accounts";

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

    const ticket = await googleClient.verifyIdToken({
      idToken: googleTokens.id_token!,
      audience: process.env.MOBILE_GOOGLE_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new BadInputError("Invalid credentials");
    }

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

      await createDBAccount({
        userId: dbUser.id,
        type: "oidc",
        provider: "google",
        providerAccountId: payload.sub!,
        refresh_token: null,
        access_token: googleTokens.access_token ?? null,
        expires_at: googleTokens.expiry_date ?? null,
        token_type: googleTokens.token_type ?? null,
        scope: googleTokens.scope ?? null,
        id_token: googleTokens.id_token ?? null,
        session_state: parsedParams.data.state ?? null,
      });
    }

    const tokens = generateTokens(dbUser.id);

    await createDBRefreshToken({
      userId: dbUser.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_AT),
    });

    const redirectUrl = new URL(process.env.MOBILE_URL_BASE!);
    redirectUrl.searchParams.append("accessToken", tokens.accessToken);
    redirectUrl.searchParams.append("refreshToken", tokens.refreshToken);
    redirectUrl.searchParams.append(
      "userData",
      encodeURIComponent(JSON.stringify(dbUser)),
    );
    redirectUrl.searchParams.append("isNewUser", isNewUser.toString());

    if (parsedParams.data.state) {
      redirectUrl.searchParams.append("state", parsedParams.data.state);
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

interface DiscordTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
  avatar_decoration_data?: {
    sku_id: string;
    asset: string;
  };
}
async function handleDiscordAuth(request: NextRequest) {
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

    const tokens: DiscordTokens = await tokenResponse.json();
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    if (!userResponse.ok) {
      throw new BadInputError("Failed to fetch Discord user info");
    }

    const discordUser: DiscordUser = await userResponse.json();
    if (!discordUser.email) {
      throw new BadInputError("Email not provided by Discord");
    }

    let isNewUser = false;
    let dbUser = await getDBUserByEmail(discordUser.email);
    if (!dbUser) {
      const username = await generateUserName(discordUser.email);
      if (!username) {
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

      await createDBAccount({
        userId: dbUser.id,
        type: "oidc",
        provider: "discord",
        providerAccountId: discordUser.id,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        expires_at: Date.now() + tokens.expires_in,
        token_type: tokens.token_type,
        scope: tokens.scope,
        id_token: null,
        session_state: parsedParams.data.state || null,
      });
    }

    const jwtTokens = generateTokens(dbUser.id);

    await createDBRefreshToken({
      userId: dbUser.id,
      token: jwtTokens.refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_AT),
    });

    const redirectUrl = new URL(process.env.MOBILE_URL_BASE!);
    redirectUrl.searchParams.append("accessToken", jwtTokens.accessToken);
    redirectUrl.searchParams.append("refreshToken", jwtTokens.refreshToken);
    redirectUrl.searchParams.append(
      "userData",
      encodeURIComponent(JSON.stringify(dbUser)),
    );
    redirectUrl.searchParams.append("isNewUser", isNewUser.toString());

    if (parsedParams.data.state) {
      redirectUrl.searchParams.append("state", parsedParams.data.state);
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
