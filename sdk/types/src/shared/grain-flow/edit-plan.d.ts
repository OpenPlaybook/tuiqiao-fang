import type { GrainFlow } from './core';
export type EditPlan = {
    fields: readonly {
        path: string;
        value: unknown;
        owner?: object;
    }[];
    action?: unknown;
};
/** Persists field input before creating its target; remote outcomes stay in W. */
export declare function createEditPlan(flow: GrainFlow, actionPath: string): {
    change: (plan: EditPlan | (() => EditPlan | Promise<EditPlan>)) => Promise<void>;
    input: () => unknown;
    settle: () => Promise<void>;
    retry: () => Promise<void>;
    discard: () => Promise<void>;
    flush(scopes: readonly string[], options?: {
        all?: boolean;
        authoredOnly?: boolean;
    }): Promise<void>;
};
