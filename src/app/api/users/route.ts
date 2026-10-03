import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { handleApiError } from "@/lib/api-error";
import { getUsersExceptCurrentUser } from "@/lib/users";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      throw new AppError(
        "Authentication required",
        401,
        "UNAUTHORIZED",
      );
    }

    const users = await getUsersExceptCurrentUser(userId);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return handleApiError(error);
  }
}