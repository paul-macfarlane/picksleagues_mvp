import { NextRequest, NextResponse } from "next/server";
import { getDBUserById } from "@/db/users";
import { NotFoundError } from "@/models/errors";
import { updateUserProfile } from "@/services/users";
import {
  authenticateMobileRequest,
  handleMobileApiError,
} from "@/services/mobileAuth";

export async function GET(request: NextRequest) {
  try {
    const userId = authenticateMobileRequest(request);

    const user = await getDBUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleMobileApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = authenticateMobileRequest(request);

    const data = await request.json();
    const updatedUser = await updateUserProfile(userId, data);

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return handleMobileApiError(error);
  }
}
