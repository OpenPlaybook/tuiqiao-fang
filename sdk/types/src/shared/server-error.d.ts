/** HTTP errors keep their type through source, aggregate, edit and UI boundaries. */
export type ErrorIssue = {
    message: string;
    status?: number;
    code?: string;
    path?: string;
    requestKind?: "http" | "network" | "parse" | "preflight";
};
export declare function errorIssues(error: unknown): readonly ErrorIssue[];
/** Only a pure service failure can be omitted entirely from local feedback. */
export declare function isServerError(error: unknown): boolean;
/** Mixed failures still report their service members once, preserving other reasons locally. */
export declare function hasServerError(error: unknown): boolean;
export declare function localErrorMessage(error: unknown, fallback?: string): string;
export declare const SERVER_ERROR_TITLE = "\u7CFB\u7EDF\u66F4\u65B0\u4E2D";
export declare const SERVER_ERROR_DESCRIPTION = "\u90E8\u5206\u529F\u80FD\u53EF\u80FD\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u7A0D\u540E\u5373\u53EF\u6062\u590D\u3002";
export declare class ReadIssuesError extends Error {
    readonly issues: readonly ErrorIssue[];
    constructor(issues: readonly ErrorIssue[]);
}
/** Do not flatten foreign-realm or structural errors into an untyped string. */
export declare function asError(error: unknown): Error;
type Ticket = {
    key: unknown;
    generation: number;
};
type Snapshot = {
    active: boolean;
    dismissed: boolean;
    episode: number;
};
/** One retry clock for all current readers, including same-origin hosted tools. Never retries writes. */
export declare class ServerErrorMonitor {
    private readonly retryMs;
    private latest;
    private failures;
    private listeners;
    private sequence;
    private snapshot;
    private visible;
    private timer?;
    private waiters;
    constructor(retryMs?: number);
    subscribe: (listener: () => void) => () => void;
    getSnapshot: () => Snapshot;
    begin(key: unknown): Ticket;
    finish(ticket: Ticket, error?: unknown): void;
    end(ticket: Ticket): void;
    forget(key: unknown): void;
    cancel(ticket: Ticket): void;
    dismiss: () => void;
    private emit;
    private publish;
    setVisible(visible: boolean): void;
    wait(signal: AbortSignal): Promise<void>;
    private schedule;
    reset: () => void;
}
/** Current-request owners outside GrainFlow (e.g. message delivery); never replays work. */
export declare function runServiceRequest<T>(monitor: ServerErrorMonitor | undefined, owner: object, work: () => Promise<T>, signal: AbortSignal): Promise<T>;
export declare function browserServerErrors(): ServerErrorMonitor | undefined;
export {};
