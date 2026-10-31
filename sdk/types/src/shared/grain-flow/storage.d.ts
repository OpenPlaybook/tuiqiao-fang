import { type IDBPDatabase } from 'idb';
/** One latest input; changeId acknowledges a local write, not a server revision. */
export type StoredEdit<T, I = T> = {
    base: T;
    input: I;
    changeId: string;
    draftId: string;
    saveWindowStartedAt: number | null;
};
export interface DraftStorage {
    read<T, I = T>(key: string): Promise<StoredEdit<T, I> | undefined>;
    write<T, I = T>(key: string, value: StoredEdit<T, I>): Promise<void>;
    remove(key: string, changeId: string): Promise<boolean>;
    acknowledge<T>(key: string, changeId: string, base: T, confirmation: {
        draftId: string;
        at: number;
    }): Promise<boolean>;
    list(identity: string, path: string): Promise<Array<{
        key: string;
        value: StoredEdit<unknown>;
    }>>;
}
export type DraftDatabase = Pick<IDBPDatabase, 'transaction' | 'close'>;
export declare function isStoredEdit(value: unknown): value is StoredEdit<unknown>;
export declare function createDraftStorage(open?: () => Promise<DraftDatabase>): DraftStorage;
export declare const draftStorage: DraftStorage;
