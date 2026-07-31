/// <reference types="@cloudflare/vitest-pool-workers/types" />

declare module "cloudflare:workers" {
  export const env: {
    DB: import("../../server/cloudflare").D1DatabaseLike;
    PACKS: import("../../server/cloudflare").R2BucketLike & {
      put(
        key: string,
        value: string,
        options?: {
          httpMetadata?: {
            contentType?: string;
          };
        },
      ): Promise<unknown>;
      list(options?: {
        prefix?: string;
      }): Promise<{ objects: Array<{ key: string }> }>;
    };
    TEST_MIGRATIONS: unknown[];
  };

  export const exports: {
    default: {
      fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
    };
  };
}
