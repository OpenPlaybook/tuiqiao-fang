import type { GrainIssue } from './core';
import type { DataFact } from './changes';
import type { OperationContext, SourceContext, SourceInput, SourceLoadContext } from './schema';
/** One declaration owns the action, protocol, conflict targets and receipt. */
export type MutationDefinition<V = any> = {
    id: string;
    path?: string;
    queue?: 'latest';
    /** Only audited replacement writes may retry without an outcome query. */
    retry?: 'replace' | 'deduplicated';
    /** Most actions preserve unsent input; completed composite edits can request a flush. */
    inputs?: 'save';
    prepare?: (context: OperationContext) => unknown | Promise<unknown>;
    verify?: (context: OperationContext) => void | Promise<void>;
    targets: (context: SourceInput & Pick<SourceContext, 'peek'>) => readonly string[];
    execute: (context: SourceLoadContext<V>) => Promise<V>;
    receipt: (context: SourceContext<V>) => readonly DataFact[];
    rejects?: (error: unknown) => boolean;
};
export declare function defineMutation<V>(id: string, spec: Omit<MutationDefinition<V>, 'id'>): MutationDefinition<V>;
export type OperationRunOptions = {
    signal?: AbortSignal;
};
export type WriteRetry = {
    count: number;
    paused: boolean;
    issue: GrainIssue;
    offline?: boolean;
    inputRejected?: boolean;
    waitingUntil?: number;
};
export type OperationState = {
    retry?: WriteRetry;
    intentId?: string;
    ready: boolean;
    status: 'idle' | 'running' | 'succeeded' | 'failed';
    issues: readonly GrainIssue[];
    input?: unknown;
    result?: unknown;
};
