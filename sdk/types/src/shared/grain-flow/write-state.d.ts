import type { Grain, GrainFlow } from './core';
import type { ViewSnapshot } from './derived';
import type { WriteIntent } from './writes';
/** Only complete framework bindings carry this identity; UI cannot assemble a status DTO. */
export declare const writeBinding: unique symbol;
export type WriteBinding = {
    kind: 'edit';
    grain?: Grain<any, any>;
    read: ViewSnapshot<any>;
    ready: boolean;
    initializationError?: Error;
} | {
    kind: 'operation';
    owner?: WriteIntent<any, any>;
} | {
    kind: 'scope';
    scope: ReturnType<GrainFlow['editScope']>;
};
export type DataWriteFeedback = {
    message: string;
    retry?: () => Promise<unknown>;
    discard?: () => Promise<unknown>;
    conflict?: {
        changeId: string;
        remote: unknown;
        draft: unknown;
        resolve: (choice: 'remote' | 'draft', changeId: string) => Promise<void>;
    };
    input?: unknown;
};
export type DataWritePresentation = {
    pulse: boolean;
    disabled: boolean;
    denied?: boolean;
    waitingForInput?: boolean;
    feedback?: DataWriteFeedback;
};
/** Data and write facts are separate. This function never executes IO or notifications. */
export declare function resolveDataWriteState(binding: WriteBinding): DataWritePresentation;
