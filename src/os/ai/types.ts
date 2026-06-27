export type AuthType = "bearer" | "x-api-key" | "none";

export interface Provider {
  id: string;
  name: string;
  baseUrl: string; // e.g. https://api.groq.com/openai/v1
  authType: AuthType;
  apiKey: string;
  models: string[];
  defaultModel: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  providerId: string;
  model: string;
  systemPrompt: string;
  temperature: number;
}

export interface AppModelSelection {
  providerId: string;
  model: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICallOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export type AIResult =
  | { ok: true; text: string; raw: unknown }
  | { ok: false; error: string; code?: number };