export type AcquireLock = (key: string) => Promise<() => Promise<void>>;
export declare const acquireEditLock: AcquireLock;
