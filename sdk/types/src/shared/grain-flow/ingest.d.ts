import { type QueryClient } from '@tanstack/query-core';
import type { DataRegistry } from './registry';
export type CommitOrigin = {
    kind: "write";
} | {
    kind: "read";
    epoch: number;
};
export type ListPage = {
    items: readonly Record<string, unknown>[];
    /** Authoritative page membership; facts may be supplied separately. */
    keys?: readonly string[];
    next: unknown | null;
    total?: number;
    removedKeys?: readonly string[];
};
type ListState = {
    pages: {
        cursor: unknown;
        keys: string[];
        next: unknown | null;
        epoch: number;
        invalidated?: number;
    }[];
    keys: string[];
    next: unknown | null;
    total?: number;
    loaded: boolean;
    epoch: number;
    updatedAt: number;
};
/** Canonical facts are held once. List caches hold membership and continuation only. */
export declare class NormalizedStore {
    readonly queryClient: QueryClient;
    readonly identity: string;
    readonly now: () => number;
    registry: DataRegistry;
    private epoch;
    private writes;
    private alive;
    private reads;
    private fences;
    private invalidListeners;
    private outputs;
    private outputIndex;
    private listIndex;
    private listStops;
    private queryIndex;
    private queryStops;
    private sparse;
    private barriers;
    private transaction;
    private owned;
    private cacheHolds;
    private cacheStop;
    private changed;
    private snapshots;
    private lists;
    private listeners;
    private writeWaiters;
    private confirmedListeners;
    constructor(queryClient: QueryClient, identity: string, now?: () => number);
    hold(path: string, query?: unknown): () => void;
    get writeVersion(): number;
    key(path: string): readonly ["grainflow", string, string];
    cacheKey(path: string, query?: unknown): readonly ["grainflow", string, string, "query", unknown] | readonly ["grainflow", string, string];
    private queryKey;
    private isListPath;
    private rootKey;
    private listId;
    listState(path: string, query?: unknown): ListState | undefined;
    positionPath(path: string, query?: unknown): string;
    value<T = unknown>(path: string, query?: unknown): T | undefined;
    /** Owned by a View/source binding; no second global cache of resolved readers. */
    reader(path: string, query?: unknown): {
        value: () => unknown;
        list: () => ListState | undefined;
        needsRead: (staleTime?: number) => boolean;
    };
    cached(path: string, query?: unknown): boolean;
    private set;
    private pendingValue;
    private commit;
    private shape;
    private owns;
    private indexOutput;
    private dropOutputs;
    private dropList;
    private receipt;
    private coversShape;
    private confirm;
    startRead(): number;
    /** Initial facts have lower priority than every server receipt and pending write. */
    seed(values: readonly {
        path: string;
        data: unknown;
        query?: unknown;
    }[]): void;
    finishRead(epoch: number): void;
    private prune;
    /** Exact datasets invalidate their own outputs, not independently supplied extensions. */
    affects(pattern: string, path: string): boolean;
    pageStale(path: string, query: unknown, cursor: unknown): boolean;
    needsRead(path: string, staleTime?: number, query?: unknown): boolean;
    deleted(path: string): boolean;
    acceptsRead(path: string, epoch: number, membership?: boolean): boolean;
    private acceptsFence;
    waitWritable(path: string, signal?: AbortSignal): Promise<void>;
    beginWrite(patterns: readonly string[]): () => void;
    materializedPaths(): string[];
    hasMaterialized(pattern: string): boolean;
    invalidate(input: readonly string[], scoped?: boolean): void;
    subscribeInvalidation(listener: (paths: readonly string[], scoped?: boolean) => void): () => void;
    validate(values: readonly {
        path: string;
        data: unknown;
        complete?: boolean;
    }[]): void;
    accept(values: readonly {
        path: string;
        data: unknown;
        query?: unknown;
        complete?: boolean;
        members?: readonly string[];
        page?: unknown;
    }[], origin: CommitOrigin): void;
    private acceptObject;
    revive(path: string): void;
    remove(pattern: string): void;
    private removeMembership;
    subscribeConfirmed(path: string, listener: () => void): () => void;
    subscribe(path: string, listener: () => void, invalidate?: boolean): () => void;
    subscribeMembers(path: string, query: unknown, listener: () => void): () => void;
    private emit;
    forget(path: string): void;
    diagnostics(): {
        facts: number;
        receipts: number;
        sparse: number;
        lists: number;
        snapshots: number;
        holds: number;
    };
    dispose(): void;
}
export {};
