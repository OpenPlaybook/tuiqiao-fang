import type { ConfirmedChanges, DataChange, SourceChanges } from './changes';
import type { CommitOrigin, NormalizedStore } from './ingest';
/** The only runtime entry into canonical facts. Protocols never mutate the store. */
export declare class FactIngress {
    private readonly store;
    private readonly onConfirmed;
    private readonly publish?;
    private received;
    private disposed;
    constructor(store: NormalizedStore, onConfirmed: (values: ConfirmedChanges['values']) => void, publish?: ((change: DataChange) => void) | undefined);
    accept(values: ConfirmedChanges['values'], origin: CommitOrigin): void;
    invalidate(paths: readonly string[]): void;
    revalidateScope(scopes: readonly string[]): void;
    seed(values: readonly {
        path: string;
        data: unknown;
        query?: unknown;
    }[]): void;
    confirm(changes: SourceChanges): void;
    receive(change: DataChange): boolean;
    dispose(): void;
}
