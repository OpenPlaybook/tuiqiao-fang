import { z } from 'zod';
import type { SourceChanges } from './changes';
export { bindPath, canonicalPath, matchPath, overlapsPath } from "./path";
export type Mode = 'effective' | 'confirmed';
export type Params = Record<string, string>;
export type ReadContext = {
    read: <T = unknown>(path: string) => Promise<T>;
};
export type InputCodec<T, I> = {
    initialize(value: T): I;
    project(input: I): T;
};
export type ListSchema<S extends z.ZodType = z.ZodType> = {
    kind: 'list';
    schema: S;
    key: string;
};
type Shape = z.ZodRawShape;
type Schema<S extends z.ZodType | Shape> = S extends z.ZodType ? S : S extends Shape ? z.ZodObject<S> : never;
export declare function list<S extends z.ZodType | Shape>(schema: S, options: {
    key: string;
}): ListSchema<Schema<S>>;
export type DataContext = ReadContext & {
    params: Params;
};
export type DeriveContext<T = unknown> = {
    data: T | undefined;
    params: Params;
    query?: unknown;
    read: <V = unknown>(path: string, query?: unknown) => V | undefined;
    members: (path: string, query?: unknown) => readonly string[] | undefined;
    /** An independently unavailable item does not deny the whole aggregate. */
    readOptional: <V = unknown>(path: string, query?: unknown) => V | undefined;
};
export type DataDefinition<P extends string = string, S extends z.ZodType = z.ZodType> = {
    path: P;
    schema: S;
    listKey?: string;
    save?: SaveDefinition | readonly SaveDefinition[];
    derive?(context: DeriveContext<z.output<S>>): unknown;
    /** Stable resource identity: retain its complete projection while dependencies change. */
    retainWhileLoading?: boolean;
};
export declare function defineData<const P extends string, S extends z.ZodType | Shape, R>(path: P, schema: S, options: Pick<DataDefinition, 'save' | 'retainWhileLoading'> & {
    derive: (context: DeriveContext<z.output<Schema<S>>>) => R;
}): DataDefinition<P, Schema<S>> & {
    derive: (context: DeriveContext<z.output<Schema<S>>>) => R;
};
export declare function defineData<const P extends string, S extends z.ZodType>(path: P, schema: ListSchema<S>, options?: Pick<DataDefinition, "save">): DataDefinition<P, S> & {
    listKey: string;
};
export declare function defineData<const P extends string, S extends z.ZodType | Shape>(path: P, schema: S, options?: Pick<DataDefinition<P, Schema<S>>, "save">): DataDefinition<P, Schema<S>>;
export type SourceInput = {
    params: Params;
    input: Record<string, unknown>;
    query?: unknown;
    page?: unknown;
};
export type SourceResult<Value = unknown, State = unknown> = {
    value: Value;
    state: State;
    memberErrors?: Record<string, Error>;
    changedKeys?: readonly string[];
    memberChanges?: Record<string, readonly string[]>;
};
export type SourceContext<Value = unknown> = ReadContext & SourceInput & {
    value: Value;
    previous?: Value;
    /** Current confirmed facts, without starting a recursive source read. */
    peek: <T = unknown>(path: string, query?: unknown) => T | undefined;
};
export type SourceLoadContext<Value = unknown, State = unknown, Scope = unknown> = SourceInput & {
    intentId?: string;
    scope: Scope;
    signal: AbortSignal;
    previous?: SourceResult<Value, State>;
    /** Current protocol facts; this cannot start a request. */
    peek: <T = unknown>(path: string, query?: unknown) => T | undefined;
    changesSince(path: string, revision: number, query?: unknown): {
        revision: number;
        keys: readonly string[] | null;
    };
    read: <T = unknown>(path: string, options?: {
        query?: unknown;
        force?: boolean;
    }) => Promise<T>;
    publish: (value: Value) => Promise<void>;
    environment: unknown;
    writeVersion: number;
    /** Explicit refresh intent; ordinary observation and cache misses do not reset protocol recovery. */
    explicitRefresh?: boolean;
    service: <T>(key: object, create: () => {
        value: T;
        dispose?: () => void | Promise<void>;
    }) => T;
};
export type SourceDefinition<Value = any, State = any, Scope = any> = {
    id: string;
    scope: (input: SourceInput) => Scope;
    load: (context: SourceLoadContext<Value, State, Scope>) => Promise<SourceResult<Value, State>>;
    provides: Record<string, (context: SourceContext<Value>) => unknown | Promise<unknown>>;
    /** Owns only list membership; entity facts need their own declared source. */
    providesMembers?: Record<string, (context: SourceContext<Value>) => {
        keys: readonly string[];
        next: unknown | null;
        total?: number;
    }>;
    /** Related canonical facts carried by this response, without becoming their read owner.
     * Merged sparsely under the same read epoch; never queried or cleared as a collection. */
    includes?: Record<string, (context: SourceContext<Value>) => unknown | Promise<unknown>>;
    /** Final projections are complete snapshots; defaults to true.
     * In partial projections (complete:false / live publish), top-level undefined skips a patch.
     * Explicit undefined object fields still clear that field. */
    complete?: boolean;
    checkAfterMs?: number;
    watch?: (scope: Scope, invalidate: (paths?: readonly string[]) => void) => (() => void | Promise<void>);
    /** Demand-owned live events; each publish is a new read, not a mutation. */
    subscribe?: (context: SourceInput & Pick<SourceLoadContext<Value>, 'signal' | 'publish' | 'environment'> & Pick<SourceContext, 'peek'>) => Promise<void>;
    batch?: {
        groupBy: readonly string[];
        key: string;
        max: number;
    };
    /** Read prerequisites share the consumer's demand and stop observing on release. */
    requires?: (context: SourceInput) => readonly string[];
    /** Demand-owned change feeds; their values are not dependencies of this response. */
    observes?: (context: SourceInput) => readonly string[];
    observation?: (value: Value) => number | false;
    /** Per-input cadence inside one transport batch; only due demands are observed. */
    observationMember?: (value: Value, params: Params) => number | false;
    /** Canonical fact with the observation callback's value shape; seeds observation without a redundant read. */
    observationFrom?: string;
    effects?: (context: SourceContext<Value>) => readonly string[];
    /** Receipt-owned identities, e.g. server-generated IDs or background writes. */
    changes?: (context: SourceContext<Value>) => SourceChanges | readonly SourceChanges[];
    /** Pure change feeds commit their fences before publishing the next cursor. */
    invalidation?: (context: SourceContext<Value> & {
        existingPaths: () => readonly string[];
    }) => {
        scopes?: readonly string[];
        paths?: readonly string[];
        selectScope?: (path: string) => boolean;
    };
    /** Facts materialized by an endpoint whose changes invalidate this response. No extra reads. */
    references?: (context: SourceContext<Value>) => readonly string[];
    removes?: (context: SourceContext<Value>) => readonly string[];
    /** Explicit creation receipts may reintroduce exact previously deleted identities. */
    revives?: (context: SourceContext<Value>) => readonly string[];
};
/** Read policies shared by protocol helpers; each helper owns its load and watcher. */
export type SourceReadOptions<Value, State = undefined, Scope = Record<string, unknown>> = Partial<Pick<SourceDefinition<Value, State, Scope>, 'scope' | 'checkAfterMs' | 'complete' | 'observation' | 'observationMember' | 'observationFrom' | 'requires' | 'observes'>>;
export declare function defineSource<Value, State = undefined, Scope = Record<string, unknown>>(id: string, spec: Omit<SourceDefinition<Value, State, Scope>, 'id' | 'scope' | 'provides'> & {
    scope?: (input: SourceInput) => Scope;
    provides?: SourceDefinition<Value, State, Scope>['provides'];
}): SourceDefinition<Value, State, Scope>;
export type WriteContext = DataContext & {
    intentId?: string;
    input?: unknown;
    value?: unknown;
    body?: unknown;
    sent?: unknown;
};
export type EditOptions = {
    draft?: boolean;
    label?: string;
    input?: InputCodec<unknown, unknown>;
    debounceMs?: number;
    /** Pending edits in these scopes must confirm before this field is sent. */
    after?: (context: Pick<DataContext, "params">) => readonly string[];
    /** Canonical targets must exist before a field can be sent. */
    requires?: (context: Pick<DataContext, "params">) => readonly string[];
    validate?: (context: WriteContext) => void | Promise<void>;
};
export type SaveDefinition = EditOptions & {
    source: string;
    paths?: readonly string[];
    fields?: readonly string[] | Record<string, true | EditOptions>;
};
export type OperationContext = WriteContext & {
    members: (path: string) => Promise<readonly string[]>;
};
export type RecoveryDefinition = {
    path: string;
    prepare?: (context: {
        params: Params;
    }) => Promise<unknown>;
};
export type DataModule = {
    /** Optional editing bindings can be registered when the editor module loads. */
    saves?: readonly (SaveDefinition & {
        path: string;
    })[];
    mutations?: readonly import('./mutation').MutationDefinition[];
    recovery?: readonly RecoveryDefinition[];
    imports?: readonly DataModule[];
    data: readonly DataDefinition[];
    sources: readonly SourceDefinition[];
};
/** Cycles must escape partial-data recovery; retrying them cannot make progress. */
export declare class DependencyCycleError extends Error {
}
