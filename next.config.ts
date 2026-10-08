import type { NextConfig } from "next";
import { normalizeBasePath } from "./src/lib/site-paths";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "export",
  basePath: normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH),
  trailingSlash: true,
};

export default nextConfig;
