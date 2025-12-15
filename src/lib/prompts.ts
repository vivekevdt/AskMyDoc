import { langfuse } from "./langfuse";

export async function getSystemPrompt(name: string) {
  const prompt = await langfuse.getPrompt(name);
  return prompt?.prompt ?? "You are a helpful assistant.";
}
