import type { NormalizedStore } from './ingest';
import type { DataRegistry } from './registry';
/** Completeness belongs to each fact, never to an entire response. */
export type DataFact = {
    kind: 'snapshot' | 'patch';
    path: string;
    data: unknown;
    query?: unknown;
} | {
    kind: 'absent';
    path: string;
    query?: unknown;
} | {
    kind: 'members';
    path: string;
    keys: readonly string[];
    next: unknown | null;
    total?: number;
    query?: unknown;
    page?: unknown;
} | {
    kind: 'remove' | 'revive' | 'invalidate';
    path: string;
};
export declare function changesFromFacts(facts: readonly DataFact[]): ConfirmedChanges;
export type ConfirmedChanges = {
    values: Parameters<NormalizedStore['accept']>[0];
    removed: readonly string[];
    revived: readonly string[];
    invalidated: readonly string[];
};
export type ChangeReceipt = ConfirmedChanges & {
    id: string;
};
export type SourceChanges = Partial<ConfirmedChanges> & {
    id?: string;
};
export type DataChange = ChangeReceipt & {
    identity: string;
};
/** A complete ancestor also supplies its descendants. Partial supply cannot erase a broader invalidation. */
export declare function pendingInvalidations(values: ConfirmedChanges['values'], paths: readonly string[], registry?: DataRegistry): string[];
export declare function isChangeReceipt(value: unknown): value is ChangeReceipt;
export declare function isDataChange(value: unknown): value is DataChange;
