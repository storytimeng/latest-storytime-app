declare module "next-pwa" {
    import { NextConfig } from "next";
  
    interface PWAConfig {
      dest?: string;
      register?: boolean;
      skipWaiting?: boolean;
      disable?: boolean;
      runtimeCaching?: any[];
      buildExcludes?: any[];
      publicExcludes?: any[];
      fallbacks?: any;
      cacheOnFrontEndNav?: boolean;
      subdomainPrefix?: string;
      reloadOnOnline?: boolean;
      customWorkerDir?: string;
      workboxOptions?: any;
    }
  
    function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  
    export = withPWA;
  }
  