/**
 * The narrow Cloudflare surface used by application storage code.
 *
 * Keeping these structural types here makes the provider dependency explicit
 * without inventing a provider-neutral framework.
 */
export interface D1ResultLike<T = unknown> {
  results?: T[];
  success: boolean;
}

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  all<T = Record<string, unknown>>(): Promise<D1ResultLike<T>>;
  run<T = Record<string, unknown>>(): Promise<D1ResultLike<T>>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
  batch<T = Record<string, unknown>>(
    statements: D1PreparedStatementLike[],
  ): Promise<D1ResultLike<T>[]>;
}

export interface R2ObjectLike {
  body?: ReadableStream<Uint8Array> | null;
  httpEtag: string;
  size: number;
  writeHttpMetadata(headers: Headers): void;
}

export interface R2BucketLike {
  get(key: string): Promise<R2ObjectLike | null>;
  head(key: string): Promise<R2ObjectLike | null>;
}

export type BackendEnv = {
  DB?: D1DatabaseLike;
  PACKS?: R2BucketLike;
};
