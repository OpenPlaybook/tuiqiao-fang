import { type QueryClient } from "@tanstack/query-core";
import { RequestError } from '../http';
import { type ErrorIssue, type ServerErrorMonitor } from '../server-error';
import { DataView } from './derived';
import { type DataChange, type ConfirmedChanges } from './changes';
import type { HttpFetcher } from './http-source';
import { FactIngress } from './facts';
import { NormalizedStore } from './ingest';
import type { AcquireLock } from "./lock";
import type { OperationState } from "./mutation";
import { DataRegistry } from './registry';
import type { DataModule, Mode, SaveDefinition } from './schema';
import { WriteCoordinator, type WriteIntent } from './writes';
import { ProtocolServices } from './protocol-services';
import { SourceRuntime } from './source';
import { ReadSession, type ReadSessionOptions } from './read-session';
import type { DraftStorage, StoredEdit } from "./storage";
export type GrainReader = Pick<GrainFlow, 'read' | 'readPage'>;
export type RecoveryState = {
    ready: boolean;
    error?: Error;
    value?: unknown;
};
export type GrainStatus = "idle" | "loading" | "ready" | "saving";
export type GrainIssue = {
    requestKind?: RequestError["kind"];
    /** Runtime identity of the read that failed, used for continuation ownership. */
    readError?: Error;
    kind: "read" | "save" | "storage" | "conflict" | "recovery";
    message: string;
    path?: string;
    status?: number;
    code?: string;
};
export type GrainState<T> = {
    value: T | undefined;
    status: GrainStatus;
    draft?: {
        value: T;
    };
    issues: readonly GrainIssue[];
    hasChanges: boolean;
};
export type GrainOptions = {
    serverErrors?: ServerErrorMonitor;
    publishChanges?: (change: DataChange) => void;
    storage?: DraftStorage;
    acquire?: AcquireLock;
    now?: () => number;
    recoveryGraceMs?: number;
    fetcher?: HttpFetcher;
    accountUserId?: string;
    onWriteError?: (failure: {
        path: string;
        message: string;
    }) => void;
};
export declare const equalData: (a: unknown, b: unknown) => boolean;
export declare class Grain<T, I = T> {
    readonly flow: GrainFlow;
    readonly path: string;
    readonly id: string;
    readonly definition: Partial<SaveDefinition>;
    readonly params: Readonly<Record<string, string>>;
    private listeners;
    private state;
    private draft?;
    private restored;
    private preparedInput;
    private restoring?;
    private localWrites;
    private lockWork;
    private session?;
    private pending?;
    private approved?;
    private authored?;
    private error?;
    private storageFailed;
    private deleted;
    private disposed;
    private release?;
    private editor?;
    private inputs;
    private timer?;
    private write?;
    private stopWriting?;
    private stopRetaining;
    private dependencyStops;
    private holdCache?;
    constructor(flow: GrainFlow, path: string);
    private backend;
    private project;
    private initialize;
    private same;
    input(owner?: object): I | undefined;
    inputReady(): boolean;
    prepareInput(discover?: boolean): Promise<void>;
    isEditing(): boolean;
    getSnapshot: () => GrainState<T>;
    get writeState(): (OperationState & {
        input?: {
            value: unknown;
            changeId?: string;
            draftId?: string;
        } | undefined;
        result?: unknown;
    }) | undefined;
    getWriteSnapshot: () => (OperationState & {
        input?: {
            value: unknown;
            changeId?: string;
            draftId?: string;
        } | undefined;
        result?: unknown;
    }) | undefined;
    subscribeWrite: (notify: () => void) => () => void;
    retrySave: () => Promise<void>;
    subscribe: (fn: () => void) => () => void;
    private publish;
    accept(): void;
    load(force?: boolean): Promise<T>;
    restore: (discover?: boolean) => Promise<void>;
    recoveryPending: () => Promise<void> | undefined;
    resetRecovery(): void;
    private queueLocal;
    private schedule;
    edit: (input: I | ((current: I) => I), owner?: object) => Promise<void>;
    /** Retry local durability without making an old input a new edit. */
    persist: () => Promise<void>;
    save: () => Promise<void>;
    acknowledge(value: T, changeId: string, draftId: string | undefined, confirmedAt: number): Promise<void>;
    conflict(): {
        changeId: string;
        remote: T | undefined;
        draft: I;
    } | undefined;
    resolve(choice: 'remote' | 'draft', changeId: string): Promise<void>;
    authoredHere(): boolean;
    reconnect(resume?: boolean): Promise<void>;
    settle(): Promise<void>;
    discard(): Promise<void>;
    set(value: T): Promise<void>;
    /** Acquire before exposing an editable input, independently of writes. */
    begin(owner: object): Promise<void>;
    end(owner?: object): Promise<void>;
    get retired(): boolean;
    recoveryMaterial(): {
        reason: "target_deleted";
        path: string;
        input: I;
    } | undefined;
    dispose(): Promise<void>;
}
export declare class GrainFlow {
    readonly queryClient: QueryClient;
    readonly identity: string;
    private options;
    readonly serverErrors: ServerErrorMonitor | undefined;
    readonly registry: DataRegistry;
    readonly store: NormalizedStore;
    readonly sources: SourceRuntime;
    readSession(options: ReadSessionOptions): ReadSession;
    readonly facts: FactIngress;
    readonly writes: WriteCoordinator;
    readonly protocols: ProtocolServices;
    readonly storage: DraftStorage;
    readonly acquire: AcquireLock;
    readonly now: () => number;
    readonly recoveryGraceMs: number;
    private reportedWriteErrors;
    reportWriteError(path: string, message: string, error?: unknown): void;
    private disposed;
    private cleanups;
    onDispose(callback: () => void | Promise<void>): () => void;
    private particles;
    private editListeners;
    private listeners;
    private views;
    private registrationScheduled;
    private resets;
    private cacheStop;
    constructor(queryClient: QueryClient, identity: string, options?: GrainOptions);
    confirmChanges(changes: ConfirmedChanges & {
        id?: string;
    }): void;
    receiveChanges(change: DataChange): boolean;
    reconnect(resume?: boolean): void;
    private recoveries;
    private recoveryHolders;
    private recoveryCleanups;
    private retireRecovery;
    retainRecovery(path: string): () => void;
    recovery(path: string): RecoveryState;
    initialize(path: string, options?: {
        retry?: boolean;
    }): Promise<void>;
    /** Resource-entry snapshot. Ordinary editing/saving can only use a snapshot already captured. */
    initialDraft(path: string, discover: boolean): Promise<{
        record?: StoredEdit<unknown>;
    } | undefined>;
    private captureDrafts;
    private initializeResource;
    register(module: DataModule): void;
    seed(values: readonly {
        path: string;
        data: unknown;
        query?: unknown;
    }[]): void;
    seedReadFailure(initial: {
        identity: string;
        path: string;
        query?: unknown;
        issues: readonly ErrorIssue[];
    }): void;
    members(path: string, options?: {
        query?: unknown;
    }): DataView<readonly string[]>;
    view<T = unknown>(path: string, options?: {
        mode?: Mode;
        query?: unknown;
        members?: boolean;
    }): DataView<T>;
    private particle;
    edit<T = unknown, I = T>(path: string): Grain<T, I>;
    /** Flush only existing input whose declared write targets conflict with this action. */
    prepareEdits(targets: readonly string[]): Promise<void>;
    private editPlans;
    editPlan(actionPath: string): {
        change: (plan: import("./edit-plan").EditPlan | (() => import("./edit-plan").EditPlan | Promise<import("./edit-plan").EditPlan>)) => Promise<void>;
        input: () => unknown;
        settle: () => Promise<void>;
        retry: () => Promise<void>;
        discard: () => Promise<void>;
        flush(scopes: readonly string[], options?: {
            all?: boolean;
            authoredOnly?: boolean;
        }): Promise<void>;
    };
    /** Observe existing editors only: no data reads or new editing sessions. */
    editScope(path: string): {
        submit: (work?: () => Promise<void>) => Promise<void>;
        getSubmissionSnapshot: () => OperationState;
        subscribeSubmission: (notify: () => void) => () => void;
        getSnapshot: () => {
            hasChanges: boolean;
            saving: boolean;
            issues: readonly GrainIssue[];
        };
        subscribe: (notify: () => void) => () => void;
        save: (options?: {
            authoredOnly?: boolean;
        }) => Promise<void>;
        settle: () => Promise<void>;
    };
    notifyEdit(path: string): void;
    read<T = unknown>(path: string, options?: {
        force?: boolean;
        signal?: AbortSignal;
        query?: unknown;
    }): Promise<T>;
    private readInPass;
    readPage<T = unknown>(path: string, options?: {
        query?: unknown;
        cursor?: string;
        limit?: number;
        signal?: AbortSignal;
        force?: boolean;
    }): Promise<{
        items: T[];
        next: string | null;
        total: number;
    }>;
    /** Confirm dependencies once within this operation; never retain a pass across requests. */
    readBatch<T>(work: (reader: GrainReader) => Promise<T>): Promise<T>;
    private readPageInPass;
    peek<T = unknown>(path: string, mode?: Mode, query?: unknown, read?: () => unknown): T | undefined;
    saveInput(path: string, value: unknown): {
        field: string | undefined;
        value: unknown;
        patch: unknown;
    };
    prepareAssignment(path: string, value: unknown): Promise<{
        field: string | undefined;
        value: unknown;
        patch: unknown;
    }>;
    assign<T>(path: string, value: T, changeId?: string, draftId?: string): Promise<T>;
    settleWrites(path: string): Promise<void>;
    operation<I = unknown, R = unknown>(path: string): WriteIntent<I, R>;
    run<I = unknown, R = unknown>(path: string, input: I): Promise<R>;
    storageKey(path: string): string;
    notify(path: string): void;
    subscribe: (path: string, listener: () => void, invalidate?: boolean) => () => void;
    resetInputs(path: string): void;
    resetVersion(path: string): number;
    diagnostics(): {
        sources: {
            observations: number;
            executions: number;
            states: number;
            instances: number;
            queries: number;
            dependencies: number;
            projections: number;
            listeners: number;
            pending: number;
            watchers: number;
        };
        facts: number;
        receipts: number;
        sparse: number;
        lists: number;
        snapshots: number;
        holds: number;
        views: number;
        grains: number;
        listeners: number;
    };
    private disposing?;
    private assertActive;
    dispose(): Promise<void>;
}
