import { prisma } from "@/lib/prisma";
import { requireConversationParticipant } from "@/lib/authorization";

export async function getConversationMessages(
  conversationId: string,
  userId: string,
) {
  await requireConversationParticipant(conversationId, userId);

  return prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      senderId: true,
      content: true,
      createdAt: true,
    },
  });
}