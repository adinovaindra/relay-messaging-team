import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

export async function requireConversationParticipant(conversationId: string, userId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!participant) {
    throw new AppError("You are not a participant of this conversation", 403, "FORBIDDEN");
  }
  return participant;
}
