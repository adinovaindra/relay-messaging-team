import { prisma } from "@/lib/prisma";

export async function getUserConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          senderId: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  return conversations.map((conversation) => {
    const counterpart = conversation.participants.find((participant) => participant.userId !== userId)!;

    const lastMessage = conversation.messages[0] ?? null;

    return {
      conversationId: conversation.id,
      counterpart: {
        id: counterpart.user.id,
        name: counterpart.user.name,
      },
      lastMessage,
      updatedAt: lastMessage?.createdAt ?? conversation.createdAt,
    };
  }).sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}
