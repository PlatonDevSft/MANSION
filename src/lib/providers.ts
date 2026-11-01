import type { Trade } from "./journal";
export interface EconomyEvent {
  id: string;
  at: string;
  currency: string;
  importance: 1 | 2 | 3;
  title: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  source: string;
}
export interface EconomyProvider {
  events(from: string, to: string): Promise<EconomyEvent[]>;
}
export interface NewsProvider {
  list(cursor?: string): Promise<
    {
      id: string;
      title: string;
      url: string;
      publishedAt: string;
      source: string;
    }[]
  >;
}
export type AgentRole = "strategy" | "psychology" | "risk" | "macro" | "review";
export interface Agent {
  role: AgentRole;
  explain(input: {
    consented: boolean;
    trades: Trade[];
    verifiedMetrics: Record<string, string>;
  }): Promise<{ text: string; evidence: string[] }>;
}
