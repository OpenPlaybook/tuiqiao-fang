export type JsonStoreRecord = Record<string, unknown>;
export declare function jsonStorePaths(directory: string): {
    root: string;
    snapshot: string;
    ops: string;
    temp: string;
    lockTarget: string;
};
export type StoreCommit = {
    operation: JsonStoreRecord;
} | {
    reset: true;
};
/** In-process commit notification; this never watches or scans the filesystem. */
export declare function subscribeStoreCommits(directory: string, notify: (change: StoreCommit) => void): () => void;
/** Coordinate a domain read/merge/write across hosts; independent of compaction. */
export declare function withStoreWriteLock<T>(directory: string, run: () => Promise<T>): Promise<T>;
/** Publish one immutable operation. Never reads historical data or waits for maintenance. */
export declare function appendStoreOperation(directory: string, value: JsonStoreRecord): Promise<{
    fileName: string;
    filePath: string;
}>;
export type StoreSnapshot = {
    value: JsonStoreRecord;
    stamp: string;
    operations: readonly string[];
    changedKeys: readonly string[];
};
/** Reuse unchanged records; only replay new operations. Compaction starts a new snapshot. */
export declare function readStoreIncremental(directory: string, previous?: StoreSnapshot, options?: {
    signal?: AbortSignal;
}): Promise<StoreSnapshot>;
export declare function readStore<T extends JsonStoreRecord = JsonStoreRecord>(directory: string): Promise<T>;
export declare function compactStore(directory: string): Promise<void>;
export declare function resetStore(directory: string): Promise<void>;
/** Threshold maintenance belongs to trusted service reads, never to append. */
export declare function maintainStore(directory: string): Promise<void>;
