export type PathToken = {
    kind: 'field' | 'key' | 'index' | 'capture' | 'wildcard';
    value: string;
};
/** Bounded FIFO: cache hits only read; new entries evict the oldest insertion. */
export declare function cachedPathValue<T>(cache: Map<string, T>, path: string, read: () => T): T;
/** Synchronous transaction-local memoization; released even when acceptance fails. */
export declare function withPathBatch<T>(work: () => T): T;
export declare function parsePath(path: string): readonly PathToken[];
export declare function printPath(tokens: readonly PathToken[]): string;
export declare function canonicalPath(path: string): string;
export declare function matchPath(pattern: string, path: string, options?: {
    prefix?: boolean;
}): Record<string, string> | undefined;
export declare function overlapsPath(a: string, b: string): boolean;
export declare function bindPath(pattern: string, params: Record<string, string>): string;
export declare function pathParent(path: string): string;
