import type { DataRegistry } from './registry';
import type { NormalizedStore } from './ingest';
import type { SourceDefinition, SourceContext } from './schema';
/** Protocol projection only: it owns no cache, execution, or recovery state. */
export declare function projectSource(registry: DataRegistry, definition: SourceDefinition, input: Record<string, unknown>, body: unknown, createContext: (input: Record<string, unknown>, body: unknown) => SourceContext, failures?: Map<string, Error>, accept?: (values: Parameters<NormalizedStore['accept']>[0]) => void, partial?: boolean): Promise<{
    path: string;
    data: unknown;
    query?: unknown;
    complete?: boolean;
    page?: unknown;
}[]>;
