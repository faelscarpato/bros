import type { ComponentType } from "react";
import { TextAI } from "@/apps/text-ai/TextAI";
import { CodeAI } from "@/apps/code-ai/CodeAI";
import { VisionAI } from "@/apps/vision-ai/VisionAI";
import { DataAI } from "@/apps/data-ai/DataAI";
import { AgentOS } from "@/apps/agent-os/AgentOS";
import { TerminalAI } from "@/apps/terminal-ai/TerminalAI";
import { AISettings } from "@/apps/settings/AISettings";

export interface AppMeta {
  id: string;
  name: string;
  icon: string;
  accent: "green" | "blue" | "yellow" | "neutral";
  description: string;
  component: ComponentType;
  defaultSize?: { width: number; height: number };
}

/**
 * App Registry. To add a new BrOS app:
 * 1. create its component under src/apps/<id>/
 * 2. import and append an AppMeta below.
 * The Dock and Window Manager pick it up automatically.
 */
export const APPS: AppMeta[] = [
  { id: "text-ai", name: "TextAI", icon: "✎", accent: "green", description: "Escrever, revisar e traduzir com IA.", component: TextAI, defaultSize: { width: 920, height: 600 } },
  { id: "code-ai", name: "CodeAI", icon: "</>", accent: "blue", description: "Gerar, explicar e refatorar código.", component: CodeAI, defaultSize: { width: 980, height: 620 } },
  { id: "vision-ai", name: "VisionAI", icon: "◉", accent: "yellow", description: "Conceitos e prompts visuais.", component: VisionAI, defaultSize: { width: 880, height: 600 } },
  { id: "data-ai", name: "DataAI", icon: "≡", accent: "green", description: "Insights sobre dados tabulares.", component: DataAI, defaultSize: { width: 960, height: 620 } },
  { id: "agent-os", name: "AgentOS", icon: "◆", accent: "blue", description: "Crie e converse com agentes de IA.", component: AgentOS, defaultSize: { width: 1000, height: 640 } },
  { id: "terminal-ai", name: "TerminalAI", icon: "▸_", accent: "neutral", description: "Terminal explicativo por IA.", component: TerminalAI, defaultSize: { width: 760, height: 500 } },
  { id: "settings", name: "IA Settings", icon: "⚙", accent: "neutral", description: "Provedores e modelos de IA.", component: AISettings, defaultSize: { width: 880, height: 600 } },
];

export const getApp = (id: string) => APPS.find((a) => a.id === id);