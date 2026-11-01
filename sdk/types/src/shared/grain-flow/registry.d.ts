import { z } from 'zod';
import type { MutationDefinition } from './mutation';
import { type DataModule, type DataDefinition, type SourceDefinition, type SaveDefinition, type RecoveryDefinition } from './schema';
import { type PathToken } from './path';
export type ResolvedData = {
    definition: DataDefinition;
    params: Record<string, string>;
    schema: z.ZodType;
    relativeTokens: readonly PathToken[];
    list?: {
        path: string;
        key: string;
    };
};
export type Source = {
    source: SourceDefinition;
    path: string;
    params: Record<string, string>;
};
export declare class DataRegistry {
    version: number;
    private resolvedCache;
    private derivedCache;
    private providedFields;
    private sourceCache;
    private memberSourceCache;
    private memberSources;
    private readSources;
    private recoveryDefinitions;
    recovery(path: string): {
        definition: RecoveryDefinition;
        params: Record<string, string>;
        path: string;
    } | undefined;
    private modules;
    private definitions;
    private saveDefinitions;
    private sourceDefinitions;
    private operations;
    private mutations;
    mutation(id: string): MutationDefinition | undefined;
    register(module: DataModule): void;
    resolve(path: string): ResolvedData;
    private findDefinition;
    derived(path: string): {
        definition: DataDefinition;
        params: Record<string, string>;
        relativeTokens: readonly PathToken[];
    } | undefined;
    private findDerived;
    sources(path: string, members?: boolean): Source[];
    private findSources;
    rootDataset(root: string): boolean;
    projectionOwner(path: string, schema: z.ZodType): string;
    source(id: string): SourceDefinition;
    save(path: string): {
        definition: SaveDefinition;
        params: Record<string, string>;
        field: undefined;
    } | {
        definition: {
            draft?: boolean;
            label?: string;
            input?: import("./schema").InputCodec<unknown, unknown>;
            debounceMs?: number;
            after?: (context: Pick<import("./schema").DataContext, "params">) => readonly string[];
            requires?: (context: Pick<import("./schema").DataContext, "params">) => readonly string[];
            validate?: (context: import("./schema").WriteContext) => void | Promise<void>;
            source: string;
            paths?: readonly string[];
            fields?: readonly string[] | Record<string, true | import("./schema").EditOptions>;
        };
        params: Record<string, string>;
        field: string;
    } | undefined;
    operation(path: string): {
        definition: MutationDefinition;
        params: Record<string, string>;
    };
    children(path: string): DataDefinition[];
    diagnostics(): {
        path: string;
        source: string;
    }[];
    dispose(): void;
}
