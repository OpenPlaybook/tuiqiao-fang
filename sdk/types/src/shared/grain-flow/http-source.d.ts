import { type SourceContext, type SourceDefinition, type SourceLoadContext, type SourceReadOptions } from './schema';
export type HttpRequest = {
    url: string;
    /** Framework source/mutation owns reporting and recovery for this execution. */
    managedServiceErrors?: true;
    method?: string;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    json?: unknown;
    form?: Record<string, string>;
    response?: 'stream';
    headers?: Record<string, string>;
    keepalive?: boolean;
    timeoutMs?: number;
    /** Domain receipts in error responses survive authentication wrappers. */
    onHttpError?: (body: unknown) => void;
};
export type HttpFetcher = (request: HttpRequest, signal: AbortSignal) => Promise<unknown>;
export type HttpDecodeContext<V = unknown> = {
    input: Record<string, unknown>;
    signal: AbortSignal;
    publish: (value: V) => Promise<void>;
    peek: SourceLoadContext['peek'];
};
export declare const fetchHttp: HttpFetcher;
export declare function untilAborted<T>(work: Promise<T>, signal: AbortSignal): Promise<T>;
export declare function defineHttpSource<V = unknown, I extends Record<string, unknown> = Record<string, unknown>, Scope = Record<string, unknown>>(id: string, spec: {
    request: (input: I, context?: Pick<SourceLoadContext, 'peek' | 'explicitRefresh'>) => HttpRequest;
    transport?: (request: HttpRequest, context: Pick<SourceLoadContext, 'signal' | 'environment'>) => Promise<unknown>;
    decode?: (value: unknown, context: HttpDecodeContext<V>) => V | Promise<V>;
    provides?: Record<string, (context: SourceContext<V>) => unknown | Promise<unknown>>;
} & SourceReadOptions<V, undefined, Scope> & Pick<SourceDefinition<V>, 'providesMembers' | 'includes' | 'batch' | 'effects' | 'changes' | 'invalidation' | 'references' | 'removes' | 'revives'>): SourceDefinition<V, undefined, Scope> & {
    request: (input: I, context?: Pick<SourceLoadContext, 'peek' | 'explicitRefresh'>) => HttpRequest;
};
