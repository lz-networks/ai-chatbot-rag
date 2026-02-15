import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { createResource } from "@/lib/db/queries";

export const addResource = ({ session }: { session: Session }) =>
  tool({
    description:
      "Add a resource to the shared knowledge base. Only admins can use this tool. If a user provides information to store, use this tool.",
    inputSchema: z.object({
      content: z
        .string()
        .describe("the content or resource to add to the knowledge base"),
    }),
    execute: async ({ content }) => {
      if (session.user.type !== "admin") {
        return "Error: Only admins can add resources to the knowledge base.";
      }
      return createResource({ content });
    },
  });
