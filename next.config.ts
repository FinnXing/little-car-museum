import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the repository's reviewed AGENTS.md unchanged when starting dev.
  agentRules: false,
};

export default nextConfig;
