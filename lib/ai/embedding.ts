import "server-only";

import { embed, embedMany } from "ai";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { MDocument } from "@mastra/rag";
import { embedding } from "../db/schema";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const embeddingModel = "openai/text-embedding-ada-002";

export async function generateChunks(
  input: string
): Promise<string[]> {
  const doc = MDocument.fromMarkdown(input);
  const chunks = await doc.chunk({
    strategy: "markdown",
    headers: [
      ["#", "title"],
      ["##", "section"],
      ["###", "subsection"],
    ],
  });
  return doc.getText().filter((t) => t.trim() !== "");
}

export async function generateEmbeddings(
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> {
  const chunks = await generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
}

export async function generateEmbedding(value: string): Promise<number[]> {
  const input = value.replaceAll("\n", " ");
  const { embedding: embeddingResult } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embeddingResult;
}

export async function findRelevantContent(userQuery: string) {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(embedding.embedding, userQueryEmbedded)})`;
  const similarGuides = await db
    .select({ name: embedding.content, similarity })
    .from(embedding)
    .where(gt(similarity, 0.3))
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  return similarGuides;
}
