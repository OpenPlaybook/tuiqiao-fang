import type { SaveDefinition } from './schema';
import type { OperationRunOptions, OperationState } from './mutation';
import type { GrainOptions } from './core';
import type { GrainFlow } from './core';
export declare function writeRetryDelay(error: unknown, attempt: number): number | undefined;
type WriteRequest = {
    intentId?: string;
    signal?: AbortSignal;
    saved?: {
        path: string;
        data: unknown;
    };
};
/** Serializes real overlapping targets for both field saves and explicit actions. */
export declare class WriteActivity {
    protected pending: Set<{
        paths: readonly string[];
        done: Promise<unknown>;
    }>;
    get pendingCount(): number;
    affects(path: string): boolean;
    settle(path: string): Promise<void>;
    track<T>(paths: readonly string[], done: Promise<T>): Promise<T>;
}
export declare class WriteCoordinator extends WriteActivity {
    private readonly flow;
    private readonly environment;
    private controllers;
    private disposed;
    private operations;
    constructor(flow: GrainFlow, environment: GrainOptions);
    operation<I = unknown, R = unknown>(path: string): WriteIntent<I, R>;
    field(path: string): WriteIntent<{
        value: unknown;
        changeId?: string;
        draftId?: string;
    }, unknown>;
    assign<T>(path: string, value: T, changeId?: string, draftId?: string): Promise<T>;
    hasUnsettled(path: string): boolean;
    settle(path: string): Promise<void>;
    prepare(sourceId: string, input: Record<string, unknown>): Promise<void>;
    saveScope(path: string): Promise<void>;
    private context;
    targets(mutationId: string, input: Record<string, unknown>): string[];
    invalidate(mutationId: string, input: unknown): void;
    execute(sourceId: string, input: unknown, request?: WriteRequest): Promise<{
        body: unknown;
    }>;
    dispose(): Promise<void>;
}
type FieldWrite = {
    definition: SaveDefinition;
    params: Record<string, string>;
    prepare(input: {
        value: unknown;
        changeId?: string;
    }): Promise<unknown>;
    finish(input: unknown): Promise<void>;
};
/** Current requests only. Editing sessions and persistent drafts are separate owners. */
export declare class WriteIntent<I, R> {
    private readonly flow;
    readonly path: string;
    private readonly field?;
    retainedInput?: {
        input: () => unknown;
        retry: () => Promise<unknown>;
        discard: () => Promise<void>;
    };
    private state;
    private listeners;
    private disposed;
    private controller?;
    private queued?;
    private latestQueued?;
    private running?;
    private retryState?;
    private retryController?;
    constructor(flow: GrainFlow, path: string, field?: FieldWrite | undefined);
    private binding;
    private update;
    notifyRetainedInput: () => void;
    getSnapshot: () => OperationState & {
        input?: I;
        result?: R;
    };
    subscribe: (notify: () => void) => () => void;
    private active;
    resumeForInput: () => Promise<void>;
    isPaused: () => boolean;
    resumeRetry: () => Promise<void>;
    stopRetry: () => void;
    waitToRetry: (error: unknown) => Promise<boolean>;
    cancel: () => void;
    settle: () => Promise<unknown> | undefined;
    run: (input: I, options?: OperationRunOptions) => Promise<R>;
    reportFailure: (error: unknown) => void;
    private execute;
    dispose(): void;
}
export {};
