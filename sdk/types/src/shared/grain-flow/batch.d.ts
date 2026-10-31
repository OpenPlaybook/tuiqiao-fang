/** Coalesce entity reads without giving the transport batch a UI identity. */
export declare function batchReader<K, V>(load: (keys: K[], signal: AbortSignal) => Promise<Map<K, V>>, maxBatchSize?: number): (key: K, signal: AbortSignal) => Promise<V>;
