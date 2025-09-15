import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  // Ensure Next doesn't pick an incorrect workspace root (multiple lockfiles present)
  outputFileTracingRoot: __dirname,

  // Silence dev warning and allow 127.0.0.1 for HMR and assets
  allowedDevOrigins: ["http://127.0.0.1"],
};

export default nextConfig;
