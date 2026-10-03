import { handleApiError } from "@/lib/api-error";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getUserConversations } from "@/lib/conversations";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createConversationSchema = z.object({
  targetUserId: z.uuid(),
});

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    let body;

    try {
      body = await request.json();
    } catch {
      throw new AppError("Invalid JSON body", 400, "INVALID_JSON");
    }

    const result = createConversationSchema.safeParse(body);

    if (!result.success) {
      throw new AppError("Invalid request body", 400, "INVALID_INPUT");
    }

    const { targetUserId } = result.data;

    if (userId === targetUserId) {
      throw new AppError("You cannot start a conversation with yourself", 400, "INVALID_RECIPIENT");
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        id: targetUserId,
      },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      throw new AppError("Recipient user is not found", 404, "USER_NOT_FOUND");
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      const existingConversation = await tx.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: { userId },
              },
            },
            {
              participants: {
                some: {
                  userId: targetUserId,
                },
              },
            },
            {
              participants: {
                every: {
                  userId: {
                    in: [userId, targetUserId],
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
        },
      });

      if (existingConversation) {
        const { id } = existingConversation;
        return {
          id,
          created: false,
        };
      } else {
        const newConversation = await tx.conversation.create({
          data: {
            participants: {
              create: [{ userId }, { userId: targetUserId }],
            },
          },
        });

        const { id } = newConversation;
        return {
          id,
          created: true,
        };
      }
    });

    if (transactionResult.created) {
      return NextResponse.json(
        {
          success: true,
          data: {
            conversationId: transactionResult.id,
          },
        },
        { status: 201 },
      );
    } else {
      return NextResponse.json(
        {
          success: true,
          data: {
            conversationId: transactionResult.id,
          },
        },
        { status: 200 },
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const result = await getUserConversations(userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
