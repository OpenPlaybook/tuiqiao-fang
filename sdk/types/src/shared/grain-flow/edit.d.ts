import { writeBinding } from './write-state';
/** Input durability is declared by the field; only continuous editing owns a lock. */
export declare function useEdit<T, I = T>(path: string | null, options?: {
    continuous?: boolean;
    editing?: boolean;
    manualPreparation?: boolean;
}): {
    [writeBinding]: {
        kind: "edit";
        grain: import("./core").Grain<T, I> | undefined;
        read: import("./derived").ViewSnapshot<T>;
        ready: boolean;
        initializationError: Error | undefined;
    };
    ready: boolean;
    confirmed: T | undefined;
    input: I | undefined;
    denied: boolean | undefined;
    retry: () => Promise<void>;
    refresh: () => Promise<T | undefined>;
    resetVersion: number;
    edit: (input: I | ((current: I) => I)) => Promise<void>;
    set: (value: T) => Promise<void>;
    save: () => Promise<void>;
    begin: () => Promise<void>;
    end: () => Promise<void | undefined> | undefined;
    discard: () => Promise<void> | undefined;
    resolve: (choice: "remote" | "draft") => Promise<void>;
    conflict: {
        changeId: string;
        remote: T | undefined;
        draft: I;
    } | undefined;
    recovery: {
        reason: "target_deleted";
        path: string;
        input: I;
    } | undefined;
    status: import("./core").GrainStatus;
    issues: (import("./core").GrainIssue | {
        message: string;
        status?: number;
        code?: string;
        path?: string;
        requestKind?: "http" | "network" | "parse" | "preflight";
        kind: "recovery";
    })[];
    hasChanges: boolean;
};
/** Saving a scope does not require observing all of its editors. */
export declare function useSaveScope(path: string): {
    [writeBinding]: {
        kind: "scope";
        scope: {
            submit: (work?: (() => Promise<void>) | undefined) => Promise<void>;
            getSubmissionSnapshot: () => import("./mutation").OperationState;
            subscribeSubmission: (notify: () => void) => () => void;
            getSnapshot: () => {
                hasChanges: boolean;
                saving: boolean;
                issues: readonly import("./core").GrainIssue[];
            };
            subscribe: (notify: () => void) => () => void;
            save: (options?: {
                authoredOnly?: boolean;
            }) => Promise<void>;
            settle: () => Promise<void>;
        };
    };
    save: (work?: (() => Promise<void>) | undefined) => Promise<void>;
    settle: () => Promise<void>;
};
export declare function useEditScope(path: string): {
    hasChanges: boolean;
    saving: boolean;
    issues: readonly import("./core").GrainIssue[];
    [writeBinding]: {
        kind: "scope";
        scope: {
            submit: (work?: (() => Promise<void>) | undefined) => Promise<void>;
            getSubmissionSnapshot: () => import("./mutation").OperationState;
            subscribeSubmission: (notify: () => void) => () => void;
            getSnapshot: () => {
                hasChanges: boolean;
                saving: boolean;
                issues: readonly import("./core").GrainIssue[];
            };
            subscribe: (notify: () => void) => () => void;
            save: (options?: {
                authoredOnly?: boolean;
            }) => Promise<void>;
            settle: () => Promise<void>;
        };
    };
    save: (work?: (() => Promise<void>) | undefined) => Promise<void>;
    settle: () => Promise<void>;
};
