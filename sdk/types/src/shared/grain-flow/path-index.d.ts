type Entry<T> = {
    path: string;
    value: T;
};
/** Index metadata by overlapping path; removing the last entry removes its branches. */
export declare class PathIndex<T> {
    private root;
    private count;
    add(path: string, value: T): () => void;
    matching(paths: readonly string[]): Set<Entry<T>>;
    get size(): number;
    clear(): void;
}
export {};
