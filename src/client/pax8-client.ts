import { Pax8ClientConfig, ResolvedPax8ClientConfig, validateConfig } from './config';

/**
 * Main entry point for interacting with the Pax8 API. Handles configuration and authentication lifecycle.
 */
export class Pax8Client {
  private readonly config: ResolvedPax8ClientConfig;

  constructor(config: Pax8ClientConfig) {
    this.config = validateConfig(config);
  }

  /** Current client configuration with defaults applied. */
  get configuration(): ResolvedPax8ClientConfig {
    return { ...this.config };
  }
}
