import { tool } from "ai";
import { z } from "zod";
import { findRelevantContent } from "../embedding";

export const getKnowledge = tool({
  description:
    "Search the knowledge base to answer user questions. Use this tool when users ask questions that might be answered by the knowledge base.",
  inputSchema: z.object({
    question: z.string().describe("the user's question"),
    similarQuestions: z
      .array(z.string())
      .describe("similar phrasings or keywords to broaden the search"),
  }),
  execute: async ({ question, similarQuestions }) => {
    const queries = [question, ...similarQuestions];
    const results = await Promise.all(queries.map(findRelevantContent));
    const uniqueResults = Array.from(
      new Map(
        results
          .flat()
          .map((item) => [item?.name, item])
      ).values()
    );
    return uniqueResults;
  },
});
