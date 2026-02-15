CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Embedding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resourceId" uuid NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Resource" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_resourceId_Resource_id_fk" FOREIGN KEY ("resourceId") REFERENCES "public"."Resource"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embeddingIndex" ON "Embedding" USING hnsw ("embedding" vector_cosine_ops);