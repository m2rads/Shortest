import { BrowserConfig } from './browser';
import { AIConfig } from './ai';

export interface ShortestConfig {
  headless?: boolean;
  baseUrl?: string;
  testDir?: string | string[];
  anthropicKey?: string;
}

// Add a new type for internal use
export interface ResolvedConfig {
  headless: boolean;
  baseUrl: string;
  testDir: string | string[];
  anthropicKey: string;
}

export function resolveConfig(config: ShortestConfig): ResolvedConfig {
  return {
    headless: config.headless ?? false,
    baseUrl: config.baseUrl ?? 'http://localhost:3000',
    testDir: config.testDir ?? '__tests__',
    anthropicKey: config.anthropicKey ?? process.env.ANTHROPIC_API_KEY ?? ''
  };
}

export const defaultConfig: ShortestConfig = {
  headless: false,
  baseUrl: 'http://localhost:3000',
  testDir: '__tests__',
  anthropicKey: process.env.ANTHROPIC_API_KEY || ''
}; 