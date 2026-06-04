import { ChatGroq } from "@langchain/groq";
import type { z } from "zod";

export function isGrokEnabled(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export function createGrokModel(): ChatGroq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }
  return new ChatGroq({
    model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    temperature: 0.2,
    apiKey,
  });
}

export async function grokStructuredOutput<T extends z.ZodTypeAny>(
  schema: T,
  prompt: string,
): Promise<z.infer<T>> {
  const model = createGrokModel();
  const structured = model.withStructuredOutput(schema);
  return structured.invoke(prompt) as Promise<z.infer<T>>;
}
