import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const AuthorizeQuerySchema = z.object({
  state: z.string().optional(),
});

const providerConfig = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    params: {
      client_id: process.env.MOBILE_GOOGLE_ID!,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
    },
  },
  discord: {
    authUrl: "https://discord.com/api/oauth2/authorize",
    params: {
      client_id: process.env.MOBILE_DISCORD_ID!,
      response_type: "code",
      scope: "identify email",
      prompt: "consent",
    },
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params;

    const { searchParams } = new URL(request.url);
    const queryParams = {
      state: searchParams.get("state") || undefined,
    };

    const parsedParams = AuthorizeQuerySchema.safeParse(queryParams);
    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsedParams.error.message },
        { status: 400 },
      );
    }

    if (!["google", "discord"].includes(provider)) {
      return NextResponse.json(
        { error: "Provider not supported" },
        { status: 400 },
      );
    }

    const config = providerConfig[provider as keyof typeof providerConfig];
    const authUrl = new URL(config.authUrl);
    Object.entries(config.params).forEach(([key, value]) => {
      authUrl.searchParams.append(key, value);
    });
    authUrl.searchParams.append(
      "redirect_uri",
      `${process.env.NEXT_PUBLIC_HOST}/api/mobile/auth/${provider}/callback`,
    );
    if (parsedParams.data.state) {
      authUrl.searchParams.append("state", parsedParams.data.state);
    }

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("Authorization redirect error:", error);
    return NextResponse.json(
      { error: "Failed to create authorization redirect" },
      { status: 500 },
    );
  }
}
