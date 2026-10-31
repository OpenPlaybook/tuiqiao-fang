import { RequestError } from '../http';
import type { GrainFlow, GrainIssue, GrainStatus } from './core';
import { type Mode } from './schema';
import type { ReadPass } from './source';
export type Readable<T> = {
    getSnapshot: () => T;
    subscribe: (notify: () => void) => () => void;
};
export type ViewSnapshot<T> = {
    data: T | undefined;
    status: Exclude<GrainStatus, "saving">;
    refreshing?: boolean;
    recoveringSince?: number;
    networkRecoveringSince?: number;
    denied?: boolean;
    error?: RequestError;
    issues: readonly GrainIssue[];
    retry: () => Promise<unknown>;
    refresh: () => Promise<T | undefined>;
    total?: number;
    hasMore?: boolean;
    loadMore?: () => Promise<unknown>;
    loadingMore?: boolean;
    loadMoreError?: Error;
};
/** Stable natural-object snapshots; equal path strings share the same view. */
export declare class DataView<T> implements Readable<ViewSnapshot<T>> {
    readonly flow: GrainFlow;
    readonly path: string;
    readonly options: {
        mode?: Mode;
        query?: unknown;
        members?: boolean;
    };
    readonly mode: Mode;
    private state;
    private listeners;
    private stops;
    private holders;
    private leases;
    private reader;
    private binding;
    private definition;
    private readsOwnData;
    private isList;
    private requiredDependencies;
    private dependencies;
    private dirty;
    private invalidListeners;
    dependencyVersion: number;
    private dependencyInvalidations;
    private published;
    private registryVersion;
    private computed;
    private input;
    private dependencyStops;
    private evaluating;
    private scheduled;
    private disposed;
    private evicted;
    constructor(flow: GrainFlow, path: string, options?: {
        mode?: Mode;
        query?: unknown;
        members?: boolean;
    });
    private prepare;
    private retry;
    private more?;
    private loadMore;
    /** Explicit user refresh; source selection, coalescing and retained content stay here. */
    private refresh;
    read(options?: {
        readPass?: ReadPass;
        refreshWave?: Map<string, Promise<unknown>>;
        explicitRefresh?: boolean;
        force?: boolean;
        signal?: AbortSignal;
        query?: unknown;
        capture?: (value: T, version: number) => void;
    }, ancestors?: string[]): Promise<T>;
    getSnapshot: () => ViewSnapshot<T>;
    private syncDependencies;
    private invalidateData;
    private changed;
    observeDependency(notify: (data: boolean) => void): () => void;
    private publish;
    private watch;
    invalidateDefinition(): void;
    invalidateCache(): void;
    subscribe: (notify: () => void) => (() => void);
    retain: (visibleRange?: import("./source").VisibleRange) => (() => void);
    get cacheDependencies(): MapIterator<DataView<unknown>>;
    get active(): boolean;
    dispose(evicted?: boolean): void;
}
