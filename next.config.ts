import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // serverExternalPackages: módulos com binários nativos que não podem ser
  // bundled pelo webpack — devem rodar como Node.js nativo no servidor
  serverExternalPackages: ["pdf-parse", "officeparser"],
};

export default nextConfig;
