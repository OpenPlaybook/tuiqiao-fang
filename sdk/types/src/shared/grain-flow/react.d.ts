import { type ReactNode } from 'react';
import type { GrainOptions } from './core';
import type { ViewSnapshot } from './derived';
import type { Mode, DataModule } from './schema';
import { writeBinding } from './write-state';
export declare function GrainFlowProvider(props: {
    identity: string;
    children: ReactNode;
    options?: GrainOptions;
    requiresPlatformSession?: boolean;
}): import("react/jsx-runtime").JSX.Element;
/** Resource entry points register their definition without exposing runtime IO. */
export declare function useDataModule(...modules: DataModule[]): void;
export declare function useDataIdentity(): string;
export declare function useData<T = unknown>(path: string | null, options?: {
    mode?: Mode;
    query?: unknown;
    visibleRange?: import("./source").VisibleRange;
    retain?: boolean;
}): ViewSnapshot<T>;
export declare function useMembers(path: string | null, options?: {
    query?: unknown;
    visibleRange?: import('./source').VisibleRange;
    retain?: boolean;
}): ViewSnapshot<readonly string[]>;
/** Observe existing facts and local input without declaring source or recovery demand. */
export declare function useDataSnapshot<T = unknown>(path: string | null): T | undefined;
export declare function useOperation<I = unknown, R = unknown>(path: string | null): {
    reportError: (error: unknown) => void;
    run: (input: I, options?: import("./mutation").OperationRunOptions) => Promise<R>;
    getSnapshot: () => {
        input: I | undefined;
        result: R | undefined;
        retry?: import("./mutation").WriteRetry;
        intentId?: string;
        ready: boolean;
        status: "idle" | "running" | "succeeded" | "failed";
        issues: readonly import("./core").GrainIssue[];
    };
    input: I | undefined;
    result: R | undefined;
    retry?: import("./mutation").WriteRetry;
    intentId?: string;
    ready: boolean;
    status: "idle" | "running" | "succeeded" | "failed";
    issues: readonly import("./core").GrainIssue[];
    [writeBinding]: {
        kind: "operation";
        owner: import("./writes").WriteIntent<I, R> | undefined;
    };
};
/** A declared resource initializer owns current input restoration and continuation. */
export declare function useRecovery(path: string): {
    retry: () => Promise<void>;
    ready: boolean;
    error?: Error;
    value?: unknown;
};
