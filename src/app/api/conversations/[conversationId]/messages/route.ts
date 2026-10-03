import { handleApiError } from "@/lib/api-error";
import { getAuthenticatedUserId } from "@/lib/auth";
import { requireConversationParticipant } from "@/lib/authorization";
import { AppError } from "@/lib/errors";
import { getConversationMessages } from "@/lib/messages";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createMessageSchema = z.object({
  content: z.string().trim().min(1),
});

export async function GET(request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const { conversationId } = await params;

    const messages = await getConversationMessages(conversationId, userId);

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const { conversationId } = await params;

    let body;

    try {
      body = await request.json();
    } catch {
      throw new AppError("Invalid JSON body", 400, "INVALID_JSON");
    }

    const validation = createMessageSchema.safeParse(body);

    if (!validation.success) {
      throw new AppError("Invalid message content", 400, "INVALID_INPUT");
    }

    const { content } = validation.data;

    await requireConversationParticipant(conversationId, userId);

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
      },
    });

    const { id, senderId, createdAt } = message;

    return NextResponse.json(
      {
        success: true,
        data: {
          id,
          conversationId,
          senderId,
          content,
          createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
