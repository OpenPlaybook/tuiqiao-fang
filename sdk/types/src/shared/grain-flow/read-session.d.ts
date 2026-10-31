import type { GrainFlow } from './core';
import type { DataView } from './derived';
export type ReadSessionOptions = {
    signal?: AbortSignal;
    timeoutMs: number;
    timeoutError: Error;
};
export type ReadSessionSnapshot = {
    recoveringSince?: number;
    networkRecoveringSince?: number;
    error?: unknown;
};
type ReadOptions = Parameters<DataView<unknown>['read']>[0];
/** A finite read may end while its consumer still needs a confirmed result. */
export declare class ReadSession {
    private flow;
    private controller;
    readonly signal: AbortSignal;
    private views;
    private listeners;
    private snapshot;
    private deadline;
    private stops;
    private disposed;
    constructor(flow: GrainFlow, options: ReadSessionOptions);
    getSnapshot: () => ReadSessionSnapshot;
    subscribe: (listener: () => void) => () => void;
    private update;
    private retain;
    track(path: string, options?: {
        query?: unknown;
    }): void;
    read<T>(path: string, options?: ReadOptions): Promise<T>;
    members(path: string, options?: ReadOptions): Promise<readonly string[]>;
    private readView;
    private close;
    dispose: () => void;
}
export {};
