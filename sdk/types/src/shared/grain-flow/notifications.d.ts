export declare function batchChanges<T>(run: () => T): T;
/** Mark the direct graph before any consumer computes a snapshot. */
export declare function markChanges(callback: () => void): void;
export declare function afterChanges(callback: () => void): void;
/** The subscription tree is the only index; empty branches are removed on release. */
export declare class PathNotifications {
    private index;
    subscribe(path: string, listener: (data?: boolean) => void, invalidate?: boolean): () => void;
    emit(paths: readonly string[], data?: boolean): void;
    get size(): number;
    clear(): void;
}
