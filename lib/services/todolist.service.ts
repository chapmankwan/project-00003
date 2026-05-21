import { connectToDatabase } from "@/lib/mongodb";
import { TodoList } from "@/models";

const SYSTEM_LIST_CONFIG = {
  inbox: {
    title: "Inbox",
    slug: "inbox",
  },

  today: {
    title: "Today",
    slug: "today",
  },

  scheduled: {
    title: "Scheduled",
    slug: "scheduled",
  },

  flagged: {
    title: "Flagged",
    slug: "flagged",
  },
} as const;

export type SystemListKey = keyof typeof SYSTEM_LIST_CONFIG;

export async function getOrCreateSystemList(
  userId: string,
  systemKey: SystemListKey
) {
  await connectToDatabase();

  const config = SYSTEM_LIST_CONFIG[systemKey];

  return await TodoList.findOneAndUpdate(
    {
      userId,
      systemKey,
    },
    {
      $setOnInsert: {
        userId,

        title: config.title,
        slug: config.slug,

        type: "system",
        systemKey,

        hidden: true,

        tasks: [],
      },
    },
    {
      new: true,
      upsert: true,
    }
  ).lean();
}